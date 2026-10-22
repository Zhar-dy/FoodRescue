"""Train a reproducible synthetic-only demand model; Python is not a web service."""

import argparse
import hashlib
import json
import random
from datetime import date
from pathlib import Path

import numpy as np
import sklearn
from sklearn.metrics import mean_absolute_error
from sklearn.tree import DecisionTreeRegressor

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/synthetic-sales.json"
FEATURES = ["minutesUntilClosing", "weekday", "salesSoFar"]
SEED = 42


def build_snapshots(history):
    """Allocate hourly sales to two halves, then use only observed sales as input."""
    rng = random.Random(SEED)
    rows = []
    days = history["dailyData"]
    dates = [day["date"] for day in days]
    if dates != sorted(set(dates)) or len(days) != 180:
        raise ValueError("Expected 180 distinct chronological synthetic days.")
    for day in days:
        halves = []
        for hour in range(9, 21):
            sales = day["hourlySales"][str(hour)]
            first_half = sum(rng.random() < 0.5 for _ in range(sales))
            halves.extend([first_half, sales - first_half])
        weekday = (date.fromisoformat(day["date"]).weekday() + 1) % 7
        for minute in range(17 * 60, 21 * 60, 30):
            elapsed = (minute - 9 * 60) // 30
            observed = sum(halves[:elapsed])
            remaining = sum(halves[elapsed:])
            assert observed + remaining == sum(day["hourlySales"].values())
            rows.append({
                "date": day["date"], "minute": minute,
                "features": [21 * 60 - minute, weekday, observed],
                "target": remaining,
            })
    return rows


def arrays(rows):
    return np.asarray([r["features"] for r in rows]), np.asarray([r["target"] for r in rows])


def baseline_predictions(training, evaluation):
    """Fair comparator: training-days-only average remaining sales at each time."""
    by_time = {}
    for row in training:
        by_time.setdefault(row["minute"], []).append(row["target"])
    return [float(np.mean(by_time[row["minute"]])) for row in evaluation]


def train():
    source_bytes = SOURCE.read_bytes()
    history = json.loads(source_bytes)
    rows = build_snapshots(history)
    dates = [day["date"] for day in history["dailyData"]]
    fitting = [r for r in rows if r["date"] < dates[120]]
    validation = [r for r in rows if dates[120] <= r["date"] < dates[150]]
    training = [r for r in rows if r["date"] < dates[150]]
    testing = [r for r in rows if r["date"] >= dates[150]]
    x_fit, y_fit = arrays(fitting)
    x_val, y_val = arrays(validation)
    choices = []
    for depth in (3, 4, 5, 6):
        for leaf in (12, 24, 48):
            candidate = DecisionTreeRegressor(max_depth=depth, min_samples_leaf=leaf, random_state=SEED)
            candidate.fit(x_fit, y_fit)
            choices.append((float(mean_absolute_error(y_val, candidate.predict(x_val))), depth, leaf))
    validation_mae, depth, leaf = min(choices)
    model = DecisionTreeRegressor(max_depth=depth, min_samples_leaf=leaf, random_state=SEED)
    x_train, y_train = arrays(training)
    x_test, y_test = arrays(testing)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    model_mae = float(mean_absolute_error(y_test, predictions))
    baseline_mae = float(mean_absolute_error(y_test, baseline_predictions(training, testing)))
    tree = model.tree_
    feature_ranges = {name: {"min": int(x_train[:, i].min()), "max": int(x_train[:, i].max())} for i, name in enumerate(FEATURES)}
    evaluation = {
        "scope": "Synthetic held-out days only; not real merchant accuracy",
        "metric": "Mean absolute error in remaining regular-price sales, before rounding or stock clipping",
        "trainingDays": 150, "testDays": 30,
        "trainingSnapshots": len(training), "testSnapshots": len(testing),
        "trainingDateRange": [dates[0], dates[149]], "testDateRange": [dates[150], dates[-1]],
        "tuning": {"fitDays": 120, "validationDays": 30, "validationMAE": validation_mae},
        "modelMAE": model_mae, "baselineMAE": baseline_mae,
        "beatsBaseline": model_mae < baseline_mae,
    }
    exported = {
        "version": 1, "modelId": "bakery-decision-tree-v1", "modelType": "DecisionTreeRegressor",
        "trainingLibrary": "scikit-learn " + sklearn.__version__, "seed": SEED,
        "sourceSHA256": hashlib.sha256(json.dumps(history, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest(),
        "productId": "product-001", "features": FEATURES,
        "supportedMinutes": [17 * 60, 21 * 60], "stepMinutes": 30,
        "featureRanges": feature_ranges,
        "parameters": {"maxDepth": depth, "minSamplesLeaf": leaf},
        "snapshotAssumption": "Each hourly synthetic sale assigned independently to first or second half with probability0.5 using Python random seed42",
        "childrenLeft": tree.children_left.tolist(), "childrenRight": tree.children_right.tolist(),
        "feature": tree.feature.tolist(), "threshold": tree.threshold.tolist(),
        "value": tree.value[:, 0, 0].tolist(), "evaluation": evaluation,
        "baselineByMinutesLeft": {str(minute): float(np.mean([r["target"] for r in training if r["features"][0] == minute])) for minute in range(30, 241, 30)},
    }
    cases = [{**row, "pythonPrediction": float(prediction)} for row, prediction in zip(testing, predictions)]
    return model, exported, cases


def write_or_check(path, value, check):
    content = json.dumps(value, indent=2, allow_nan=False) + "\n"
    if check:
        if not path.exists() or path.read_text(encoding="utf-8") != content:
            raise ValueError(f"Artifact differs: {path.relative_to(ROOT)}. Retrain with pinned requirements.")
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    _, artifact, cases = train()
    write_or_check(ROOT / "data/models/surplus-tree.json", artifact, args.check)
    write_or_check(ROOT / "ml/parity-cases.json", cases, args.check)
    print(json.dumps(artifact["evaluation"], indent=2))

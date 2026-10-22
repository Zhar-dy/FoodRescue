# Trained forecasting model

## What learns and what remains rules

`ml/train_model.py` fits scikit-learn's DecisionTreeRegressor on synthetic sales
snapshots. Its target is remaining regular-price sales before21:00. Inputs are
minutes until closing, weekday (Sunday0), and sales already observed that day.
The unobserved future sales are the training label, never an inference input.
Physical stock clips the rounded forecast; leftovers = stock - expected sales.

`lib/prediction/tree.ts` evaluates learned thresholds from
`data/models/surplus-tree.json`. It is not a hand-written discount rule tree.
`lib/prediction/index.ts` connects it to the existing Product/Prediction contract.
`lib/ai/recommendation.ts` still uses explicit30%/50% discount rules and assumed
82% sell-through. Publication remains manual. There is no automatic retraining.

## Data and split

Source:180 generated days,2026-04-01 through2026-09-27,2160 hourly observations
for Chocolate Bun at one hypothetical bakery. Seed42. Opening stock105–135;
documented weekday, daily and hourly variation; every sale is stock-capped.

Training requires half-hour snapshots: Python seed42 allocates each hourly sale
independently to the first or second half with probability0.5. This is an extra
simulation assumption, not additional observed transaction data. Eight snapshots
per day cover17:00–20:30:1440 snapshots from180 days, not1440 independent days.

First120 days fit candidates; next30 days select depth/minimum leaf size.
The selected model is refitted on the first150 days (1200 snapshots).
The last30 days (240 snapshots) are held out by date and never used for tuning.
Training dates:2026-04-01–2026-08-28; test dates:2026-08-29–2026-09-27.

## Measured synthetic holdout results

- Decision-tree MAE:2.3046367452 items.
- Time-average baseline MAE:2.8490555556 items.
- Metric: absolute error in remaining regular sales, before rounding/stock clipping.
- Baseline averages use training days only, at the matching snapshot time.
- Parameters selected on validation: maximum depth6, minimum leaf12.

These results apply to generated examples only. They are not accuracy
percentages, confidence intervals or evidence of real waste reduction.
The same assumptions generate training and testing data, so a real pilot remains
necessary. Stock-capped sales do not measure unmet customer demand.

## Runtime and safety

The model is exported to JSON, not a Python API. No extra Vercel environment
variables are needed. Python is used offline for reproducible training only.
Supported demo times17:00–21:00 on half-hour boundaries; closing21:00 disables
new offers. Sales outside the observed training range40–107 trigger an explicitly
labelled training-average fallback. Missing forecasting fields in older saved
products receive documented defaults; existing offers/reservations are preserved.

Default:date2026-10-22, time19:30, sales72, stock18. The learned raw estimate
is7.5833, rounded to8 regular sales and10 leftovers. Do not force the older11
leftovers example into the trained output. Sales100 yields7 sales/11 leftovers.
At20:30 with sales72 the model rounds to2 sales.

## Reproduce

Install `ml/requirements.txt` in a Python virtual environment. Run:
`python ml/train_model.py`, then `python ml/train_model.py --check`.
The latter verifies exact artifact/parity output with the pinned environment.
The source hash uses canonical JSON, independent of Windows line endings.
`npm test` checks all240 exported Python/TypeScript predictions within1e-12,
input bounds, legacy defaults, fallback, closed time and the full rescue flow.
See [the walkthrough](ml-guide.md) for commands and learning checkpoints.

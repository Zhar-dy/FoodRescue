import copy
import json
import unittest

from train_model import SOURCE, build_snapshots


class TrainingDataTests(unittest.TestCase):
    def test_future_sales_are_not_inputs(self):
        history = json.loads(SOURCE.read_text())
        rows = build_snapshots(history)
        changed = copy.deepcopy(history)
        changed["dailyData"][0]["hourlySales"]["20"] += 5
        next_rows = build_snapshots(changed)
        self.assertEqual(rows[0]["features"], next_rows[0]["features"])
        self.assertEqual(rows[0]["target"] + 5, next_rows[0]["target"])

    def test_grouped_chronological_split(self):
        history = json.loads(SOURCE.read_text())
        rows = build_snapshots(history)
        cutoff = history["dailyData"][150]["date"]
        training = [row for row in rows if row["date"] < cutoff]
        testing = [row for row in rows if row["date"] >= cutoff]
        self.assertEqual(len(training), 1200)
        self.assertEqual(len(testing), 240)
        self.assertTrue(set(row["date"] for row in training).isdisjoint(row["date"] for row in testing))
        self.assertLess(max(row["date"] for row in training), min(row["date"] for row in testing))


if __name__ == "__main__":
    unittest.main()

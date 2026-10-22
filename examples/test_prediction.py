import unittest

from prediction import calculate_food_rescue_prediction as predict


class PredictionExampleTests(unittest.TestCase):
    def test_bakery_demo(self):
        result = predict("Bakery A", 18, 21, 19, 3.5)
        self.assertEqual(result["predicted_normal_sales"], 7)
        self.assertEqual(result["predicted_surplus"], 11)
        self.assertEqual(result["recommended_quantity"], 11)
        self.assertEqual(result["recommended_discount"], "50%")

    def test_smaller_surplus_uses_thirty_percent(self):
        result = predict("Bakery A", 10, 21, 19, 3.5)
        self.assertEqual(result["predicted_surplus"], 3)
        self.assertEqual(result["recommended_discount"], "30%")

    def test_high_demand_cannot_exceed_stock(self):
        result = predict("Bakery A", 18, 21, 19, 100)
        self.assertEqual(result["predicted_normal_sales"], 18)
        self.assertEqual(result["predicted_surplus"], 0)
        self.assertEqual(result["recommended_quantity"], 0)
        self.assertEqual(result["recommended_discount"], "0%")

    def test_closed_store_does_not_offer_more_than_stock(self):
        for hour in (21, 22):
            with self.subTest(hour=hour):
                result = predict("Bakery A", 18, 21, hour, 3.5)
                self.assertEqual(result["predicted_normal_sales"], 0)
                self.assertEqual(result["predicted_surplus"], 18)
                self.assertEqual(result["recommended_quantity"], 0)
                self.assertEqual(result["recommended_discount"], "0%")

    def test_zero_stock(self):
        result = predict("Bakery A", 0, 21, 19, 3.5)
        self.assertEqual(result["predicted_surplus"], 0)
        self.assertEqual(result["recommended_discount"], "0%")

    def test_invalid_inputs(self):
        for index, values in (
            (0, ("", None)),
            (1, (-1, 1.5, True)),
            (2, (-1, 25, float("inf"))),
            (3, (-1, 25, float("nan"))),
            (4, (-1, float("inf"), "3.5")),
        ):
            for value in values:
                with self.subTest(index=index, value=value):
                    args = ["Bakery A", 18, 21, 19, 3.5]
                    args[index] = value
                    with self.assertRaises(ValueError):
                        predict(*args)


if __name__ == "__main__":
    unittest.main()

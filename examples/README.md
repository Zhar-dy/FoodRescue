# Standalone prediction example

`prediction.py` explains the bakery scenario using an assumed constant sales rate.
It is a rule-based reference, not a trained model or a service used by the website.
The live prototype uses `lib/prediction/index.ts` with synthetic hourly sales data
and `lib/ai/recommendation.ts` for offer recommendations.

The example assumes same-day closing and no overnight trading. Sales stay within
inventory; closed stores and zero surplus produce no new offer recommendation.

Run the example with `python examples/prediction.py`.
Run checks with `python -m unittest discover -s examples -p "test_prediction.py"`.

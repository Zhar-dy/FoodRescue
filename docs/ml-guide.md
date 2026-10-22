# Understand and run the ML upgrade

## 1. Run the web application

After merging the ML pull request, update your local main branch.
Run `npm ci`, `npm run dev`, and open http://localhost:3000.
You do not need Python to run the app: the trained JSON artifact is committed.

## 2. Prove the forecast responds to inputs

On Merchant click Reset demo. Check stock18, sales-so-far72, date2026-10-22,
time19:30. Click Save inventory. Open Predictions: expected regular sales8,
leftovers10, badge Trained decision tree.

Return to Merchant, set sales-so-far100, Save inventory. Predictions now shows
7 regular sales and11 leftovers. Return, set sales72/time20:30, Save inventory:
2 expected sales and16 leftovers. These are different learned tree branches.
The model need not change for every small input edit because tree leaves cover
ranges of similar examples.

Set sales0: Predictions explicitly switches to Baseline fallback because this
is outside the training sales range. Set time21:00: Recommendations disables
publishing. Reset before recording the canonical10-leftover scenario.

## 3. Understand the files

1. scripts/generate-synthetic-sales.mjs creates reproducible synthetic hourly sales.
2. ml/train_model.py creates input/label snapshots, splits dates, trains/tunes,
   evaluates against a baseline, and exports the fitted tree.
3. data/models/surplus-tree.json contains learned splits, values and evaluation.
4. lib/prediction/tree.ts traverses those learned splits in the website.
5. lib/prediction/index.ts validates inputs, invokes the model and calculates leftovers.
6. lib/demo-store.ts saves inventory and context together, before an offer exists.
7. The existing recommendation → offer → reserve → pickup → impact flow follows.

## 4. Reproduce the training yourself (Windows PowerShell)

Use a Python3.12 virtual environment with these pinned package versions:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r ml\requirements.txt
.venv\Scripts\python ml\train_model.py
.venv\Scripts\python ml\train_model.py --check
.venv\Scripts\python -m unittest discover -s ml -p test_training.py
npm test
npm run lint
npm run build
```

The last30 days remain held out. Do not change the seed/model to manufacture a
preferred test score. The committed report is the reproducible result, not a
promise about real businesses.

## 5. Finish the connected demo

Reset; publish10 items atRM6; reserve2 as resident. Available8, stock18,
rescued0 and awaiting2. Confirm pickup: available8, stock16, rescued2,
recovered offer valueRM12. Refresh and check persistence. Use one browser/origin.

Your pitch can say: “A trained decision-tree forecast evaluated on synthetic
bakery data, connected to a working food-rescue flow.” Explain that discounts
remain rules, storage is browser-local and real merchant accuracy is unverified.

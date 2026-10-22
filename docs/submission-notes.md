# FoodRescue prototype submission notes

## Problem and proposed solution

Food merchants face uncertain demand near closing time. FoodRescue combines a
surplus estimate, a rule-based discount recommendation, and a resident reservation /
merchant pickup workflow. A merchant can turn expected leftovers into an offer
while keeping the decision to publish.

The working demo connects **inventory → forecast → recommendation → offer →
reservation → collection → impact totals**. Collection is the event that counts
as rescued food and recovered offer value; predictions and uncollected
reservations are not impact claims.

## Township value and proposed pilot

- **Residents:** affordable food from nearby participating businesses.
- **Merchants:** a way to recover value from likely surplus and learn which offers work.
- **Township operator:** a potential coordination channel for participating merchants
  and residents, with collected-item reporting.

Start a small opt-in pilot with bakeries or cafés in one township. Collect real
hourly sales, closing inventory, reservations, pickups, and prices with merchant
consent. Compare forecast error against a simple baseline; track merchant and
resident adoption, pickup completion, and measured end-of-day leftovers. Explore
merchant subscription or township partnership options only after pilot demand
and operating costs are understood. No commercial traction or waste savings are
claimed yet.

## What the prototype demonstrates and what it does not

- Forecasts run a trained decision tree from180 synthetic days/2160 hourly observations.
  It is fitted on150 earlier days and tested on30 later days:MAE2.30 items,
  versus2.85 for the training-only time-average baseline. This is synthetic-only
  evaluation, not measured real merchant accuracy.
- Recommendation rules and sell-through assumptions are explicit demo choices.
  Discounts, timing and sell-through remain rules/assumptions, not trained optimization.
  There is no measured real-world accuracy or confidence percentage.
- A selectable half-hour demo clock (default **7:30 PM**), **8 PM** suggested publication, and **9 PM**
  pickup deadline keep recordings repeatable. Publication is manual; no scheduler runs.
- Merchant and resident share **browser localStorage on the same origin/profile**.
  It is not a multi-user backend and does not synchronise separate devices.
- No real authentication, payments, notifications, verified distance, food-safety
  assessment, or production concurrency guarantees are implemented.
- Revenue totals represent collected offer value. Actual payment settlement,
  food weight, carbon savings, and real waste reduction are unverified.

## AI assistance disclosure — team to review before submission

“ChatGPT/Codex assisted with implementation, code review and fixes,
documentation, and generation of synthetic demonstration data. The trained forecasting model, synthetic-only evaluation,
and recommendation rules are described in the repository. Synthetic
records are not real merchant data, and no production ML accuracy or real-world
impact is claimed. Our team is responsible for reviewing, understanding,
testing, and presenting the submitted work.”

Each member should verify that this statement accurately covers the tools used
and complete their review before submission. Clause **13.1** of the official
[terms and conditions](https://simedarbyproperty.com/universityhackathon/terms-and-conditions/)
requires disclosure of material AI tool use.

## Submission positioning

The organiser-supplied
`SDP_University_Hackathon_TOWNSHIP-OF-TOMORROW-Template.pptx`, slide **3**,
lists these deliverables:

- Required pitch deck with **at most 10 main slides**. An appendix is allowed.
- Required **five-minute video or live demo link** demonstrating the solution.
- Required **prototype, codebase, or GitHub repository link**.
- Optional supporting documents.

That slide gives the deadline as **11:59 PM, 23 October 2026**. The current
submission portal takes priority if the organiser changes the instructions.

A concise ten-slide map is: title/team, problem, target users, solution,
innovation, how it works/screenshots, impact, feasibility/limitations,
implementation/pilot, and why the team should win (**100 words or fewer**).
This covers the template's eight main areas and additional prompts.

The team still needs to supply its **team name, leader, university, member
details, email, and contact number**, review the deck, record the final video or
provide the live demo link, and verify that every submitted link opens for judges.
Do not invent these details or treat this repository as an already submitted entry.

Use the working end-to-end flow and a feasible pilot to support the published
criteria: strategic alignment **15%**, impact **25%**, innovation **20%**,
feasibility **20%**, commercial potential **10%**, and team/pitch **10%**.
Final acceptance depends on the organiser's requirements and judging; a passing
build alone does not confirm submission eligibility. Check the current
[hackathon page and submission portal](https://simedarbyproperty.com/universityhackathon/)
for required files, links, deadlines, and video format.

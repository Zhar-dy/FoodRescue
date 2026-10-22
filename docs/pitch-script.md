# Five-minute pitch and prototype recording

The organiser-supplied `SDP_University_Hackathon_TOWNSHIP-OF-TOMORROW-Template.pptx`,
slide 3, requests a **five-minute video or live demo link**. This is a suggested
five-minute recording script. Rehearse once and use the remaining time within each
segment for the screen actions. Check the current submission portal before upload.

Before recording, open the deployed website in one browser profile, reset the demo,
and prepare the team name and members' real details. Do not invent identities.

**0:00–0:35 · Problem and users — show the landing page**

“We are [team name], and this is FoodRescue. Near closing time, a township bakery
can have good food left over while nearby residents are looking for affordable
options. The merchant needs to decide whether to discount, how many items to
release, and when. Our primary users are small food merchants and township
residents. The township operator could help coordinate participating businesses.”

**0:35–1:10 · Solution and scope — show Merchant with 18 buns**

“Our prototype connects a surplus forecast with a rescue offer, reservation, and
confirmed pickup. The merchant first sees an estimate of likely leftovers and an
explanation of the suggested offer. This is a working browser demonstration.
Merchant and resident are demo roles sharing saved data in one browser. It does
not yet provide separate accounts, online payments, or a shared production backend.”

**1:10–2:00 · Data and forecast — show Predictions; demonstrate changed stock**

“Here the bakery has 18 chocolate buns at 7:30 PM and closes at 9. Our baseline
estimates seven more normal sales and 11 likely leftovers. The history covers
180 synthetic days with 2,160 hourly observations. We generated it from explicit
assumptions so the prototype is repeatable. These are not real merchant records,
and the number of rows does not prove accuracy. The current forecast uses hourly
sales averages rather than a trained machine-learning model.”

Screen actions: change stock to **10**, save, and show **3** predicted leftovers.
Show the **30%** recommendation, then return to Merchant and **Reset demo**.

“Changing inventory changes the result. A future pilot would collect real sales,
measure forecast errors, and compare more advanced models against this baseline.”

**2:00–2:45 · Recommendation — show Recommendations and publish**

“With the original 18 buns restored, the suggestion is to offer 11 at 50 percent
off: RM12 becomes RM6. The proposed launch is 8 PM, with pickup before 9 PM.
The discount follows an explicit rule based on the surplus share. Sell-through
and estimated revenue are assumptions, not guaranteed sales. The merchant keeps
control and publishes the offer. The prototype uses a fixed demo clock so the
recording remains repeatable.”

Screen actions: click **Publish rescue offer**, then open **Resident**. Physical
stock should still be **18**, with **11** offer units available.

**2:45–3:35 · Resident reservation and pickup — perform the complete flow**

“The resident can see the published offer and reserve two buns. Availability
falls from 11 to nine, but physical stock stays at 18 while the food is waiting
for pickup. The merchant sees the same reservation and confirms collection.
Physical stock then falls to 16. A reservation alone does not count as rescued
food. Collection is the event that updates the outcome.”

Screen actions: reserve **2**, open **Merchant**, confirm pickup, and show the
collected status and stock **16**. Open **Impact**.

**3:35–4:15 · Impact and township fit — show Impact**

“The demo now shows two collected items, RM12 of recovered offer value, and zero
items awaiting pickup. Residents gain access to cheaper local food, merchants
recover some value, and the township can coordinate surplus food across willing
businesses. These figures describe our demonstration, not measured community
results. We have not measured real waste reduction, food weight, or carbon
savings, and this prototype does not settle payments.”

**4:15–5:00 · Feasibility, pilot, team, and disclosure — end on the prototype**

“We propose a small opt-in pilot with township bakeries or cafés. We would collect
real sales and pickup outcomes with merchant consent, compare forecast errors,
and measure end-of-day leftovers and pickup completion. The next development
step is a shared backend with real accounts and verified merchant information.
We would explore a merchant subscription or township partnership after learning
whether users find the service useful. Our team built the connected workflow
and will explain each contribution. ChatGPT/Codex assisted our implementation,
review, documentation, and synthetic data generation. We remain responsible for
reviewing and testing the submitted work. Thank you.”

Use actual team contributions when speaking. Keep the prototype URL and code
repository visible on the final slide, and include the completed pitch deck in
the submission.

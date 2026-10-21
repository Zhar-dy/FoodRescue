# FoodRescue AI

> Predict earlier. Act earlier. Waste less.

FoodRescue AI help predicts food likely to remain unsold before closing
and recommends when, how much and at what discount merchants should
offer it to nearby residents.

## Getting Started

Clone the repository:

git clone https://github.com/Zhar-dy/FoodRescue.git

Install dependencies:

npm install

Run locally:

npm run dev

Open:

http://localhost:3000

## Before Pushing

Run:

npm run build

## Project Structure

- `app/` — pages and API routes
- `components/foodrescue/` — FoodRescue UI
- `types/foodrescue.ts` — shared interfaces
- `data/` — demo/mock data
- `lib/ai/` — recommendation engine
- `ml/` — prediction model and synthetic data

## Main Prototype Flow

Merchant stock
→ AI surplus prediction
→ AI recommendation
→ merchant publishes offer
→ resident reserves
→ merchant confirms collection

## Credit

<a href="https://shadcndashboard.dev/">Shadcn Dashboard</a>
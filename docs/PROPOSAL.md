# Final Project Proposal: Best Card Forward

**A credit card game where your wallet is your hand.**

Most credit card advice comes as tables and calculators. I built one of each for Website 1. But the real skill isn't reading a table. It's knowing, in the second before you pay, which card to pull out, and knowing at the end of the year whether a card earned back its annual fee. Best Card Forward turns that skill into a card game.

## How it plays

1. **Draft your wallet.** You start with an annual-fee budget and pick 3–5 cards from a deck of about 15 original cards. Each one is modeled on a real kind of card: a 4x dining card, a flat 2% card, a premium travel card full of monthly credits, a no-foreign-fee card, and so on. Every card has a fee, earning rates, credits and a welcome bonus.
2. **Play one year.** There are twelve rounds, one per month, and each month takes place in a real city. Purchases are dealt from real businesses near you, pulled live from OpenStreetMap: a ramen shop in Tokyo, a gas station in St. Louis. You drag a card onto the payment terminal to pay. Along the way you deal with monthly credits that expire if you don't use them, welcome-bonus spending goals that work like quests, and foreign transaction fees in months abroad, priced at live exchange rates.
3. **Read your statement.** At the end of the year, a receipt-style statement prints out. It shows points earned, credits used and wasted, fees paid and net value for each card. It replays the purchases where a different card would have done better, and ends with a "keep or cancel" verdict for every card.

## APIs

- **OpenStreetMap Overpass API:** real nearby merchants, sorted into spending categories (dining, groceries, gas, travel).
- **Frankfurter API:** live exchange rates for purchases made abroad.
- **Wikipedia REST API:** a postcard photo and short intro for each month's city.
- **Geolocation API (optional):** a "play in my neighborhood" mode.
- **localStorage:** best scores and saved wallets.

None of these need a key, so they work on GitHub Pages. A bundled set of merchants takes over if Overpass is slow or down.

## Interactivity

Drag-and-drop payment (click and keyboard work too), cards that flip to show their benefits, tilt and foil effects on hover, a tap-to-pay animation on the terminal, a receipt that prints line by line, statement rows that expand, and a draft screen with live fee totals.

## Visual design

Every card is drawn in pure CSS, with metal and foil finishes, an EMV chip and embossed numbers. A payment terminal and a thermal-paper receipt anchor the interface. On phones, your hand fans out along the bottom of the screen.

## Tech

React (built with Vite), hand-written CSS with custom properties, deployed to GitHub Pages. No login and no email collection.

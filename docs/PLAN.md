# Best Card Forward: Build Plan

> **In one sentence:** pick a wallet of credit cards, spend one year at real businesses in real cities, and find out whether your cards earned their annual fees.
>
> *"You paid $395 in fees and got $612 back. The Gourmand card earned its keep. The Jetsetter didn't."*

**Due date:** ____ (fill this in; the weekly milestones in §11 count back from it)

---

## 1. What the game is about

Card comparison sites give you a table and expect you to do the rest. Two skills actually matter:

1. **At the register:** which card do I pull out *for this purchase*?
2. **At the end of the year:** did this card earn back its fee, given how I *actually* spent?

The game teaches both by making you do them. You can't skip ahead to the answer. The statement at the end shows you what your choices really cost.

**Signature moments (what the grader should remember):**
- Dragging a card onto the payment terminal and watching it "tap."
- Monthly credits tearing off and blowing away at month end if you didn't use them.
- The year-end receipt printing line by line, then a stamped **KEEP / CANCEL** on each card.

---

## 2. How a game flows

```
Title ─► Choose mode ─► Draft wallet ─► 12 months (play) ─► Statement ─► Play again / share seed
                          (or pick a preset)   │
                                               └─ between months: city postcard + month recap
```

### Modes
| Mode | What changes |
|---|---|
| **Draft** (main) | Pick 3–5 cards from the deck, with a total annual-fee budget (e.g. $600). |
| **Preset wallets** | "The Student", "The Foodie", "The Road Warrior". Lets the grader jump straight in. |
| **My neighborhood** | Geolocation → home months use businesses actually near the player. |
| **Seeded game** | `?seed=` in the URL deals the same year to everyone, so you can share a challenge. |

### One month
1. **Postcard:** city name, Wikipedia photo and blurb, local currency and exchange rate.
2. **Purchases are dealt one at a time** (about 6 per month, ~70 per year), shown as a ticket: merchant, category, amount in local currency (and USD).
3. **The player pays** by dragging a card to the terminal (or clicking a card and then **Pay**, or pressing keys `1`–`5`).
4. **The terminal responds:** points earned, credit applied, FX fee charged, welcome-bonus progress.
5. **Month end:** unused monthly credits tear off and count as wasted; a short recap appears.

---

## 3. Game rules (all in pure functions)

All money is tracked in USD cents to avoid floating-point errors.

| Rule | How it works |
|---|---|
| **Earning** | `amountUSD × multiplier[category] × pointValue`. Categories not listed earn the card's base rate. |
| **Caps** | A bonus category can have an annual spend cap (e.g. 4x on groceries up to $25k). Above the cap it earns the base rate. |
| **Credits** | `{ amount, period: "monthly" \| "annual", category }`. Applied automatically when you pay an eligible purchase with that card, up to what's left. Unused monthly credits expire at month end. |
| **Annual fee** | Charged when the game starts (month 1). |
| **Welcome bonus** | Spend X within the first N months → bonus points. Shown as a quest meter on the card. |
| **Foreign transaction fee** | 3% of the USD amount when the purchase isn't in USD and the card charges the fee. |
| **Point value** | Each card's currency has a fixed cents-per-point value (cash back = 1.0¢; transferable points ≈ 1.25–1.5¢). Shown in the UI. |

### Scoring
- **Net value** = rewards + credits used + bonus value − annual fees − FX fees.
- **Baseline:** what a no-fee 1.5% card would have earned on the same purchases.
- **Hindsight best:** for each purchase, the best card you held *at that moment* (a greedy choice that respects caps and remaining credits). The statement lists your 5 most expensive misses.
- **Verdict for each card:** (what the card earned − its fee) compared with what the baseline card would have earned on the purchases you put on it → **KEEP**, **DOWNGRADE** (worth it without the fee) or **CANCEL**.

> Write these as small pure functions in `src/game/rules.js` and check them by hand on a few made-up purchases before building any UI. This is the part that has to be right.

---

## 4. The card deck (your work, not AI's)

About 15 **original** cards, each modeled on a real kind of card. Use made-up names and original art, with no real bank names or logos. Each card is a **type**, and the deck should cover all of these:

| Type | The decision it creates |
|---|---|
| Flat 2% no-fee | A safe default that's never the best |
| Dining / grocery 4x, mid fee, monthly credits | Worth it only if you use the credits |
| Premium travel, high fee, lots of credits | Can win big or lose big |
| Rotating 5% category (changes by quarter) | Rewards paying attention |
| No foreign fee travel card | Matters only in months abroad |
| Gas / transit 3x | Narrow but strong |
| Airline co-brand (bonus on flights, free bag value) | Specialist |
| Hotel co-brand (free night certificate) | A credit worth a lot, but hard to use |
| Store card (5% at one kind of merchant) | Tempting, very narrow |
| Student card (low earn, no fee) | Starter |

Shape of each entry in `cards.json`:
```json
{
  "id": "gourmand",
  "name": "The Gourmand",
  "issuer": "Larder & Co.",
  "finish": "metal-gold",
  "annualFee": 32500,
  "currency": "pantry-points",
  "pointValue": 1.3,
  "baseRate": 1,
  "multipliers": { "dining": 4, "groceries": 4, "flights": 3 },
  "caps": { "groceries": 2500000 },
  "credits": [{ "label": "$10 monthly dining", "amount": 1000, "period": "monthly", "category": "dining" }],
  "welcome": { "spend": 400000, "months": 3, "points": 60000 },
  "foreignFee": false,
  "blurb": "For people who would eat out anyway."
}
```

Your Website 1 research (Sapphire Preferred, Amex Gold, Strata Premier) is the source material. Change the numbers enough that the cards are clearly your own creations, and balance them so no single card always wins. **Playtesting this balance is a real milestone (§11).**

---

## 5. APIs

| API | Type | Role | Failure handling |
|---|---|---|---|
| **Overpass (OpenStreetMap)** | Data | Real named businesses near each month's city, sorted into categories by their OSM tags | Bundled snapshot per city (`public/data/merchants/<city>.json`). The player sees no error, just a small "offline deck" tag. |
| **Frankfurter** | Data | USD → local-currency rates, fetched once at game start | Bundled snapshot of rates with its date shown ("rates from Nov 2026") |
| **Wikipedia REST** | Data | City photo and blurb for the postcard | A postcard made only of type, with the city name in a large stamp |
| **Geolocation** | Browser | "My neighborhood" mode | Only asks when the player clicks. If denied, the player picks a home city from a list instead. |
| **Web Share → Clipboard** | Browser | Share a seed or a final score | Clipboard, then a "Copied" toast |
| **localStorage** | Browser | Best scores, last wallet, settings | Wrapped in try/catch; the game works without it |

All keyless and CORS-friendly, so they work on GitHub Pages.

### Overpass details
- Endpoint: `https://overpass-api.de/api/interpreter` (POST, `data=` body). If that fails, try one mirror before using the bundled file.
- Query: named nodes within ~1.5 km of the city center with `amenity` ∈ {restaurant, cafe, fast_food, bar, fuel, pharmacy, cinema}, `shop` ∈ {supermarket, convenience, clothes, electronics, department_store, books}, `tourism` ∈ {hotel, museum}. Use `[timeout:20]` and `out center 300;`.
- Category map in `categories.json`: OSM tag → game category + USD price range (e.g. `cafe → dining, $4–9`).
- **Flights aren't in OSM**, so the game creates a "Flight to Tokyo" purchase at the start of each trip month.
- **Prefetch** the next city's merchants while the current month is being played, and cache them in `sessionStorage`. Overpass can take 5–10 s, and the player should never wait on it.
- **A one-time script** (`scripts/snapshot.mjs`, run with Node) saves a merchant list for every city into `public/data/merchants/`. Those files are the fallback.

### Purchase generation
- A seeded random number generator (`mulberry32(seed)`) makes the same seed deal the same year.
- Each city has a category mix (home: groceries/gas heavy; trips: dining/hotels/transit heavy).
- Amount = a random value in the category's USD range, converted to local currency and rounded the local way (JPY to whole yen, EUR to 0.05, and so on).

---

## 6. Cities

`cities.json`: id, name, country, lat/lon, currency, Wikipedia title, category mix.

- **Home city:** St. Louis by default, or the player's location in neighborhood mode. It covers 8 of the 12 months.
- **Trips:** 4 months, picked by the seed from about 10 cities. Include at least 2 outside the US so foreign fees matter (e.g. Tokyo, Mexico City, London, Paris, Toronto), plus domestic trips (Chicago, New York, San Francisco, New Orleans).

---

## 7. Architecture

**React + Vite**, plain CSS (one stylesheet per component, or CSS Modules), no UI framework. The card art is the design, so it should be hand-built.

```
final-project/
├── index.html
├── vite.config.js            base: "/best-card-forward/"
├── public/
│   ├── data/                 cards.json, cities.json, categories.json, rates-fallback.json
│   │   └── merchants/        <city>.json fallback snapshots
│   └── favicon.svg, og-image.png
├── scripts/
│   └── snapshot.mjs          one-time Overpass → JSON fetcher
└── src/
    ├── main.jsx
    ├── App.jsx               screen switcher
    ├── state/
    │   └── gameReducer.js    useReducer: DRAFT_PICK, START, DEAL, PAY, END_MONTH, FINISH
    ├── game/                 pure, no React: easy to check by hand
    │   ├── rules.js          earn, caps, credits, fees, welcome bonus
    │   ├── deal.js           seeded RNG, purchase generation, currency rounding
    │   ├── hindsight.js      best card per purchase, verdicts
    │   └── money.js          cents formatting, Intl.NumberFormat per currency
    ├── api/
    │   ├── fetchJSON.js      timeout via AbortController, readable errors
    │   ├── overpass.js
    │   ├── rates.js
    │   └── wiki.js
    ├── components/
    │   ├── CreditCard.jsx    front/back flip, finish, chip, embossed number
    │   ├── Hand.jsx          fanned layout, drag source
    │   ├── Terminal.jsx      drop target, tap animation, readout
    │   ├── PurchaseTicket.jsx
    │   ├── CreditStub.jsx    tear-off monthly credit
    │   ├── QuestMeter.jsx    welcome bonus progress
    │   ├── Postcard.jsx
    │   ├── Receipt.jsx       statement, prints line by line
    │   └── Toast.jsx, Drawer.jsx
    ├── screens/
    │   ├── Title.jsx, Draft.jsx, Table.jsx, MonthEnd.jsx, Statement.jsx
    └── styles/
        └── tokens.css        colors, type, spacing, motion
```

**Decisions:**
- **Drag and drop:** use `@dnd-kit/core`. It handles mouse, touch and keyboard, and it's accessible. Clicking a card and then **Pay** always works as an alternative.
- **State:** one `useReducer` in `App`, passed down through context. Game logic lives in `src/game/`, never in components.
- **Animation:** CSS transitions and keyframes, plus the View Transitions API for screen changes where the browser supports it. Everything respects `prefers-reduced-motion`.
- **No backend, no login, no email.**

---

## 8. Visual design direction: "The Counter"

- **One idea:** the screen is a checkout counter seen from above. The countertop is the background, the terminal sits on the right, a receipt curls out of it, and your cards fan out at the bottom like a hand of playing cards.
- **The cards are the only strong color on screen.** The counter and UI stay muted (warm stone or laminate, ink, paper) so every card finish stands out.
- **Card finishes, all in pure CSS:** brushed metal (`repeating-linear-gradient`), foil that shifts with the pointer (a `conic-gradient` driven by custom properties set from JS), matte plastic, clear acrylic. Plus an EMV chip drawn with gradients and an embossed number using `text-shadow`.
- **Type (try and pick in week 3):** a grotesk for the UI (e.g. *Instrument Sans* or *Familjen Grotesk*), a receipt mono (*Martian Mono* or *Space Mono*), and an embossed-style face for card numbers. Avoid fonts you used in Website 2 so this site has its own identity.
- **Avoid the generic AI look:** no purple-to-blue gradients, no glassmorphism everywhere, no emoji as icons, no rounded cards with soft shadows by default. Every effect should be something a real card or receipt does.
- **Motion feels physical:** cards snap, the terminal beeps (Web Audio, muted by default), receipt paper feeds in steps, stamps land a little crooked.
- **Responsive:** on phones the counter is stacked: ticket on top, terminal in the middle, hand in a horizontal scroller at the bottom (fanned and overlapping, tap to lift a card).
- Light theme by default, with a dark "night shift" theme; all colors are tokens in `tokens.css`.

---

## 9. Interactivity checklist

- [ ] Draft screen: cards flip to show benefits; live fee-budget meter; a pick slots into your wallet
- [ ] Drag to pay, with tilt and foil sheen while dragging, and the terminal lighting up when the card hovers it
- [ ] Monthly credit stubs that tear off when unused
- [ ] Welcome-bonus quest meter that fills and celebrates on completion
- [ ] Postcard between months (opening animation, swipe/click to continue)
- [ ] Statement: receipt prints line by line, expand each card's section, "show your 5 worst misses" replay
- [ ] KEEP / CANCEL stamps
- [ ] Settings drawer: sound, reduced motion, theme, currency display (local / USD / both)
- [ ] Keyboard: `1`–`5` pick a card, `Enter` pays, `F` flips the focused card

---

## 10. Failure and edge cases

| Situation | Behavior |
|---|---|
| Overpass slow (>8 s) or failing | Use the snapshot; small "offline deck" tag on the postcard |
| Overpass returns too few merchants for a category | Fill in from the snapshot for that category |
| Frankfurter down | Snapshot rates with their date shown |
| Wikipedia missing | Type-only postcard |
| Geolocation denied or unavailable | Pick a home city from the list; nothing breaks |
| localStorage blocked | Game works; no saved scores |
| Player refreshes mid-game | The game state is saved to `sessionStorage` after each payment, and the game resumes |
| Invalid `?seed=` | Ignore it and pick a random seed |

The rule: **no error the player can see, and none in the console.**

---

## 11. Milestones

Commit at least every few days, with meaningful messages. The commit history is part of the grade.

### Week 1: foundations
- [ ] GitHub repo, Vite + React scaffold, **deploy a hello page to GitHub Pages with a GitHub Actions workflow**
- [ ] Write `cards.json` (all ~15 cards), `cities.json`, `categories.json`
- [ ] `rules.js` + `deal.js` + `hindsight.js`, checked by hand against a spreadsheet for ~10 purchases
- [ ] `scripts/snapshot.mjs`: run it, commit the fallback merchant files

### Week 2: playable but ugly
- [ ] Reducer + all five screens, unstyled
- [ ] Full loop works: draft → 12 months → statement → play again
- [ ] Live Overpass, Frankfurter and Wikipedia with fallbacks; prefetching
- [ ] **Playtest with 2–3 friends.** Is any card always best? Is a year too long? (Shorten to fewer purchases if needed.) Rebalance.

### Week 3: visual design
- [ ] Design tokens, type choices, the counter layout
- [ ] `CreditCard` finishes (metal, foil, plastic, acrylic), flip, chip, embossing
- [ ] Terminal, ticket, credit stubs, quest meter, postcard, receipt
- [ ] Drag to pay with dnd-kit, plus the animations
- [ ] Phone layout

### Week 4: the last 10%
- [ ] Polish pass, screen by screen: spacing, alignment, hover/focus/active states, empty and loading states
- [ ] Failure pass: block each API in DevTools, go offline, deny location
- [ ] Accessibility: keyboard-only playthrough, focus rings, contrast, reduced motion, screen-reader labels
- [ ] `<title>`, meta description, Open Graph image, favicon, W3C validation, Lighthouse
- [ ] README: concept, APIs, how to play, credits (OpenStreetMap ODbL attribution is required)
- [ ] Test the **deployed** site on a phone and on another computer

---

## 12. Rubric map

| Area | Where it's covered |
|---|---|
| **Originality** | A game instead of a calculator; original card deck and balance; real merchants from OSM; credits that expire; hindsight replay; keep/cancel verdicts |
| **Visual design** | Pure-CSS card finishes, the counter/terminal/receipt identity, physical motion, a phone layout that's designed rather than just squeezed |
| **Interactivity** | Drag to pay, flips, tear-offs, quest meters, printing receipt, expandable statement, keyboard play |
| **API usage** | Overpass, Frankfurter and Wikipedia shape the gameplay itself (what you buy, where, at what rate), plus Geolocation and Web Share |

---

## 13. Stretch ideas (only if ahead of schedule)

- **Daily challenge:** one shared seed per day, best score saved locally.
- **Retention offer event:** in month 12 the issuer offers points to keep a card. Accept or cancel?
- **Shareable statement image:** draw the receipt to a `<canvas>` and share it as a PNG.
- **Rotating-category calendar:** the 5% card's category changes each quarter and is shown on a flip calendar.
- **Achievements:** "Used every credit", "Never paid an FX fee", "Beat hindsight by…".

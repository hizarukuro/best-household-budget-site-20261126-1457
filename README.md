# best-household-budget-site-20261126-1457
[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/hizarukuro/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/hizarukuro/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

**HearthLedger** — a working household budget planner for a Jakarta family of four, in rupiah. It is a static site with live tools, not a picture of one: every figure is computed from the same budget state, so the pages always agree with each other.

- **Dashboard** — November 2026 at a glance: income Rp 15.000.000, spent so far, left to spend, a spending-by-category donut chart drawn from the figures, spent-vs-budget bars for all 13 categories, and the bills still outstanding.
- **Budget Planner** — the editable month: change any income or category budget and the totals, the 50/30/20 needs/wants/savings comparison and the over-budget warnings update as you type. Dining out has already run over its budget, so the warning is real.
- **Bills & Due Dates** — eight monthly bills (rent, SPP school fees, BPJS, PLN, PAM, internet, streaming, motorcycle instalment) in due-date order with paid toggles that move the "still to pay" total.
- **Savings Goals** — emergency fund, a Yogyakarta holiday and school entry fees, each with a two-way calculator: change the monthly contribution to move the finish date, or pick a finish month to see the contribution it takes.
- **Guide** — how the 50/30/20 split works, this household's own month worked out line by line in rupiah, five habits that keep the budget alive, and the payday routine.

The site is plain static files under `app/` (one job per file: `data.js`, `format.js`, `charts.js`, `views.js`, `main.js`, `style.css`), no build step, no network requests, system fonts only — it runs the same on a desktop and on a phone.

## Run it

```
node main.ts
```

That copies `app/` and `screenshots/` to the output directory (`MAKEFUN_OUTPUT_DIR`, default `/output`) and writes the `dossier.json` summary there. To browse the site itself, serve `app/` with any static file server and open `index.html`.

<sub>Entered on [make.fun](https://make.fun/?ref=c23ct4sn&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>

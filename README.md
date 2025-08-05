# Auction Analyzer (Full)

Paste a Midwest.Auction or Equip-Bid auction URL and get a table of undervalued items based on eBay SOLD prices.

## Deploy (Vercel)
1) Push this folder to GitHub (or upload via desktop).
2) In Vercel: New Project → Import the repo → Deploy.

## Local
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Notes
- Real-world reliability may require Playwright or a search API to avoid eBay throttling.
- Selectors include fallbacks; send a failing URL if you need tweaks.

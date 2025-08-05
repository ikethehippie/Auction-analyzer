# Auction Analyzer (Full)

Paste a Midwest.Auction or Equip-Bid auction URL and get a table of undervalued items based on eBay SOLD prices.

## Local
```
npm i
npm run dev
# open http://localhost:3000
```

## Deploy (Vercel)
- Import this repo on Vercel and deploy (no env vars required for the starter).
- API route: `/api/analyze`

## Notes
- eBay HTML may change or throttle requests. For production, consider Playwright or a search API + caching.

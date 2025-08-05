// at top (types)
type Lot = { lotNumber: string; title: string; currentBid: number };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const debug = req.query.debug === '1';

  // ...existing parsing/normalize...

  try {
    let lots: Lot[] = [];
    let debugInfo: any = {};

    if (auctionUrl.includes('midwest.auction')) {
      const out = await scrapeMidwest(auctionUrl, { debug });
      lots = out.items;
      debugInfo = out.debug || {};
    } else if (auctionUrl.includes('equip-bid.com')) {
      const out = await scrapeEquipbid(auctionUrl, { debug });
      lots = out.items;
      debugInfo = out.debug || {};
      if (lots.length === 0 && !/\/lots\/?$/.test(auctionUrl)) {
        const alt = auctionUrl.replace(/\/$/, '') + '/lots';
        const out2 = await scrapeEquipbid(alt, { debug });
        if (out2.items.length > 0) {
          lots = out2.items;
          debugInfo.retry = { url: alt, ...out2.debug };
        }
      }
    } else {
      return res.status(400).json({ error: 'Unsupported auction domain. Use midwest.auction or equip-bid.com' });
    }

    // …existing ebayResale loop…

    const response = { items: results as any[] };
    if (debug) (response as any).debug = debugInfo;
    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}


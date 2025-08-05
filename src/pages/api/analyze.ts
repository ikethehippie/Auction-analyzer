import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { scrapeMidwest } from '../../server/scrapers/midwest';
import { scrapeEquipbid } from '../../server/scrapers/equipbid';
import { ebayResale } from '../../server/ebay';

const bodySchema = z.object({
  auctionUrl: z.string().url()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const parse = bodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).send('Invalid input');
  const { auctionUrl } = parse.data;

  try {
    let lots: { lotNumber: string; title: string; currentBid: number; }[] = [];

    if (auctionUrl.includes('midwest.auction')) {
      lots = await scrapeMidwest(auctionUrl);
    } else if (auctionUrl.includes('equip-bid.com')) {
      lots = await scrapeEquipbid(auctionUrl);
    } else {
      return res.status(400).send('Unsupported auction domain. Try midwest.auction or equip-bid.com');
    }

    const results = [];
    for (const lot of lots) {
      const ebay = await ebayResale(lot.title);
      const resale = ebay?.resale ?? null;
      const myMaxBid = resale ? ((resale/1.15)/3)/1.15 : null;
      const undervalued = resale !== null && resale >= 55 && lot.currentBid <= resale/3;
      results.push({
        ...lot,
        resale,
        myMaxBid,
        undervalued,
        ebayUrl: ebay?.url
      });
    }

    res.status(200).json({ items: results });
  } catch (e:any) {
    console.error(e);
    res.status(500).send(e.message || 'Server error');
  }
}

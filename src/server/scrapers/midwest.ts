import * as cheerio from 'cheerio';

type Lot = { lotNumber: string; title: string; currentBid: number };

export async function scrapeMidwest(url: string, opts?: { debug?: boolean }) {
  const resp = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept': 'text/html',
      'accept-language': 'en-US,en;q=0.9'
    }
  });
  const html = await resp.text();
  const $ = cheerio.load(html);

  const items: Lot[] = [];
  const counts: Record<string, number> = {};

  $('.auction-item').each((_, el) => {
    const lotText = $(el).find('.auction-item-lot-number').text().trim();
    const title = $(el).find('.auction-item-title').text().trim();
    const bidText = $(el).find('.auction-item-price').text().trim();

    const lotNumber = (lotText.match(/\d+/)?.[0]) || '';
    const bid = parseFloat((bidText.match(/\$([\d.]+)/)?.[1] || '0'));

    if (title && lotNumber) {
      items.push({
        lotNumber,
        title,
        currentBid: isNaN(bid) ? 0 : bid
      });
    }
  });

  counts.auctionItemPass = items.length;

  const out: { items: Lot[]; debug?: any } = { items };
  if (opts?.debug) {
    out.debug = {
      htmlLen: html.length,
      counts,
      sample: items.slice(0, 3)
    };
  }
  return out;
}

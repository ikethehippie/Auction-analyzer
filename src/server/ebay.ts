import * as cheerio from 'cheerio';

/**
 * Simple eBay SOLD search scraper.
 * Returns median of first ~10-12 visible prices (rounded to nearest $1).
 */
export async function ebayResale(title: string): Promise<{ resale: number|null, url: string } | null> {
  const query = encodeURIComponent(title);
  const url = `https://www.ebay.com/sch/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1`;
  try {
    const html = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }}).then(r => r.text());
    const $ = cheerio.load(html);
    const prices: number[] = [];
    $('.s-item__price').each((_, el) => {
      const t = $(el).text();
      const m = t.replace(/[^0-9.,]/g, '').replace(/,/g, '');
      const val = parseFloat(m);
      if (!isNaN(val) && val > 0) prices.push(val);
    });
    const cleaned = prices.filter(p => p < 10000);
    cleaned.sort((a,b)=>a-b);
    const take = cleaned.slice(0, 12);
    if (take.length === 0) return { resale: null, url };
    const median = take.length % 2 === 1 ? take[(take.length-1)/2] : (take[take.length/2-1]+take[take.length/2])/2;
    const rounded = Math.round(median);
    return { resale: rounded, url };
  } catch {
    return { resale: null, url };
  }
}

import cheerio from 'cheerio';

export async function ebayResale(query: string): Promise<{ resale: number | null, url: string, samples?: number[] }> {
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&LH_Sold=1&LH_Complete=1`;

  const html = await fetch(searchUrl, {
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  }).then(r => r.text());

  const $ = cheerio.load(html);
  const prices: number[] = [];

  // ✅ Match all visible prices
  $('.s-item__price').each((_, el) => {
    const txt = $(el).text();
    const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) prices.push(num);
  });

  // De-duplicate and sort descending
  const top = [...new Set(prices)].sort((a, b) => b - a).slice(0, 3);
  const resale = top.length ? Math.round(top.reduce((a, b) => a + b, 0) / top.length) : null;

  return { resale, url: searchUrl, samples: top };
}


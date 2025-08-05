import cheerio from 'cheerio';

export async function ebayResale(query: string): Promise<{ resale: number | null, url: string, samples?: number[] }> {
  const searchUrl =
    `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&LH_Sold=1&LH_Complete=1`;

  // Fetch as server-side request
  const html = await fetch(searchUrl, {
    headers: {
      // minimal UA to reduce bot-page responses
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  }).then(r => r.text());

  const $ = cheerio.load(html);
  const prices: number[] = [];

  // 1) Modern search card selector (common)
  $('.s-item').each((_, el) => {
    const txt = $(el).find('.s-item__price').first().text();
    const n = parseFloat((txt || '').replace(/[^0-9.]/g, ''));
    if (!isNaN(n) && n > 0) prices.push(n);
  });

  // 2) Fallback: generic price nodes
  if (prices.length === 0) {
    $('.s-item__price, .s-item__detail--primary .SECONDARY_PRICE').each((_, el) => {
      const n = parseFloat($(el).text().replace(/[^0-9.]/g, ''));
      if (!isNaN(n) && n > 0) prices.push(n);
    });
  }

  // Deduplicate & sort descending; average top 3
  const uniq = [...new Set(prices)].sort((a, b) => b - a);
  const top = uniq.slice(0, 3);
  const resale = top.length ? Math.round(top.reduce((a, b) => a + b, 0) / top.length) : null;

  return { resale, url: searchUrl, samples: top };
}

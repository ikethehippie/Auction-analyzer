import * as cheerio from 'cheerio';

export async function scrapeMidwest(url: string) {
  const html = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }}).then(r => r.text());
  const $ = cheerio.load(html);

  const items: { lotNumber: string; title: string; currentBid: number; }[] = [];
  $('.auction-item, .col-md-12 .panel.panel-default, .card').each((_, el) => {
    const title = $(el).find('.auction-title, .panel-heading, .item-title, a.title, .card-title').first().text().trim() ||
                  $(el).find('a').first().text().trim();
    const lotText = $(el).find('.lot-number, .lot, .label-lot').first().text().trim();
    const lotNumber = (lotText.match(/\d+/)?.[0]) || '';
    const bidText = $(el).find('.current-bid, .bid-amount, .h4, .price, .currentBid').first().text().replace(/[^0-9.]/g, '');
    const currentBid = bidText ? parseFloat(bidText) : 0;
    if (title) items.push({ lotNumber, title, currentBid });
  });

  if (items.length === 0) {
    $('tr').each((_, tr) => {
      const tds = $(tr).find('td');
      const title = $(tds[1]).text().trim();
      const lotNumber = $(tds[0]).text().trim().replace(/[^0-9]/g, '');
      const bidText = $(tds[2]).text().replace(/[^0-9.]/g, '');
      const currentBid = bidText ? parseFloat(bidText) : 0;
      if (title) items.push({ lotNumber, title, currentBid });
    });
  }

  for (const it of items) {
    it.title = it.title.replace(/^Lot\s*\d+\s*-?\s*/i, '').trim();
  }

  return items;
}

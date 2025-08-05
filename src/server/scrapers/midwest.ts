import * as cheerio from 'cheerio';

type Lot = { lotNumber: string; title: string; currentBid: number };

export async function scrapeMidwest(url: string, opts?: { debug?: boolean }) {
  const html = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } }).then(r => r.text());
  const $ = cheerio.load(html);

  const items: Lot[] = [];
  const counts: Record<string, number> = {};

  // Try a series of likely containers
  const containers = [
    '.auction-item', '.lot', '.lot-card', '.auction-card',
    '.lot-tile', '.grid-item', '.list-group-item',
    '[data-lot-id]', '.panel.panel-default', '.card'
  ];

  const titleSel = '.lot-title, .auction-title, .item-title, .card-title, a.title, a';
  const lotSel   = '.lot-number, .lot-id, .lot-number-label, [data-lot-id]';
  const bidSel   = '.current-bid, .bid-amount, .price, .currentBid, [data-current-bid]';

  // pass 1: cards
  $(containers.join(',')).each((_, el) => {
    const $el = $(el);
    const title =
      $el.find(titleSel).first().text().trim() ||
      ($el.is('a') ? $el.text().trim() : '');

    const lotText =
      $el.find(lotSel).first().text().trim() ||
      ($el.attr('data-lot-id') || '');

    const bidText =
      $el.find(bidSel).first().text().replace(/[^0-9.]/g, '') ||
      ($el.attr('data-current-bid') || '').replace(/[^0-9.]/g, '');

    const lotNumber = (lotText.match(/\d+/)?.[0]) || '';
    const currentBid = bidText ? parseFloat(bidText) : 0;

    if (title) items.push({ lotNumber, title, currentBid });
  });
  counts.pass1 = items.length;

  // pass 2: table fallback
  if (items.length === 0) {
    $('tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 3) {
        const lotNumber = $(tds[0]).text().trim().replace(/[^0-9]/g, '');
        const title = $(tds[1]).text().trim();
        const bidText = $(tds[2]).text().replace(/[^0-9.]/g, '');
        const currentBid = bidText ? parseFloat(bidText) : 0;
        if (title) items.push({ lotNumber, title, currentBid });
      }
    });
    counts.pass2 = items.length;
  }

  // pass 3: any anchor with "Lot" text
  if (items.length === 0) {
    $('a').each((_, a) => {
      const t = $(a).text().trim();
      if (/Lot\s*\d+/i.test(t)) {
        const title = t.replace(/^Lot\s*\d+\s*[-–:]\s*/i, '').trim();
        const lotNumber = (t.match(/\d+/)?.[0]) || '';
        if (title) items.push({ lotNumber, title, currentBid: 0 });
      }
    });
    counts.pass3 = items.length;
  }

  // normalize titles
  for (const it of items) {
    it.title = it.title.replace(/^Lot\s*\d+\s*[-–:]\s*/i, '').trim();
  }

  const out: { items: Lot[]; debug?: any } = { items };
  if (opts?.debug) {
    out.debug = {
      len: html.length,
      counts,
      titleSample: items.slice(0, 5).map(i => i.title)
    };
  }
  return out;
}

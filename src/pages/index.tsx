// Triggering fresh redeploy
import { useState } from 'react';

type Row = {
  lotNumber: string;
  title: string;
  currentBid: number;
  resale: number | null;
  myMaxBid: number | null;
  undervalued: boolean;
  ebayUrl?: string;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionUrl: url })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(data.items);
    } catch (e:any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Auction Analyzer</h1>
      <p>Paste a Midwest.Auction or Equip-Bid URL and click Analyze.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.midwest.auction/... or https://www.equip-bid.com/auction/..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={analyze} disabled={loading || !url}>
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {rows && (
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Lot #</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Title</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: 8 }}>Current Bid</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: 8 }}>eBay Resale</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: 8 }}>My Max Bid</th>
                <th style={{ textAlign: 'center', borderBottom: '1px solid #ccc', padding: 8 }}>✓</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>eBay</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{r.lotNumber}</td>
                  <td style={{ padding: 8 }}>{r.title}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>${r.currentBid.toFixed(2)}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.resale ? `$${r.resale.toFixed(0)}` : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.myMaxBid ? `$${r.myMaxBid.toFixed(0)}` : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{r.undervalued ? '✅' : ''}</td>
                  <td style={{ padding: 8 }}>
                    {r.ebayUrl ? <a href={r.ebayUrl} target="_blank">open</a> : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

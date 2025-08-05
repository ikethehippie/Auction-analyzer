import type { NextApiRequest, NextApiResponse } from 'next';
import { ebayResale } from '../../server/ebay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Allow both POST (JSON body) and GET (?title=...)
    let title: string | undefined;

    if (req.method === 'POST') {
      title = (req.body && req.body.title) || '';
    } else if (req.method === 'GET') {
      title = (req.query.title as string) || '';
    } else {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Missing "title"' });
    }

    const result = await ebayResale(title.trim());
    return res.status(200).json({ title, ...result });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.ENQUIRIES_API_URL;
  if (!url) {
    return res.status(500).json({ error: 'ENQUIRIES_API_URL is not configured' });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream request failed' });
    }
    const data = await upstream.json();
    // Cache for 60 s, serve stale for 5 min while revalidating
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { streamId } = req.query;
  if (!streamId || typeof streamId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid streamId' });
  }
  try {
    const apiRes = await axios.get(
      `https://daydream.live/api/streams/${streamId}/status`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_DAYDREAM_API_KEY}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    );
    return res.status(200).json(apiRes.data);
  } catch (error: any) {
    return res.status(error?.response?.status || 500).json({ error: error?.response?.data || error.message });
  }
}

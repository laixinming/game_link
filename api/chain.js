import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const state = await kv.get('game_state') || {};
      return res.json(state);
    }

    if (req.method === 'POST') {
      const { state } = req.body;
      await kv.set('game_state', state);
      return res.json({ ok: true });
    }

    return res.status(405).end();
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}


import axios from 'axios';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ ok: true, usage: 'POST JSON { voice_id, text, [voice_settings] }' });
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { voice_id, text, voice_settings = {} } = req.body;

    if (!voice_id || !text) {
      return res.status(400).json({ error: 'voice_id and text are required' });
    }

    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVEN_API_KEY env var not set');
    }

    // Always request JSON with metadata
    const eleven = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      {
        text,
        voice_settings,
        with_metadata: true,
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        responseType: 'json',
      }
    );

    // Send a clean JSON response
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify(eleven.data));


  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({
      error: {
        code: 500,
        message: err.message || 'A server error has occurred',
      },
    });
  }
}

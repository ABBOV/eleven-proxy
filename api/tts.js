// api/tts.js  ── Vercel serverless function
import axios from 'axios';

export const config = {
  runtime: 'nodejs',        // make sure axios & fetch are available
  regions: ['iad1', 'fra1'],    // optional: pick the fastest regions
};

export default async function handler(req, res) {
  // ──────────────── Allow simple health-check ────────────────
  if (req.method === 'GET') {
    res.json({ ok: true, usage: 'POST JSON { voice_id, text [,voice_settings] }' });
    return;
  }

  // ──────────────── Only POST beyond this point ──────────────
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { voice_id, text, voice_settings = {} } = req.body;

    if (!voice_id || !text) {
      res.status(400).json({ error: 'voice_id and text are required' });
      return;
    }

    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVEN_API_KEY env var not set');
    }

    // Forward request to ElevenLabs
    const eleven = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      { text, voice_settings },
      {
        headers: {
          'xi-api-key': apiKey,
          accept: 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      },
    );

    // Stream MP3 back to caller
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(eleven.data, 'binary'));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: { code: 500, message: 'A server error has occurred' } });
  }
}

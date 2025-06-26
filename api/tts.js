// api/tts.js  (NO Express, just export a handler)
import axios from 'axios';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.json({ ok: true, usage: 'POST JSON to /tts' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  /* … existing POST logic … */
}
  const { voice_id, text, voice_settings } = req.body;

  try {
    const { data } = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      { text, voice_settings },
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_API_KEY,
          accept: 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'TTS request failed' });
  }
}

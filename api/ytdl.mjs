import { Innertube } from 'youtubei.js';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  const id = extractId(url);
  if (!id) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    const yt = await Innertube.create();
    const info = await yt.getInfo(id);

    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    if (!format) return res.status(500).json({ error: 'No audio format available' });

    const title = info.basic_info.title.replace(/[^\w\s-]/g, '') || id;
    const ext = format.mime_type?.includes('mp4') ? 'm4a' : 'webm';
    res.setHeader('Content-Type', format.mime_type || 'audio/webm');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.${ext}"`);

    const stream = await format.download();
    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();
  } catch (e) {
    const msg = e.message || String(e);
    res.status(500).json({ error: msg.slice(0, 300) });
  }
}

function extractId(str) {
  const m = str.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|v\/)([\w-]{11})/);
  return m ? m[1] : null;
}

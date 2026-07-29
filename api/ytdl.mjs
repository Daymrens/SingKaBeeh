const SERVICES = [
  id => `https://api.vevioz.com/api/button/mp3/${id}`,
  id => `https://www.yt-download.org/api/button/mp3/${id}`,
];

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  const id = extractId(url);
  if (!id) return res.status(400).json({ error: 'Invalid YouTube URL' });

  for (const buildUrl of SERVICES) {
    try {
      const apiUrl = buildUrl(id);
      const apiRes = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        redirect: 'follow',
      });
      if (!apiRes.ok) continue;
      const ct = apiRes.headers.get('content-type') || '';
      if (!ct.startsWith('audio/') && !ct.includes('octet-stream') && !ct.includes('video/')) continue;

      const buffer = await apiRes.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.mp3"`);
      return res.end(Buffer.from(buffer));
    } catch {}
  }

  res.status(500).json({ error: 'All download services failed. Try a different video.' });
}

function extractId(str) {
  const m = str.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|v\/)([\w-]{11})/);
  return m ? m[1] : null;
}

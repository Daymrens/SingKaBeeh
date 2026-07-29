import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' });
    if (!format) return res.status(500).json({ error: 'No audio format found' });

    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '');
    res.setHeader('Content-Type', format.mimeType || 'audio/webm');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.webm"`);

    const stream = ytdl(url, { format });
    stream.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

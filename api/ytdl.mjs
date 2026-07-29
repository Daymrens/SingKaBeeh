import ytdl from '@distube/ytdl-core';

const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': AGENT,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
    });
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' });
    if (!format) return res.status(500).json({ error: 'No audio format found' });

    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '');
    res.setHeader('Content-Type', format.mimeType || 'audio/webm');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.webm"`);

    const stream = ytdl(url, {
      format,
      requestOptions: {
        headers: {
          'User-Agent': AGENT,
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    });
    stream.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

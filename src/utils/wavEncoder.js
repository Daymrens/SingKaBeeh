export function encodeWAV(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = audioBuffer.length * blockAlign;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(audioBuffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      const val = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, val, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function cropAudio(audioFile, startSec, endSec) {
  return new Promise((resolve, reject) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const audioData = await ctx.decodeAudioData(e.target.result);
        const { sampleRate, length, numberOfChannels } = audioData;
        const startSample = Math.floor(startSec * sampleRate);
        const endSample = Math.min(Math.floor(endSec * sampleRate), length);
        const cropLength = endSample - startSample;
        if (cropLength <= 0) { reject(new Error('Invalid crop region')); return; }

        const newBuffer = ctx.createBuffer(numberOfChannels, cropLength, sampleRate);
        for (let c = 0; c < numberOfChannels; c++) {
          const orig = audioData.getChannelData(c);
          const dest = newBuffer.getChannelData(c);
          for (let i = 0; i < cropLength; i++) {
            dest[i] = orig[startSample + i];
          }
        }
        const wav = encodeWAV(newBuffer);
        ctx.close();
        resolve(wav);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(audioFile);
  });
}

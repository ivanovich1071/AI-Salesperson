"use client";

/**
 * Конвертация записи микрофона в WAV 16 кГц моно.
 *
 * Зачем: браузер пишет webm/opus, а провайдер Whisper на OpenRouter такой контейнер
 * не декодирует — модель «слышит тишину» и выдаёт заученные галлюцинации
 * («Продолжение следует...»). На WAV 16 кГц распознавание работает корректно.
 */

const TARGET_RATE = 16000;

/** Декодирует записанный blob и перекодирует в WAV 16 кГц моно. */
export async function blobToWav16k(blob: Blob): Promise<Blob> {
  const arrayBuf = await blob.arrayBuffer();
  const Ctx: typeof AudioContext =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  const ctx = new Ctx();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(arrayBuf);
  } finally {
    void ctx.close();
  }

  // OfflineAudioContext с 1 каналом сам сводит в моно и ресемплит до 16 кГц
  const frames = Math.max(1, Math.ceil(decoded.duration * TARGET_RATE));
  const offline = new OfflineAudioContext(1, frames, TARGET_RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();

  return encodeWav(rendered.getChannelData(0));
}

/** Средняя громкость (RMS) — чтобы не гонять тишину в Whisper и не ловить галлюцинации. */
export function rms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, samples.length));
}

/** Громкость записанного blob (после декодирования) — 0..1 */
export async function blobLoudness(wav: Blob): Promise<number> {
  const buf = await wav.arrayBuffer();
  const view = new DataView(buf);
  const n = Math.max(0, (buf.byteLength - 44) / 2);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = view.getInt16(44 + i * 2, true) / 0x8000;
  return rms(samples);
}

function encodeWav(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  str(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true); // размер fmt-блока
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // моно
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16 бит
  str(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

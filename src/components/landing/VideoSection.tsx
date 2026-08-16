"use client";

import { useEffect, useRef } from "react";

const VIDEO_SRC = "/video/vibemind-60s.mp4";
const POSTER = "/images/video-poster.jpg";

/**
 * Ролик о компании на главной.
 *
 * Экономика загрузки: `preload="none"` + постер — до того, как секция попала на
 * экран, браузер тянет одну картинку (~95 КБ), а не 4,5 МБ видео. Автозапуск
 * только на десктопе и только когда секция реально видна; на узком экране ролик
 * ждёт тапа — расходовать чужой мобильный трафик без спроса невежливо.
 *
 * Библиотек не требует: нативный <video> и IntersectionObserver.
 */
export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (narrow || calmMotion) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // play() отклоняется, если браузер не разрешил автозапуск —
            // тогда просто остаётся постер с кнопкой воспроизведения
            void el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="video" className="py-20">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center">
          <h2 className="vm-title">ВайбМайнд за 60 секунд</h2>
          <div className="vm-underline" />
          <p className="mx-auto mt-4 max-w-2xl text-graphite/70">
            Коротко о том, как мы помогаем командам внедрять ИИ в реальную работу
            организации.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-teal/15 shadow-soft">
          <video
            ref={videoRef}
            className="aspect-video w-full bg-graphite"
            src={VIDEO_SRC}
            poster={POSTER}
            preload="none"
            controls
            muted
            loop
            playsInline
            aria-label="Видеоролик о компании ВайбМайнд"
          />
        </div>

        <p className="mt-3 text-center text-xs text-graphite/60">
          Ролик идёт без звука — включите его кнопкой в плеере.
        </p>
      </div>
    </section>
  );
}

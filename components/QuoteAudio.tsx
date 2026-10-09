"use client";

import { useEffect, useRef, useState } from "react";

/** Tap-to-play button for the spoken quote. Never autoplays (browsers block it, and it annoys). */
export default function QuoteAudio({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const a = ref.current;
    return () => a?.pause();
  }, []);

  const toggle = async () => {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
      return;
    }
    try {
      a.currentTime = 0;
      await a.play();
    } catch {
      setFailed(true);
    }
  };

  if (failed) return null;

  return (
    <div className="quote-audio">
      <button
        type="button"
        className={`quote-audio__btn${playing ? " is-playing" : ""}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Stop the quote" : "Play the quote"}
      >
        <span className="quote-audio__icon" aria-hidden="true">{playing ? "■" : "▶"}</span>
        <span>{playing ? "Playing…" : "Hear the quote"}</span>
        <span className="quote-audio__wave" aria-hidden="true"><i /><i /><i /><i /></span>
      </button>
      <audio
        ref={ref}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

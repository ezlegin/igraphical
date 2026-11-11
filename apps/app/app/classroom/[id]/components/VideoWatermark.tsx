"use client";

import { useEffect, useState } from "react";

const positions = [
  { top: "8%", left: "6%" },
  { top: "8%", right: "6%" },
  { top: "45%", left: "30%" },
  { bottom: "18%", right: "8%" },
  { bottom: "18%", left: "8%" },
  { top: "28%", right: "24%" },
];

/**
 * The student's phone and national ID drifting over the video, so any
 * screen recording or leaked copy identifies who it came from.
 */
const VideoWatermark = ({ text }: { text: string }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () =>
        setI((n) => (n + 1 + Math.floor(Math.random() * 3)) % positions.length),
      9000,
    );
    return () => clearInterval(id);
  }, []);

  if (!text) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] select-none overflow-hidden"
    >
      <span
        dir="ltr"
        style={positions[i]}
        className="absolute whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[11px] font-light text-white/35 transition-all duration-[1500ms] ease-in-out [text-shadow:0_0_2px_rgba(0,0,0,0.6)] md:text-sm"
      >
        {text}
      </span>
    </div>
  );
};

export default VideoWatermark;

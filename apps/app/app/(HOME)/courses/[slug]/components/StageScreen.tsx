"use client";

import { Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

/** The course cover as a big "screen"; plays the teaser in place when there is one. */
export default function StageScreen({
  poster,
  teaserUrl,
  title,
}: {
  poster: string;
  teaserUrl?: string | null;
  title: string;
}) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-4xl"
    >
      {/* glow under the screen */}
      <div className="absolute inset-x-10 -bottom-10 -z-10 h-24 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-black p-1.5 shadow-[0_40px_120px_-50px_hsl(var(--primary)/0.8)]">
        <div className="relative aspect-video overflow-hidden rounded-[1.4rem]">
          {playing && teaserUrl ? (
            <ReactPlayer
              url={teaserUrl}
              playing
              controls
              width="100%"
              height="100%"
            />
          ) : (
            <>
              <Image
                src={poster}
                alt={title}
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-cover"
              />
              {teaserUrl && (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                  aria-label="پخش تیزر دوره"
                >
                  <span className="relative flex size-16 items-center justify-center rounded-full bg-white/90 text-black shadow-xl transition-transform group-hover:scale-105 md:size-20">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
                    <Play className="relative ms-1 size-7 fill-current md:size-8" />
                  </span>
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
                    تماشای تیزر دوره
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

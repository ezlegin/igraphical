"use client";

import Plyr, { PlyrOptions, PlyrSource } from "plyr-react";
import "plyr-react/plyr.css";
import React from "react";

interface VideoProps {
  src: string;
  poster?: string;
  /** Rendered over the video, and kept visible in fullscreen. */
  overlay?: React.ReactNode;
}

const Video: React.FC<VideoProps> = ({ src, poster, overlay }) => {
  const plyrProps: {
    source: PlyrSource;
    options: PlyrOptions;
  } = {
    source: {
      type: "video",
      poster,
      sources: [
        {
          src,
          type: "video/mp4",
        },
      ],
    },
    options: {
      blankVideo: undefined,
      speed: {
        selected: 1,
        options: [0.75, 1, 1.25, 1.5, 1.75, 2],
      },
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      settings: ["quality", "speed"],
      autoplay: true,
      // fullscreen the wrapper (not the <video>) so the overlay stays on top
      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: false,
        container: "[data-video-root]",
      },
    },
  };

  return (
    <div className="mx-auto rounded-md overflow-hidden">
      <div
        data-video-root
        className="relative aspect-video bg-black [&:fullscreen]:aspect-auto [&:fullscreen]:h-full [&:fullscreen]:w-full"
      >
        <div className="absolute inset-0">
          <Plyr {...plyrProps} />
        </div>
        {overlay}
      </div>
    </div>
  );
};

export default Video;

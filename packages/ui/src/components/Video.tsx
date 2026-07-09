"use client";

import Plyr, { PlyrOptions, PlyrSource } from "plyr-react";
import "plyr-react/plyr.css";
import React from "react";

interface VideoProps {
  src: string;
  poster?: string;
}

const Video: React.FC<VideoProps> = ({ src, poster }) => {
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
    },
  };

  return (
    <div className="mx-auto rounded-md overflow-hidden">
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0">
          <Plyr {...plyrProps} />
        </div>
      </div>
    </div>
  );
};

export default Video;

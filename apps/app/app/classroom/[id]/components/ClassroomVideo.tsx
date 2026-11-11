"use client";

import { createLessonProgress, getLessonSource } from "@/actions/classroom";
import VideoWatermark from "./VideoWatermark";
import ConfettiWrapper from "@igraph/ui/components/ConfettiWrapper";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { useLoading } from "@igraph/utils";
import { Check, Download, File } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LessonType } from "./ClassroomContent";
import dynamic from "next/dynamic";

//! REPLACE AFTER WAR
const Video = dynamic(() => import("@igraph/ui/components/Video"), {
  ssr: false,
});

interface Props {
  currentLesson: LessonType;
  courseTitle: string;
  isLastLesson: boolean;
  watermark: string;
}

const ClassroomVideo = ({ currentLesson, isLastLesson, watermark }: Props) => {
  const params = useParams();
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiRecycle, setConfettiRecycle] = useState(true);
  const [source, setSource] = useState<{
    id: number;
    url?: string;
    error?: string;
  }>();

  // Ask the server for this lesson's URL only (access + fair-use checked there).
  useEffect(() => {
    if (!currentLesson) return;
    let cancelled = false;
    setSource(undefined);
    getLessonSource(String(params.id), currentLesson.id).then((res) => {
      if (cancelled) return;
      setSource({
        id: currentLesson.id,
        url: "url" in res ? res.url : undefined,
        error: "error" in res ? res.error : undefined,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [currentLesson?.id, params.id]);

  const src = source?.id === currentLesson?.id ? source?.url : undefined;

  const handleNextLesson = async () => {
    setLoading(true);
    const classroomId = String(params.id);

    const res = await createLessonProgress(currentLesson.id, classroomId);

    if ("error" in res && res.error) {
      toast.error(res.error);
      setLoading(false);
      return;
    }

    if ("success" in res && res.success) {
      toast.success(res.success);
      setLoading(false);

      if (res.isLastLesson) {
        setShowConfetti(true);
        setTimeout(() => {
          setConfettiRecycle(false);
          setTimeout(() => {
            setShowConfetti(false);
            router.refresh();
          }, 5000);
        }, 5000);
      }

      router.refresh();
    }
  };

  const completed = currentLesson?.lessonProgress.length > 0;

  if (!currentLesson) return <div>No Lessons Provided</div>;

  return (
    <div>
      <div className="fixed top-0 right-0 z-10">
        {showConfetti && (
          <ConfettiWrapper show={showConfetti} recycle={confettiRecycle} />
        )}
      </div>
      <div className="space-y-3">
        {source?.error ? (
          <div className="aspect-video flex items-center justify-center rounded-sm bg-black/80 p-6 text-center text-sm text-white/80">
            {source.error}
          </div>
        ) : !src ? (
          <div className="aspect-video flex items-center justify-center rounded-sm bg-black">
            <Loader loading />
          </div>
        ) : currentLesson?.type === "VIDEO" ? (
          <Video
            key={currentLesson.id}
            src={src}
            overlay={<VideoWatermark text={watermark} />}
          />
        ) : currentLesson?.type === "ASSET" ? (
          <div>
            <Link
              href={src}
              className="aspect-video bg-orange-400 text-primary-foreground flex flex-col gap-3 justify-center items-center rounded-sm group"
              target="_blank"
            >
              <Download size={60} />
              <span className="text-sm">{currentLesson.title}</span>
            </Link>
          </div>
        ) : (
          <div>
            <Link
              href={src}
              className="aspect-video bg-slate-400 flex flex-col gap-3 justify-center items-center rounded-sm group"
              target="_blank"
            >
              <File className="text-muted-foreground" size={60} />
              <span className="text-sm text-muted-foreground">
                {currentLesson.title}
              </span>
            </Link>
          </div>
        )}
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-muted-foreground">
            جلسه: {currentLesson.title}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={loading || completed}
              variant={completed ? "lightGreen" : "lightPrimary"}
              onClick={handleNextLesson}
            >
              <Loader loading={loading} />
              {completed ? (
                <span className="flex items-center gap-1">
                  <Check />
                  تکمیل شده
                </span>
              ) : isLastLesson ? (
                "اتمام دوره و صدور مدرک"
              ) : (
                "تکمیل و جلسه بعد"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomVideo;

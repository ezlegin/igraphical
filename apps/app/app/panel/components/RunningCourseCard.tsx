import { placeHolder } from "@/public";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  progress: number;
  title: string;
  tutor: string;
  imageUrl?: string;
  classroomUrl: string;
  remainingLessons: number;
  /** e.g. legacy access end date, or "access ended" */
  accessNote?: { text: string; expired: boolean };
  /** shown beside the card, outside the link (e.g. the remove button) */
  action?: ReactNode;
}

const RunningCourseCard = ({
  progress,
  remainingLessons,
  title,
  tutor,
  imageUrl,
  classroomUrl,
  accessNote,
  action,
}: Props) => {
  const percent = Math.round(progress || 0);

  return (
    // The whole card is the link (stretched from the title); the action sits
    // above it so a button never ends up inside the anchor.
    <div className="group relative flex items-center gap-4 rounded-2xl border border-foreground/10 bg-background/40 p-3 transition-colors hover:border-primary/40">
      <div className="relative shrink-0 overflow-hidden rounded-xl">
        <Image
          alt={title}
          src={imageUrl || placeHolder}
          width={240}
          height={160}
          className="aspect-[3/2] w-24 object-cover transition-transform duration-500 group-hover:scale-110 md:w-32"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play size={22} className="fill-white text-white" />
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="line-clamp-1 text-sm font-semibold">
            <Link
              href={classroomUrl}
              className="after:absolute after:inset-0 after:rounded-2xl"
            >
              {title}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">{tutor}</p>
          {accessNote && (
            <p
              className={`mt-1 text-[11px] ${accessNote.expired ? "text-destructive" : "text-primary"}`}
            >
              {accessNote.text}
            </p>
          )}
        </div>

        {percent !== 100 && (
          <div className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-primary to-lime transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{remainingLessons} جلسه مانده</span>
              <span className="en-digits">{percent}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <span className="hidden rounded-full bg-primary/15 px-4 py-2 text-xs font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground md:block">
          ادامه یادگیری
        </span>
        {action && <div className="relative z-10">{action}</div>}
      </div>
    </div>
  );
};

export default RunningCourseCard;

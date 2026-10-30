import { placeHolder } from "@/public";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  progress: number;
  title: string;
  tutor: string;
  imageUrl?: string;
  classroomUrl: string;
  remainingLessons: number;
}

const RunningCourseCard = ({
  progress,
  remainingLessons,
  title,
  tutor,
  imageUrl,
  classroomUrl,
}: Props) => {
  const percent = Math.round(progress || 0);

  return (
    <Link
      href={classroomUrl}
      className="group flex items-center gap-4 rounded-2xl border border-foreground/10 bg-background/40 p-3 transition-colors hover:border-primary/40"
    >
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
          <p className="line-clamp-1 font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{tutor}</p>
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

      <span className="hidden shrink-0 rounded-full bg-primary/15 px-4 py-2 text-xs font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground md:block">
        ادامه یادگیری
      </span>
    </Link>
  );
};

export default RunningCourseCard;

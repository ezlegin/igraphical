import { placeHolder } from "@/public";
import { database } from "@igraph/database";
import Image from "next/image";
import CardBox from "../../components/CardBox";
import RestoreCourseButton from "../../components/RestoreCourseButton";

/** Courses the student removed from their active list; progress is kept. */
const ArchivedCourses = async ({ userId }: { userId: number }) => {
  const archived = await database.enrollment.findMany({
    where: { userId, archivedAt: { not: null }, completedAt: null },
    orderBy: { archivedAt: "desc" },
    include: { course: { include: { image: true } } },
  });

  if (archived.length === 0) return null;

  return (
    <CardBox title="دوره های حذف شده">
      {archived.map((e) => (
        <div
          key={e.id}
          className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-background/40 p-3"
        >
          <Image
            alt={e.course.title}
            src={e.course.image?.url || placeHolder}
            width={120}
            height={80}
            className="aspect-[3/2] w-16 shrink-0 rounded-xl object-cover opacity-70 md:w-20"
          />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold">
              {e.course.title}
            </p>
            <p className="text-[11px] text-muted-foreground">
              پیشرفت ذخیره‌شده:{" "}
              <span className="en-digits">{Math.round(e.progress)}%</span>
            </p>
          </div>
          <RestoreCourseButton courseId={e.courseId} />
        </div>
      ))}
    </CardBox>
  );
};

export default ArchivedCourses;

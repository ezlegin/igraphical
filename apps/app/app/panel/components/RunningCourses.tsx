import {
  ClassRoom,
  Course,
  Curriculum,
  Enrollment,
  Image,
  Lesson,
  LessonProgress,
  Tutor,
} from "@igraph/database";
import Link from "next/link";
import { ACTIVE_COURSE_LIMIT, subscriptionsEnabled } from "@/lib/access";
import RemoveCourseButton from "./RemoveCourseButton";
import { formatJalaliDate } from "@igraph/utils";
import CardBox from "./CardBox";
import RunningCourseCard from "./RunningCourseCard";

interface CourseType extends Course {
  enrollment: (Enrollment & { classroom: ClassRoom | null })[];
  image: Image | null;
  tutor: Tutor | null;
  curriculum: (Curriculum & {
    lessons: ((Lesson & { lessonProgress: LessonProgress[] | null }) | null)[];
  })[];
}

interface Props {
  runningCourses: CourseType[];
  showBtn?: boolean;
}

const accessNoteFor = (course: CourseType) => {
  if (!subscriptionsEnabled() || course.price === 0) return undefined;
  const e = course.enrollment[0];
  if (!e?.isLegacy || !e.accessEndsAt) return undefined;
  return e.accessEndsAt > new Date()
    ? { text: `دسترسی تا ${formatJalaliDate(e.accessEndsAt)}`, expired: false }
    : { text: "دسترسی به پایان رسیده — با اشتراک ادامه دهید", expired: true };
};

const RunningCourses = ({ runningCourses, showBtn }: Props) => {
  // Slots apply to subscription-era enrollments only; legacy purchases are exempt.
  const limited = subscriptionsEnabled();
  const usedSlots = runningCourses.filter(
    (c) => c.enrollment[0] && !c.enrollment[0].isLegacy,
  ).length;

  return (
    <CardBox
      title="دوره های در جریان"
      btn={
        showBtn ? { href: "/panel/courses", title: "مشاهده همه" } : undefined
      }
    >
      {runningCourses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            شما دوره در جریانی ندارید.
          </p>
          <Link
            href="/courses"
            className="rounded-full bg-primary/15 px-4 py-2 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground"
          >
            مشاهده دوره‌ها
          </Link>
        </div>
      ) : (
        runningCourses.map((course, index) => {
          const totalLessons = course.curriculum
            .flatMap((c) => c.lessons)
            .filter((l) => l?.type === "VIDEO").length;

          const completedLessons = course.curriculum.reduce((acc, curr) => {
            return (
              acc +
              curr.lessons.reduce((accLesson, lesson) => {
                const isCompletedVideo =
                  lesson?.type === "VIDEO" &&
                  lesson?.lessonProgress?.some((l) => l.completed);

                return accLesson + (isCompletedVideo ? 1 : 0);
              }, 0)
            );
          }, 0);

          const remainingLessons = totalLessons - completedLessons;

          return (
            <RunningCourseCard
              key={index}
              remainingLessons={remainingLessons}
              progress={course.enrollment[0]?.progress}
              title={course.title}
              tutor={course.tutor?.displayName!}
              imageUrl={course.image?.url}
              classroomUrl={`/classroom/${course.enrollment[0]?.classroom?.id}`}
              accessNote={accessNoteFor(course)}
              action={
                limited &&
                !showBtn &&
                course.enrollment[0] &&
                !course.enrollment[0].isLegacy ? (
                  <RemoveCourseButton
                    enrollmentId={course.enrollment[0].id}
                    title={course.title}
                  />
                ) : undefined
              }
            />
          );
        })
      )}
      {limited && !showBtn && runningCourses.length > 0 && (
        <p className="pt-1 text-[11px] text-muted-foreground">
          {usedSlots} از {ACTIVE_COURSE_LIMIT} جایگاه دوره فعال شما پر است. با
          اتمام یا حذف یک دوره، جایگاه آن آزاد می‌شود.
        </p>
      )}
    </CardBox>
  );
};

export default RunningCourses;

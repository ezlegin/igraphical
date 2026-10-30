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

const RunningCourses = ({ runningCourses, showBtn }: Props) => {
  return (
    <CardBox
      title="دوره های در جریان"
      btn={
        showBtn ? { href: "/panel/courses", title: "مشاهده همه" } : undefined
      }
    >
      {runningCourses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-sm text-muted-foreground">شما دوره در جریانی ندارید.</p>
          <Link href="/courses" className="rounded-full bg-primary/15 px-4 py-2 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground">
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
            />
          );
        })
      )}
    </CardBox>
  );
};

export default RunningCourses;

import { database } from "@igraph/database";
import CourseCard from "./CourseCard";
import DetailSection from "./DetailSection";

const RelatedCourses = async ({
  categoryName,
  currentCourseId,
}: {
  categoryName: string;
  currentCourseId: number;
}) => {
  const courses = await database.course.findMany({
    where: {
      id: { not: currentCourseId },
      status: "PUBLISHED",
      category: {
        name: categoryName,
      },
    },
    take: 3,
    include: {
      category: true,
      image: true,
      review: true,
      discount: true,
      enrollment: true,
      curriculum: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!courses.length) return;

  return (
    <DetailSection title="دوره‌های مرتبط">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>
    </DetailSection>
  );
};

export default RelatedCourses;

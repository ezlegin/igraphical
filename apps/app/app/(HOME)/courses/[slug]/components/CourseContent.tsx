import {
  ClassRoom,
  Course,
  CourseCategory,
  Curriculum,
  Discount,
  Enrollment,
  GalleryItem,
  Image as ImageType,
  Learn,
  Lesson,
  Prerequisite,
  Review,
  Tutor,
  User,
} from "@igraph/database";
import CourseCurriculum from "./CourseCurriculum";
import CourseDescription from "./CourseDescription";
import CourseTutor from "./CourseInstructor";
import CourseLearnsInCourse from "./CourseLearnsInCourse";
import CoursePrerequisite from "./CourseRequirements";
import CourseReviews from "./CourseReviews";
import CourseExercise from "./CourseSamples";
import RelatedCourses from "./RelatedCourses";

export interface CourseType extends Course {
  enrollment: (Enrollment & { classroom: ClassRoom | null })[];
  tutor: (Tutor & { image: ImageType | null }) | null;
  image: ImageType | null;
  learn: Learn[];
  review: (Review & { user: User & { image: ImageType | null } })[];
  category: CourseCategory | null;
  prerequisite: Prerequisite[];
  discount: Discount | null;
  curriculum: (Curriculum & { lessons: Lesson[] })[];
  gallery: (GalleryItem & { image: ImageType[] }) | null;
}

const CourseContent = ({ course }: { course: CourseType }) => {
  const learnsInCourse = course.learn.map((item) => item.value);
  const coursePrerequisites = course.prerequisite?.map((item) => item.value);

  const courseDescriptionItems = {
    audience: course.audience,
    needs: course.needs,
    bazaar: course.jobMarket,
  };

  const exercises = course.gallery?.image.map((item) => ({
    title: "",
    url: item.url,
  }));

  return (
    <div className="min-w-0 space-y-16">
      <CourseLearnsInCourse learnsInCourse={learnsInCourse} />

      <CourseDescription
        content={course.description}
        courseDescriptionItems={courseDescriptionItems}
      />

      <CoursePrerequisite requirements={coursePrerequisites} />

      <CourseCurriculum curriculums={course.curriculum} />

      <CourseTutor tutor={course.tutor!} />

      <CourseExercise exercises={exercises} courseTitle={course.title} />

      <CourseReviews reviews={course.review} />

      <RelatedCourses //todo. ignore render if there is no related course
        categoryName={course.category?.name!}
        currentCourseId={course.id}
      />
    </div>
  );
};

export default CourseContent;

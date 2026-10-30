import {
  Course,
  CourseCategory,
  Curriculum,
  Discount,
  Enrollment,
  Image as ImageType,
  Lesson,
  Review,
} from "@igraph/database";
import CourseTile from "../../../components/home/CourseTile";

export interface CourseType extends Course {
  image: ImageType | null;
  discount: Discount | null;
  review: Review[];
  enrollment: Enrollment[];
  curriculum: (Curriculum & { lessons: Lesson[] })[];
  category?: CourseCategory | null;
}
interface Props {
  course: CourseType;
}

const CourseCard = ({ course }: Props) => <CourseTile course={course} />;

export default CourseCard;

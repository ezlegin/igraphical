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

/** What the call-to-action buttons need to know about the visitor. */
export interface CourseCtaState {
  courseId: number;
  isLoggedIn: boolean;
  isFree: boolean;
  canStart: boolean;
  classroomId?: string;
  startingPrice: number | null;
}

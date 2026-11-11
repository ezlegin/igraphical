import { getSessionUser } from "@/data/user";
import { canAccessCourse, subscriptionsEnabled } from "@/lib/access";
import { signMediaUrl } from "@/lib/media-url";
import { getStartingPlanPrice } from "@/lib/subscription";
import { placeHolder } from "@/public";
import { database } from "@igraph/database";
import { extractSummaryFromLexical } from "@igraph/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import CourseActionBar from "./components/CourseActionBar";
import CourseCurriculum from "./components/CourseCurriculum";
import CourseDescription from "./components/CourseDescription";
import CourseFinale from "./components/CourseFinale";
import CourseTutor from "./components/CourseInstructor";
import CourseLearnsInCourse from "./components/CourseLearnsInCourse";
import CoursePrerequisite from "./components/CourseRequirements";
import CourseReviews from "./components/CourseReviews";
import CourseExercise from "./components/CourseSamples";
import CourseStage from "./components/CourseStage";
import RelatedCourses from "./components/RelatedCourses";
import type { CourseCtaState } from "./components/types";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reviews: string }>;
}

const getCourse = cache(async (slug: string, reviews?: string) => {
  const decodedSlug = decodeURIComponent(slug);

  return await database.course.findUnique({
    where: { url: decodedSlug },
    include: {
      enrollment: {
        include: {
          classroom: true,
        },
      },
      image: true,
      review: {
        take: +(reviews || 8),
        orderBy: { id: "desc" },
        include: {
          user: {
            include: { image: true },
          },
        },
      },
      curriculum: {
        include: {
          lessons: true,
        },
      },
      discount: true,
      gallery: {
        include: {
          image: true,
        },
      },
      tutor: {
        include: { image: true },
      },
      category: true,
      learn: true,
      prerequisite: true,
    },
  });
});

const page = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const { reviews } = await searchParams;

  const course = await getCourse(slug, reviews);
  if (!course) return notFound();

  // who is looking, and what can they do with this course
  const user = await getSessionUser();
  const enrollment = user
    ? await database.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id },
        include: { classroom: true },
      })
    : null;
  const isFree = course.price === 0;
  const cta: CourseCtaState = {
    courseId: course.id,
    isLoggedIn: !!user,
    isFree,
    classroomId: enrollment?.classroom?.id,
    canStart: user
      ? subscriptionsEnabled()
        ? await canAccessCourse(user.id, course, enrollment)
        : !!enrollment || isFree
      : isFree,
    startingPrice: isFree ? null : await getStartingPlanPrice(),
  };

  const lessons = course.curriculum.reduce((a, c) => a + c.lessons.length, 0);
  const hours = Math.round(course.duration / 60);
  const teaserUrl = course.tizerUrl
    ? await signMediaUrl(course.tizerUrl)
    : null;

  return (
    <div className="space-y-24 pb-32 md:space-y-32">
      <CourseStage
        course={course}
        cta={cta}
        teaserUrl={teaserUrl}
        hours={hours}
        lessons={lessons}
      />

      <div className="mx-auto max-w-5xl space-y-24 md:space-y-32">
        <CourseLearnsInCourse
          learnsInCourse={course.learn.map((l) => l.value)}
        />

        <CourseDescription
          content={course.description}
          courseDescriptionItems={{
            audience: course.audience,
            needs: course.needs,
            bazaar: course.jobMarket,
          }}
          prerequisites={
            <CoursePrerequisite
              requirements={course.prerequisite.map((p) => p.value)}
            />
          }
        />

        <CourseCurriculum curriculums={course.curriculum} />

        <CourseExercise
          courseTitle={course.title}
          exercises={course.gallery?.image.map((i) => ({
            title: "",
            url: i.url,
          }))}
        />

        {course.tutor && <CourseTutor tutor={course.tutor} />}

        <CourseReviews reviews={course.review} />

        <CourseFinale title={course.title} cta={cta} />

        {course.category && (
          <RelatedCourses
            categoryName={course.category.name}
            currentCourseId={course.id}
          />
        )}
      </div>

      <CourseActionBar
        title={course.title}
        cover={course.image?.url || placeHolder}
        cta={cta}
      />
    </div>
  );
};

export default page;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const course = await getCourse(slug);
  if (!course) return {};

  const description = extractSummaryFromLexical(course.description).slice(
    0,
    120,
  );

  return {
    title: `${course.title}`,
    alternates: { canonical: `/courses/${encodeURIComponent(course.url)}` },
    description,
    openGraph: {
      title: course.title,
      description,
      images: [
        {
          url: course.image?.url || "/og-cover.png",
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      images: [course.image?.url || "/og-cover.png"],
    },
  };
}

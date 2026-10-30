import CourseSidebar from "@/app/(HOME)/courses/[slug]/components/CourseSidebar";
import { database } from "@igraph/database";
import { extractSummaryFromLexical } from "@igraph/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import CourseContent from "./components/CourseContent";
import CourseHero from "./components/CourseHero";

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

  return (
    <div className="space-y-10 pb-20 pt-10 md:space-y-14 md:pt-16">
      <CourseHero course={course} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CourseContent course={course} />

        <CourseSidebar course={course} />
      </div>
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
    120
  );

  return {
    title: `${course.title}`,
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

import { database } from "@igraph/database";
import { Button } from "@igraph/ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CourseFilter from "./CourseFilter";
import CourseTile from "./CourseTile";
import SectionHeading from "./SectionHeading";

export default async function CoursesShowcase() {
  const [courses, categories] = await Promise.all([
    database.course.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { id: "desc" },
      include: {
        image: true,
        discount: true,
        review: true,
        enrollment: true,
        category: true,
        curriculum: { include: { lessons: true } },
      },
    }),
    database.courseCategory.findMany(),
  ]);

  return (
    <section className="space-y-12 scroll-mt-28" id="courses">
      <SectionHeading
        index="02"
        eyebrow="دوره‌های آی‌گرافیکال"
        title={
          <>
            جدیدترین دوره‌ها،
            <br />
            <span className="text-gradient">پروژه‌محور و به‌روز</span>
          </>
        }
        action={
          <Link href="/courses">
            <Button variant="outline" className="group h-12 rounded-full border-foreground/15 px-6">
              همه دوره‌ها
              <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        }
      />

      <CourseFilter
        categories={categories
          .filter((c) => courses.some((course) => course.categoryId === c.id))
          .map((c) => ({ id: c.id, name: c.name }))}
        items={courses.map((course) => ({
          id: course.id,
          categoryId: course.categoryId,
          node: <CourseTile course={course} />,
        }))}
      />
    </section>
  );
}

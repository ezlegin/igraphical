import { placeHolder, tutorPlaceholder } from "@/public";
import { calculateCourseRate, formatPriceBy3Digits } from "@igraph/utils";
import { ChevronLeft, Clock, Layers, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CourseCtaButton from "./CourseCtaButton";
import StageScreen from "./StageScreen";
import type { CourseCtaState, CourseType } from "./types";

/** Opening "stage": blurred cover backdrop, the pitch, the main action and the teaser screen. */
export default function CourseStage({
  course,
  cta,
  teaserUrl,
  hours,
  lessons,
}: {
  course: CourseType;
  cta: CourseCtaState;
  teaserUrl: string | null;
  hours: number;
  lessons: number;
}) {
  const cover = course.image?.url || placeHolder;
  const rate = calculateCourseRate(course.review);

  return (
    <section
      id="course-stage"
      className="relative isolate -mx-3 overflow-hidden px-3 pb-16 pt-8 md:pb-24 md:pt-12"
    >
      {/* backdrop: the course cover, blurred and faded into the page */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_35%,transparent_95%)]">
        <Image
          src={cover}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover opacity-25 blur-3xl"
        />
        <div className="studio-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_30%,transparent_100%)]" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <nav className="flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Link href="/courses" className="hover:text-foreground">
            دوره‌ها
          </Link>
          {course.category && (
            <>
              <ChevronLeft size={12} />
              <Link
                href={`/courses?category=${course.category.url}`}
                className="text-foreground hover:text-primary"
              >
                {course.category.name}
              </Link>
            </>
          )}
        </nav>

        <h1 className="mt-5 text-3xl font-black leading-[1.3] md:text-5xl md:leading-[1.25]">
          {course.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
          {course.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm">
          {course.tutor && (
            <Link
              href={`/tutors/${course.tutor.slug}`}
              className="group flex items-center gap-2"
            >
              <Image
                src={course.tutor.image?.url || tutorPlaceholder}
                alt={course.tutor.displayName}
                width={32}
                height={32}
                className="size-8 rounded-full object-cover ring-2 ring-primary/40"
              />
              <span className="font-medium group-hover:text-primary">
                {course.tutor.displayName}
              </span>
            </Link>
          )}
          <span className="hidden h-4 w-px bg-foreground/15 sm:block" />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Star size={15} className="fill-[#ffc928] text-[#ffc928]" />
            <span className="text-foreground">{rate}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Layers size={15} />
            {lessons} درس
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={15} />
            {hours > 0 ? `${hours} ساعت` : `${course.duration} دقیقه`}
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <CourseCtaButton cta={cta} />
          <a
            href="#curriculum"
            className="flex h-12 items-center rounded-full border border-foreground/15 bg-background/40 px-6 text-sm backdrop-blur transition-colors hover:border-foreground/30"
          >
            مشاهده سرفصل‌ها
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {cta.isFree
            ? "این دوره رایگانه؛ فقط کافیه وارد بشی."
            : cta.startingPrice
              ? `همراه با همه دوره‌ها، در اشتراک‌های آی‌گرافیکال از ${formatPriceBy3Digits(cta.startingPrice)} تومان`
              : "در اشتراک آی‌گرافیکال"}
        </p>
      </div>

      <div className="mt-12 md:mt-16">
        <StageScreen
          poster={cover}
          teaserUrl={teaserUrl}
          title={course.title}
        />
      </div>
    </section>
  );
}

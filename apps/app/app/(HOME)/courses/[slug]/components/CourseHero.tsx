import Reveal from "@/components/motion/Reveal";
import { placeHolder, tutorPlaceholder } from "@/public";
import { calculateCourseRate, formatDuration } from "@igraph/utils";
import { ChevronLeft, Clock, Layers, PlayCircle, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CourseType } from "./CourseContent";

export default function CourseHero({ course }: { course: CourseType }) {
  const lessons = course.curriculum.reduce((acc, c) => acc + c.lessons.length, 0);
  // formatDuration returns "<n> ساعت|دقیقه"; split it so the number can stay LTR
  const [durationValue, durationUnit] = formatDuration(course.duration).split(" ");
  const stats = [
    { icon: Star, value: calculateCourseRate(course.review), unit: "از ۵", label: "امتیاز", tone: "#ffc928" },
    { icon: Users, value: course.enrollment.length, unit: "نفر", label: "دانشجو", tone: "#60a5fa" },
    { icon: Layers, value: lessons, unit: "درس", label: `در ${course.curriculum.length} فصل`, tone: "#d4ff3f" },
    { icon: Clock, value: durationValue, unit: durationUnit, label: "مدت دوره", tone: "#f472b6" },
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-foreground/10">
      <div className="studio-grid studio-fade absolute inset-0 -z-10" />
      <div className="absolute -top-32 right-1/3 -z-10 h-72 w-[600px] rounded-full bg-primary/25 blur-[120px]" />

      <div className="grid items-center gap-8 p-5 md:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:p-10">
        <Reveal className="space-y-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">خانه</Link>
            <ChevronLeft size={12} />
            <Link href="/courses" className="hover:text-foreground">دوره‌ها</Link>
            {course.category && (
              <>
                <ChevronLeft size={12} />
                <Link href={`/courses?category=${course.category.url}`} className="text-primary hover:underline">
                  {course.category.name}
                </Link>
              </>
            )}
          </nav>

          <h1 className="text-3xl font-black leading-tight md:text-4xl lg:text-5xl lg:leading-[1.25]">{course.title}</h1>
          <p className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{course.summary}</p>

          {course.tutor && (
            <Link href={`/tutors/${course.tutor.slug}`} className="group inline-flex items-center gap-3">
              <Image
                src={course.tutor.image?.url || tutorPlaceholder}
                alt={course.tutor.displayName}
                width={44}
                height={44}
                className="size-11 rounded-full object-cover ring-2 ring-primary/40"
              />
              <span>
                <span className="block text-[11px] text-muted-foreground">مدرس دوره</span>
                <span className="text-sm font-semibold group-hover:text-primary">{course.tutor.displayName}</span>
              </span>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-foreground/10 bg-background/50 p-3.5 backdrop-blur">
                <s.icon size={16} style={{ color: s.tone }} />
                <p className="mt-2 flex items-baseline gap-1 whitespace-nowrap">
                  <span className="en-digits text-lg font-bold">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.unit}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/40 to-[#d4ff3f]/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-foreground/10">
            <Image
              alt={course.title}
              src={course.image?.url || placeHolder}
              width={1000}
              height={667}
              priority
              className="aspect-[3/2] w-full object-cover"
            />
            {course.tizerUrl && (
              <a
                href="#course-tizer"
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100"
              >
                <PlayCircle size={64} strokeWidth={1.2} className="text-white" />
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

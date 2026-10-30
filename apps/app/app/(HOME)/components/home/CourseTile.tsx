import type { CourseType } from "../../courses/[slug]/components/CourseCard";
import { placeHolder } from "@/public";
import { calculateCourseRate, formatPriceBy3Digits } from "@igraph/utils";
import { ArrowUpLeft, Layers, PlayCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  course: CourseType & { category?: { name: string } | null };
}

export default function CourseTile({ course }: Props) {
  const lessons = course.curriculum.reduce((acc, c) => acc + c.lessons.length, 0);
  const finalPrice = course.discount
    ? course.discount.type === "PERCENT"
      ? course.price * (1 - course.discount.amount / 100)
      : course.price - course.discount.amount
    : course.price;

  return (
    <Link
      href={`/courses/${course.url}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-card/60 p-2.5 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_30px_60px_-30px_hsl(var(--primary)/0.6)]"
    >
      <div className="relative overflow-hidden rounded-[1.35rem]">
        <Image
          alt={course.title}
          src={course.image?.url || placeHolder}
          width={600}
          height={450}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          {course.category && (
            <span className="max-w-[65%] truncate whitespace-nowrap rounded-full bg-black/50 px-3 py-1 text-[11px] text-white backdrop-blur-md">
              {course.category.name}
            </span>
          )}
          {!finalPrice ? (
            <span className="whitespace-nowrap rounded-full bg-lime px-3 py-1 text-[11px] font-bold text-black">رایگان</span>
          ) : course.discount ? (
            <span className="whitespace-nowrap rounded-full bg-pink-500 px-3 py-1 text-[11px] font-bold text-white">تخفیف ویژه</span>
          ) : null}
        </div>
        <PlayCircle
          size={56}
          strokeWidth={1.2}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 text-white opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-2 pb-2 pt-4">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star size={13} className="fill-[#ffc928] text-[#ffc928]" />
            <span className="en-digits text-foreground">{calculateCourseRate(course.review)}</span>
          </span>
          <span className="size-1 rounded-full bg-foreground/20" />
          <span className="flex items-center gap-1">
            <Layers size={13} />
            {course.curriculum.length} فصل · {lessons} درس
          </span>
        </div>

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-7">{course.title}</h3>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {!finalPrice ? (
              <span className="text-lg font-bold text-lime">رایگان</span>
            ) : (
              <>
                {course.discount && (
                  <span className="block text-xs text-muted-foreground line-through">
                    {formatPriceBy3Digits(course.price)}
                  </span>
                )}
                <span className="text-lg font-bold">{formatPriceBy3Digits(finalPrice)}</span>
                <span className="mr-1 text-xs text-muted-foreground">تومان</span>
              </>
            )}
          </div>
          <span className="flex size-10 items-center justify-center rounded-full bg-foreground/5 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpLeft size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}

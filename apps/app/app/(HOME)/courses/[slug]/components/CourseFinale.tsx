import Reveal from "@/components/motion/Reveal";
import { formatPriceBy3Digits } from "@igraph/utils";
import { Check } from "lucide-react";
import CourseCtaButton from "./CourseCtaButton";
import type { CourseCtaState } from "./types";

/** Quiet closing call to action at the end of the story. */
export default function CourseFinale({
  title,
  cta,
}: {
  title: string;
  cta: CourseCtaState;
}) {
  const points = cta.isFree
    ? ["رایگان و بدون محدودیت", "مدرک پایان دوره", "شروع در یک کلیک"]
    : [
        "دسترسی به همه دوره‌ها با یک اشتراک",
        "مدرک پایان دوره قابل استعلام",
        "پرداخت امن و اقساطی",
      ];

  return (
    <Reveal>
      <section className="relative isolate py-6 text-center">
        <div className="absolute left-1/2 top-1/2 -z-10 h-48 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <p className="text-xs text-muted-foreground">آماده‌ای؟</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black leading-snug md:text-4xl">
          همین امروز <span className="text-gradient">{title}</span> رو شروع کن
        </h2>
        <div className="mt-7 flex justify-center">
          <CourseCtaButton cta={cta} />
        </div>
        {!cta.isFree && cta.startingPrice && (
          <p className="mt-3 text-xs text-muted-foreground">
            اشتراک‌ها از {formatPriceBy3Digits(cta.startingPrice)} تومان
          </p>
        )}
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <Check size={13} className="text-lime" />
              {p}
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

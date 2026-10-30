"use client";

import { Button } from "@igraph/ui/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <motion.section
      ref={ref}
      style={{ scale }}
      className="studio-noise relative isolate overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-center text-primary-foreground md:py-24"
    >
      <div className="studio-grid absolute inset-0 -z-10 opacity-40" />
      <motion.div
        aria-hidden
        style={{ rotate }}
        className="absolute -left-24 -top-24 -z-10 size-72 rounded-[4rem] border-[24px] border-white/10"
      />
      <motion.div
        aria-hidden
        style={{ rotate }}
        className="absolute -bottom-20 -right-16 -z-10 size-56 rounded-full bg-lime/90 blur-[2px]"
      />

      <p className="text-sm text-white/70">به قول خودمون: بکوب و از نو بساز!</p>
      <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl md:leading-[1.15]">
        ایده‌ات منتظر ساخته شدنه.
        <br />
        از امروز شروع کن.
      </h2>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/courses">
          <Button size="lg" className="group h-14 rounded-full bg-white px-8 text-base text-black hover:bg-white/90 dark:bg-none">
            مشاهده دوره‌ها
            <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
          </Button>
        </Link>
        <Link href="/contact">
          <Button
            size="lg"
            variant="outline"
            className="h-14 rounded-full border-white/30 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
          >
            <MessageCircle className="size-4" />
            مشاوره رایگان
          </Button>
        </Link>
      </div>
    </motion.section>
  );
}

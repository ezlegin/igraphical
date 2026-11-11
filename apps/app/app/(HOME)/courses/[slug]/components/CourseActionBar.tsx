"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import CourseCtaButton from "./CourseCtaButton";
import type { CourseCtaState } from "./types";

const anchors = [
  { href: "#learn", label: "یاد می‌گیری" },
  { href: "#about", label: "درباره دوره" },
  { href: "#curriculum", label: "سرفصل‌ها" },
  { href: "#tutor", label: "مدرس" },
  { href: "#reviews", label: "نظرات" },
];

/** Floating bar that follows the reader once the opening stage scrolls away. */
export default function CourseActionBar({
  title,
  cover,
  cta,
}: {
  title: string;
  cover: string;
  cta: CourseCtaState;
}) {
  const [visible, setVisible] = useState(false);
  const [present, setPresent] = useState<string[]>([]);

  useEffect(() => {
    setPresent(
      anchors.map((a) => a.href).filter((h) => document.querySelector(h)),
    );
    const stage = document.getElementById("course-stage");
    if (!stage) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(!e!.isIntersecting),
      {
        rootMargin: "-120px 0px 0px 0px",
      },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-3 z-40 px-3 md:bottom-5"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-foreground/10 bg-background/80 p-1.5 ps-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <Image
              src={cover}
              alt=""
              width={44}
              height={44}
              className="size-9 shrink-0 rounded-full object-cover"
            />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold md:flex-none md:max-w-[220px]">
              {title}
            </p>
            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {anchors
                .filter((a) => present.includes(a.href))
                .map((a) => (
                  <a
                    key={a.href}
                    href={a.href}
                    className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    {a.label}
                  </a>
                ))}
            </nav>
            <CourseCtaButton cta={cta} size="sm" className="shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

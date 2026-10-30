"use client";

import { BadgeCheck, MonitorPlay, MousePointerClick, Rocket } from "lucide-react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    icon: MousePointerClick,
    title: "دوره‌ات رو انتخاب کن",
    text: "از بین دوره‌های متنوع، اونی که به هدفت نزدیک‌تره رو پیدا کن. اگه مطمئن نیستی، مشاوره رایگان بگیر.",
    tag: "انتخاب",
  },
  {
    icon: MonitorPlay,
    title: "پروژه‌محور یاد بگیر",
    text: "ویدیوهای کوتاه و بدون حاشیه، تمرین‌های عملی و پروژه‌های واقعی؛ با سرعت خودت و دسترسی دائمی.",
    tag: "یادگیری",
  },
  {
    icon: BadgeCheck,
    title: "مدرک قابل استعلام بگیر",
    text: "بعد از اتمام دوره، گواهی آی‌گرافیکال رو دریافت کن؛ گواهی‌ای که کارفرما می‌تونه آنلاین استعلامش کنه.",
    tag: "گواهی",
  },
  {
    icon: Rocket,
    title: "وارد بازار کار شو",
    text: "با نمونه‌کار قوی و مهارت واقعی، با اعتمادبه‌نفس پروژه بگیر یا استخدام شو.",
    tag: "شروع کار",
  },
];

export default function LearningPath() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <section className="space-y-14">
      <SectionHeading
        index="03"
        eyebrow="از کجا شروع کنیم؟"
        title={
          <>
            از صفر تا <span className="text-gradient">اولین پروژه</span>
            <br />
            در چهار قدم
          </>
        }
        align="center"
      />

      <div ref={ref} className="relative mx-auto max-w-4xl">
        {/* track */}
        <div className="absolute bottom-6 right-6 top-6 w-px bg-foreground/10 md:right-1/2" />
        <motion.div
          style={{ scaleY: progress }}
          className="absolute bottom-6 right-6 top-6 w-px origin-top bg-gradient-to-b from-primary via-primary to-[#d4ff3f] md:right-1/2"
        />

        <div className="space-y-10 md:space-y-16">
          {steps.map((s, i) => (
            <Step key={s.title} step={s} index={i} total={steps.length} progress={progress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({
  step,
  index,
  total,
  progress,
}: {
  step: (typeof steps)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const at = index / (total - 1);
  const lit = useTransform(progress, [Math.max(0, at - 0.15), at], [0, 1]);
  const scale = useTransform(lit, [0, 1], [0.8, 1]);
  const Icon = step.icon;
  const even = index % 2 === 0;

  return (
    <div className="relative grid items-center gap-6 pr-16 md:grid-cols-2 md:pr-0">
      <motion.span
        style={{ scale }}
        className="absolute right-0 top-0 z-10 flex size-12 items-center justify-center rounded-2xl border border-foreground/10 bg-background md:right-1/2 md:top-1/2 md:-translate-y-1/2 md:translate-x-1/2"
      >
        <motion.span style={{ opacity: lit }} className="absolute inset-0 rounded-2xl bg-primary shadow-[0_0_30px_hsl(var(--primary)/0.7)]" />
        <Icon size={20} className="relative" />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, x: even ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`studio-card p-6 md:p-8 ${even ? "md:col-start-1 md:ml-12" : "md:col-start-2 md:mr-12"}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="en-digits text-4xl font-black text-foreground/10">0{index + 1}</span>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] text-primary">{step.tag}</span>
        </div>
        <h3 className="text-xl font-bold">{step.title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p>
      </motion.div>
    </div>
  );
}

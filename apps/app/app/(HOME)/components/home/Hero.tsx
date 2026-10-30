"use client";

import {
  studentProfile1,
  studentProfile2,
  studentProfile3,
  studentProfile4,
} from "@/public";
import { Button } from "@igraph/ui/components/ui/button";
import { ArrowLeft, Layers, MousePointer2, PenTool, Play, Star } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  return (
    <section className="relative isolate -mx-3 overflow-hidden px-3 pb-10 pt-6 md:pb-20">
      {/* canvas backdrop */}
      <div className="studio-grid studio-fade absolute inset-0 -z-10" />
      <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
      <div className="absolute -left-40 top-60 -z-10 size-[380px] rounded-full bg-[#d4ff3f]/10 blur-[120px]" />

      {/* rulers */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-6 border-b border-foreground/5 md:block">
        <Ruler />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center pt-12 text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 py-1.5 pe-4 ps-1.5 text-xs backdrop-blur"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 font-semibold text-black">
            <span className="size-1.5 animate-pulse rounded-full bg-black" />
            جدید
          </span>
          <span className="text-muted-foreground">دوره طراحی رابط کاربری با فیگما ۲۰۲۵ منتشر شد</span>
        </motion.div>

        <h1 className="mt-8 text-[44px] font-black leading-[1.15] tracking-tight sm:text-6xl md:text-7xl lg:text-[88px] lg:leading-[1.1]">
          <Words text="ایده‌ها وقتی" delay={0.1} />{" "}
          <SelectionFrame>ساخته</SelectionFrame>
          <br />
          <Words text="میشن، دیده میشن!" delay={0.5} className="text-gradient" />
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease }}
          className="mt-7 max-w-2xl text-sm leading-8 text-muted-foreground md:text-lg md:leading-9"
        >
          از مبتدی تا حرفه‌ای، طراحی گرافیک رو با دوره‌های تخصصی و پروژه‌محور یاد بگیر.
          جدیدترین تکنیک‌ها و نرم‌افزارها، همه در یک‌جا.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a href="#courses">
            <Button
              size="lg"
              className="group h-14 rounded-full px-8 text-base shadow-[0_10px_40px_-10px_hsl(var(--primary))]"
            >
              شروع یادگیری
              <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
            </Button>
          </a>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-foreground/15 bg-background/40 px-7 text-base backdrop-blur"
            >
              <Play className="size-4 fill-current" />
              مشاوره رایگان
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-10 flex items-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex -space-x-3 space-x-reverse">
            {[studentProfile1, studentProfile2, studentProfile3, studentProfile4].map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
          <div className="text-start">
            <div className="flex items-center gap-1 text-foreground">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-[#ffc928] text-[#ffc928]" />
              ))}
              <span className="ms-1 en-digits font-semibold">4.9</span>
            </div>
            <p className="mt-1">بیش از ۳ هزار فارغ‌التحصیل از سال ۱۴۰۱</p>
          </div>
        </motion.div>
      </div>

      {/* floating canvas objects (desktop) */}
      <Parallax x={sx} y={sy} depth={40} className="absolute right-[1%] top-[14%] hidden 2xl:block">
        <LayersPanel />
      </Parallax>
      <Parallax x={sx} y={sy} depth={-30} className="absolute left-[1%] top-[18%] hidden 2xl:block">
        <Swatches />
      </Parallax>
      <Parallax x={sx} y={sy} depth={25} className="absolute bottom-[6%] left-[2%] hidden xl:block">
        <PenPath />
      </Parallax>
      <Parallax x={sx} y={sy} depth={-20} className="absolute bottom-[10%] right-[3%] hidden xl:block">
        <ToolDock />
      </Parallax>

      {/* multiplayer cursors */}
      <Cursor name="سارا · فتوشاپ" color="#f472b6" path={{ x: [0, 40, 10, 0], y: [0, 50, 90, 0] }} className="left-[4%] top-[42%]" />
      <Cursor name="امیر · ایلاستریتور" color="#d4ff3f" textDark path={{ x: [0, -40, -10, 0], y: [0, 40, -30, 0] }} className="right-[5%] top-[62%]" delay={1.5} />
      <Cursor name="مریم · بلندر" color="#60a5fa" path={{ x: [0, 50, 20, 0], y: [0, -30, 20, 0] }} className="left-[14%] bottom-[8%]" delay={3} />
    </section>
  );
}

function Words({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={reduce ? false : { opacity: 0, y: "0.4em", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: delay + i * 0.08, ease }}
        >
          {word}
          {i < text.split(" ").length - 1 && " "}
        </motion.span>
      ))}
    </span>
  );
}

function SelectionFrame({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block px-3">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[4px] border-2 border-primary bg-primary/10"
        initial={reduce ? false : { opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.35, ease }}
      >
        {["-top-1.5 -right-1.5", "-top-1.5 -left-1.5", "-bottom-1.5 -right-1.5", "-bottom-1.5 -left-1.5"].map(
          (pos) => (
            <span key={pos} className={`absolute size-3 rounded-[2px] border-2 border-primary bg-background ${pos}`} />
          ),
        )}
        <span className="en-digits absolute -bottom-8 left-1/2 hidden md:block -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[11px] font-medium tracking-normal text-primary-foreground">
          248 × 96
        </span>
      </motion.span>
      <motion.span
        className="relative inline-block"
        initial={reduce ? false : { opacity: 0, y: "0.4em" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Parallax({
  x,
  y,
  depth,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  className?: string;
  children: ReactNode;
}) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth);
  return (
    <motion.div style={{ x: tx, y: ty }} className={className}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.2, ease }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Cursor({
  name,
  color,
  path,
  className,
  delay = 0,
  textDark,
}: {
  name: string;
  color: string;
  path: { x: number[]; y: number[] };
  className?: string;
  delay?: number;
  textDark?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute hidden md:block ${className ?? ""}`}
      initial={{ opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, x: path.x, y: path.y }}
      transition={{
        opacity: { delay: 1.6 + delay * 0.2, duration: 0.4 },
        x: { duration: 9, repeat: Infinity, ease: "easeInOut", delay },
        y: { duration: 9, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <MousePointer2 size={22} style={{ color, fill: color }} className="-scale-x-100 drop-shadow" />
      <span
        className={`mr-4 mt-1 block whitespace-nowrap rounded-full rounded-tr-sm px-2.5 py-1 text-[11px] font-medium shadow-lg ${
          textDark ? "text-black" : "text-white"
        }`}
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </motion.div>
  );
}

function LayersPanel() {
  const layers = [
    { name: "تیتر اصلی", active: true },
    { name: "لوگو آی‌گرافیکال", active: false },
    { name: "پس‌زمینه گرادیان", active: false },
  ];
  return (
    <div className="w-52 rounded-2xl border border-foreground/10 bg-card/80 p-3 text-start text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-2 flex items-center gap-1.5 px-1 font-semibold text-muted-foreground">
        <Layers size={13} /> لایه‌ها
      </p>
      {layers.map((l) => (
        <div
          key={l.name}
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${l.active ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
        >
          <span className={`size-3 rounded-sm ${l.active ? "bg-primary" : "bg-foreground/15"}`} />
          {l.name}
        </div>
      ))}
    </div>
  );
}

function Swatches() {
  const colors = ["#7c5cff", "#d4ff3f", "#f472b6", "#60a5fa", "#fb923c"];
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card/80 p-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-start text-xs font-semibold text-muted-foreground">پالت رنگ</p>
      <div className="flex gap-1.5">
        {colors.map((c, i) => (
          <motion.span
            key={c}
            className="size-7 rounded-full ring-2 ring-background"
            style={{ backgroundColor: c }}
            whileHover={{ y: -6, scale: 1.15 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ y: { duration: 2.4, repeat: Infinity, delay: i * 0.2 } }}
          />
        ))}
      </div>
    </div>
  );
}

function PenPath() {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <svg width="200" height="110" viewBox="0 0 200 110" fill="none">
        <motion.path
          d="M10 90 C 50 10, 110 10, 120 55 S 170 100, 190 20"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1.5 }}
        />
        <line x1="50" y1="10" x2="10" y2="90" stroke="currentColor" className="text-foreground/20" strokeDasharray="3 3" />
        {[
          [10, 90],
          [120, 55],
          [190, 20],
        ].map(([cx, cy]) => (
          <rect key={cx} x={cx! - 4} y={cy! - 4} width="8" height="8" className="fill-background stroke-primary" strokeWidth="2" />
        ))}
        <circle cx="50" cy="10" r="4" className="fill-[#d4ff3f]" />
      </svg>
      <span className="absolute -left-3 -top-2 flex items-center gap-1 rounded-full bg-card px-2 py-1 text-[10px] text-muted-foreground shadow">
        <PenTool size={11} /> قلم
      </span>
    </div>
  );
}

function ToolDock() {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-foreground/10 bg-card/80 p-1.5 shadow-2xl backdrop-blur-xl">
      {[MousePointer2, PenTool, Layers].map((Icon, i) => (
        <span
          key={i}
          className={`flex size-9 items-center justify-center rounded-xl ${i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <Icon size={16} />
        </span>
      ))}
    </div>
  );
}

function Ruler() {
  return (
    <div className="flex h-full items-end overflow-hidden" dir="ltr">
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} className="relative w-6 shrink-0">
          <span className={`absolute bottom-0 left-0 w-px bg-foreground/15 ${i % 4 === 0 ? "h-3" : "h-1.5"}`} />
          {i % 4 === 0 && (
            <span className="en-digits absolute bottom-3 left-1 text-[8px] text-foreground/25">{i * 24}</span>
          )}
        </div>
      ))}
    </div>
  );
}

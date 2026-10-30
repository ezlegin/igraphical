"use client";

import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ArrowUpLeft, Box, Clapperboard, Palette, PenTool, Sparkles, Shapes, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface Category {
  name: string;
  url: string;
  count: number;
}

const looks: { icon: LucideIcon; from: string; to: string; accent: string }[] = [
  { icon: Box, from: "#f5792a", to: "#7c2d12", accent: "#fdba74" },
  { icon: Clapperboard, from: "#8b5cf6", to: "#1e1b4b", accent: "#c4b5fd" },
  { icon: Palette, from: "#ec4899", to: "#4a044e", accent: "#f9a8d4" },
  { icon: PenTool, from: "#0ea5e9", to: "#082f49", accent: "#7dd3fc" },
  { icon: Shapes, from: "#84cc16", to: "#1a2e05", accent: "#d4ff3f" },
  { icon: Sparkles, from: "#a855f7", to: "#2e1065", accent: "#e9d5ff" },
];

// bento spans for a 4-col grid; repeats if there are more categories
const spans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-2",
];

export default function CategoryBento({ categories }: { categories: Category[] }) {
  return (
    <Stagger className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((c, i) => {
        const look = looks[i % looks.length]!;
        const Icon = look.icon;
        const big = i === 0;
        return (
          <StaggerItem key={c.url} className={`${spans[i % spans.length]} ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
            <Link href={`/courses?category=${c.url}`} className="block h-full">
              <motion.div
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-foreground/10 p-5 md:p-6"
                style={{ background: `radial-gradient(120% 100% at 100% 0%, ${look.from}33, transparent 60%), linear-gradient(160deg, hsl(var(--card)), hsl(var(--background)))` }}
              >
                <motion.div
                  aria-hidden
                  className="absolute -bottom-10 -left-10 rounded-full blur-2xl"
                  style={{ background: look.from, width: big ? 260 : 140, height: big ? 260 : 140 }}
                  variants={{ rest: { opacity: 0.25, scale: 1 }, hover: { opacity: 0.5, scale: 1.3 } }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative flex items-start justify-between">
                  <span
                    className="flex size-11 items-center justify-center rounded-2xl"
                    style={{ background: `${look.from}26`, color: look.accent, boxShadow: `inset 0 0 0 1px ${look.from}55` }}
                  >
                    <Icon size={20} />
                  </span>
                  <motion.span
                    className="flex size-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/70"
                    variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -45, scale: 1.1 } }}
                  >
                    <ArrowUpLeft size={16} />
                  </motion.span>
                </div>
                {big && (
                  <motion.div
                    aria-hidden
                    className="relative mx-auto flex items-center justify-center"
                    variants={{ rest: { rotate: -8, y: 0 }, hover: { rotate: 4, y: -8 } }}
                    transition={{ type: "spring", stiffness: 120, damping: 12 }}
                  >
                    <div className="size-28 rounded-[2rem] shadow-2xl md:size-36" style={{ background: `linear-gradient(135deg, ${look.accent}, ${look.from})` }} />
                    <div className="absolute size-16 -translate-x-16 translate-y-10 rounded-full border-4 border-background bg-lime md:size-20" />
                  </motion.div>
                )}
                <div className="relative">
                  <h3 className={`font-bold ${big ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}>{c.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="en-digits">{c.count}</span> دوره
                  </p>
                </div>
              </motion.div>
            </Link>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

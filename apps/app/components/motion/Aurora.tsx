"use client";

import { motion, useReducedMotion } from "motion/react";

export default function Aurora({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const blob = (color: string, pos: string, dx: number, dy: number, d: number) => (
    <motion.div
      className={`absolute size-72 rounded-full blur-3xl opacity-25 ${color} ${pos}`}
      animate={reduce ? undefined : { x: [0, dx, 0], y: [0, dy, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: d, repeat: Infinity, ease: "easeInOut" }}
    />
  );
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}>
      {blob("bg-primary", "top-10 right-1/4", -60, 40, 12)}
      {blob("bg-blue-500", "top-40 left-1/4", 70, -30, 15)}
      {blob("bg-pink-500", "top-0 left-1/2", -40, 60, 18)}
    </div>
  );
}

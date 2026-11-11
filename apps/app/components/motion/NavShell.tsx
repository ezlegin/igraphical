"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useState, type ReactNode } from "react";

export default function NavShell({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.div
      initial={reduce ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="sticky top-3 z-50 w-full"
    >
      <div
        className={`flex justify-between max-w-screen-lg mx-auto backdrop-blur-2xl items-center border p-1.5 rounded-full transition-all duration-300 ${
          scrolled ? "bg-background/70 shadow-lg shadow-primary/10" : "bg-background/30"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

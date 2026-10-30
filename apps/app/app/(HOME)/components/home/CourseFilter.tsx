"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";

interface Props {
  categories: { id: number; name: string }[];
  items: { id: number; categoryId: number | null; node: ReactNode }[];
}

const INITIAL = 8;

export default function CourseFilter({ categories, items }: Props) {
  const [active, setActive] = useState<number | "all">("all");
  const [expanded, setExpanded] = useState(false);

  const filtered = active === "all" ? items : items.filter((i) => i.categoryId === active);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL);

  const tabs = [{ id: "all" as const, name: "همه" }, ...categories];

  return (
    <div className="space-y-8">
      <LayoutGroup id="course-tabs">
        <div className="-mx-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
          <div className="flex w-max gap-1 rounded-full border border-foreground/10 bg-card/50 p-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActive(t.id);
                  setExpanded(false);
                }}
                className={`relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-colors ${
                  active === t.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active === t.id && (
                  <motion.span
                    layoutId="course-tab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </LayoutGroup>

      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              {item.node}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length > INITIAL && (
        <div className="flex justify-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-foreground/15 px-6 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {expanded ? "نمایش کمتر" : `نمایش ${filtered.length - INITIAL} دوره دیگر`}
          </button>
        </div>
      )}
    </div>
  );
}

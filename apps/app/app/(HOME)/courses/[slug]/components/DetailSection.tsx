import Reveal from "@/components/motion/Reveal";
import type { ReactNode } from "react";

// heading + spacing for each chapter of the course page
export default function DetailSection({
  id,
  index,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-28 space-y-8">
        <div className="space-y-3">
          {(index || eyebrow) && (
            <p className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              {index && (
                <span className="en-digits rounded-full border border-foreground/10 px-2.5 py-1 text-[11px] text-lime">
                  {index}
                </span>
              )}
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-bold leading-tight md:text-3xl">
            {title}
          </h2>
        </div>
        {children}
      </section>
    </Reveal>
  );
}

import Reveal from "@/components/motion/Reveal";
import type { ReactNode } from "react";

// consistent heading + spacing for each block on the course page
export default function DetailSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-28 space-y-5">
        <h2 className="flex items-center gap-3 text-xl font-bold md:text-2xl">
          <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-[#d4ff3f]" />
          {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

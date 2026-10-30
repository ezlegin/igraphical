import Reveal from "@/components/motion/Reveal";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  stats?: { value: number | string; label: string }[];
  children?: ReactNode;
}

// shared header for inner pages, in the home page's canvas style
export default function PageHero({ eyebrow, title, description, stats, children }: Props) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-foreground/10 px-6 py-12 md:px-12 md:py-16">
      <div className="studio-grid studio-fade absolute inset-0 -z-10" />
      <div className="absolute -top-24 right-1/4 -z-10 h-64 w-[500px] rounded-full bg-primary/25 blur-[110px]" />
      <div className="absolute -bottom-24 left-10 -z-10 size-64 rounded-full bg-[#d4ff3f]/10 blur-[100px]" />

      <Reveal className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-lime" />
            {eyebrow}
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl md:leading-[1.2]">{title}</h1>
          {description && <p className="text-sm leading-7 text-muted-foreground md:text-base">{description}</p>}
          {children}
        </div>

        {stats && (
          <div className="flex gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="min-w-24 rounded-2xl border border-foreground/10 bg-background/50 px-5 py-4 text-center backdrop-blur"
              >
                <p className="en-digits text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

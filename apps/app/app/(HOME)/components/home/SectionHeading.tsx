import Reveal from "@/components/motion/Reveal";
import type { ReactNode } from "react";

interface Props {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "start" | "center";
}

export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  action,
  align = "start",
}: Props) {
  const centered = align === "center";
  return (
    <Reveal
      className={`flex flex-col gap-6 md:flex-row md:items-end ${
        centered ? "items-center text-center md:flex-col md:items-center" : "md:justify-between"
      }`}
    >
      <div className={`space-y-4 ${centered ? "max-w-2xl" : "max-w-xl"}`}>
        <p
          className={`flex items-center gap-3 text-xs font-medium text-muted-foreground ${
            centered ? "justify-center" : ""
          }`}
        >
          <span className="en-digits rounded-full border border-foreground/10 px-2.5 py-1 text-[11px] text-lime">
            {index}
          </span>
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold leading-tight md:text-5xl md:leading-[1.15]">{title}</h2>
        {description && (
          <p className="text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {action}
    </Reveal>
  );
}

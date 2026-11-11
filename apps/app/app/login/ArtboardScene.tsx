import { MousePointer2 } from "lucide-react";

/**
 * Decorative "design tool" scene beside the login form: rulers, a pen path
 * that draws itself, a selected headline and a collaborator cursor.
 * Server component, CSS-only motion (see login.css).
 */
export default function ArtboardScene({
  courses,
  students,
}: {
  courses: number;
  students: number;
}) {
  const fa = (n: number) => n.toLocaleString("fa-IR");

  return (
    <div
      aria-hidden
      className="relative h-[min(760px,calc(100vh-6rem))] min-h-[520px] w-full overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/40"
    >
      <div className="login-ruler-x" />
      <div className="login-ruler-y" />

      {/* soft brand glow */}
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-lime/15 blur-3xl" />

      {/* toolbar */}
      <div className="absolute right-1/2 top-8 flex translate-x-1/2 items-center gap-1 rounded-full border border-foreground/10 bg-background/70 p-1 backdrop-blur">
        {["V", "P", "T", "◯", "▢"].map((t, i) => (
          <span
            key={t}
            className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
              i === 1
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* the pen path */}
      <svg
        viewBox="0 0 600 420"
        className="absolute inset-x-6 top-16 h-[70%] w-[calc(100%-3rem)]"
        fill="none"
      >
        <defs>
          <linearGradient id="login-stroke" x1="0" x2="1">
            <stop offset="0" stopColor="#d4ff3f" />
            <stop offset="1" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <path
          className="login-pen-path"
          d="M40 330 C 120 120, 220 380, 300 210 S 470 40, 560 150"
          stroke="url(#login-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* handles of the middle anchor */}
        <g className="login-pen-node" style={{ animationDelay: "2.2s" }}>
          <line
            x1="230"
            y1="290"
            x2="370"
            y2="130"
            stroke="hsl(var(--foreground) / 0.35)"
            strokeWidth="1.5"
          />
          <circle cx="230" cy="290" r="5" fill="hsl(var(--foreground))" />
          <circle cx="370" cy="130" r="5" fill="hsl(var(--foreground))" />
        </g>
        {[
          [40, 330, "0.6s"],
          [300, 210, "1.9s"],
          [560, 150, "3.3s"],
        ].map(([x, y, d]) => (
          <rect
            key={String(x)}
            className="login-pen-node"
            style={{
              animationDelay: String(d),
              transformOrigin: `${x}px ${y}px`,
            }}
            x={Number(x) - 7}
            y={Number(y) - 7}
            width="14"
            height="14"
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
          />
        ))}
      </svg>

      {/* selected headline */}
      <div className="absolute bottom-24 right-10 left-10 flex justify-center">
        <div className="login-selection relative px-4 py-2 outline outline-1 outline-primary">
          {[
            "-top-1.5 -right-1.5",
            "-top-1.5 -left-1.5",
            "-bottom-1.5 -right-1.5",
            "-bottom-1.5 -left-1.5",
          ].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} size-3 border border-primary bg-background`}
            />
          ))}
          <span className="absolute -top-7 right-0 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
            Headline · 48px
          </span>
          <p className="text-3xl font-black leading-tight md:text-4xl">
            <span className="text-gradient">ایده‌ات رو</span> طراحی کن
          </p>
        </div>
      </div>

      {/* collaborator cursor */}
      <div className="login-cursor-a absolute right-[22%] top-[30%] flex items-start">
        <MousePointer2 size={20} className="fill-lime text-lime" />
        <span className="mt-4 rounded-full rounded-tl-none bg-lime px-2 py-0.5 text-[11px] font-bold text-black">
          طراح گرافیک
        </span>
      </div>

      {/* status bar */}
      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-foreground/10 bg-background/70 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur">
        <span>
          <b className="text-foreground">{fa(courses)}</b> دوره تخصصی
        </span>
        <span className="h-3 w-px bg-foreground/15" />
        <span>
          <b className="text-foreground">{fa(students)}+</b> هنرجو
        </span>
      </div>
    </div>
  );
}

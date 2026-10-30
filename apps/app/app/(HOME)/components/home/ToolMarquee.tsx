const tools = [
  { name: "Photoshop", short: "Ps", color: "#31a8ff", bg: "#001e36" },
  { name: "Illustrator", short: "Ai", color: "#ff9a00", bg: "#330000" },
  { name: "InDesign", short: "Id", color: "#ff3366", bg: "#49021f" },
  { name: "Premiere", short: "Pr", color: "#9999ff", bg: "#00005b" },
  { name: "After Effects", short: "Ae", color: "#9999ff", bg: "#00005b" },
  { name: "Blender", short: "Bl", color: "#f5792a", bg: "#2b1405" },
  { name: "Figma", short: "Fi", color: "#a259ff", bg: "#1e0b33" },
  { name: "Midjourney", short: "Mj", color: "#ffffff", bg: "#1a1a1a" },
];

export default function ToolMarquee() {
  const row = [...tools, ...tools];
  return (
    <section aria-label="نرم‌افزارهایی که آموزش می‌دیم" className="space-y-5">
      <p className="text-center text-xs text-muted-foreground">
        نرم‌افزارهایی که توی آی‌گرافیکال حرفه‌ای یاد می‌گیری
      </p>
      <div className="studio-mask-x studio-marquee-pause overflow-hidden" dir="ltr">
        <div className="studio-marquee flex w-max gap-4" style={{ ["--marquee-duration" as string]: "35s" }}>
          {row.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 py-2.5 pe-6 ps-2.5 transition-colors hover:border-foreground/25"
            >
              <span
                className="flex size-9 items-center justify-center rounded-lg text-sm font-bold"
                style={{ color: t.color, backgroundColor: t.bg, boxShadow: `inset 0 0 0 1.5px ${t.color}` }}
              >
                {t.short}
              </span>
              <span className="text-sm font-medium text-foreground/80">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

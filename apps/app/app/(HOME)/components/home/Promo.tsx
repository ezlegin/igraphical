import Reveal from "@/components/motion/Reveal";
import Slider from "@/components/Slider";
import { database } from "@igraph/database";

// admin-managed MAIN banners, framed as a promo strip
export default async function Promo() {
  const sliders = await database.slider.findMany({
    where: { type: "MAIN", active: true },
    include: { image: true },
  });

  if (!sliders.length) return null;

  return (
    <Reveal>
      <div className="rounded-[2rem] border border-foreground/10 bg-card/40 p-2 md:p-3">
        <Slider type="MAIN" sliders={sliders} />
      </div>
    </Reveal>
  );
}

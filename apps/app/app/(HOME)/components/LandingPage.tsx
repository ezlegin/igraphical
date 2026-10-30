import Slider from "@/components/Slider";
import Aurora from "@/components/motion/Aurora";
import Highlight from "@/components/motion/Highlight";
import Tap from "@/components/motion/Tap";
import Float from "@/components/motion/Float";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { stars } from "@/public";
import { database } from "@igraph/database";
import SocialsIcon from "@igraph/ui/components/SocialsIcon";
import { Badge } from "@igraph/ui/components/ui/badge";
import { Button } from "@igraph/ui/components/ui/button";
import { MousePointer2, Pipette, Type, Brush } from "lucide-react";
import Image from "next/image";

const LandingPage = async () => {
  const sliders = await database.slider.findMany({
    where: { type: "MAIN", active: true },
    include: { image: true },
  });

  return (
    <div className="relative">
      <Aurora />
      <Slider type="MAIN" sliders={sliders} />

      <Float className="card p-2 hidden md:flex justify-center items-center absolute left-10 top-10">
        <MousePointer2 size={20} />
      </Float>
      <Float
        delay={1}
        className="card p-2 hidden md:flex justify-center items-center absolute right-20 top-16"
      >
        <Pipette size={20} />
      </Float>
      <Float
        delay={2}
        className="card p-2 hidden md:flex absolute right-28 bottom-28 mt-60"
      >
        <Type size={20} />
      </Float>
      <Float
        delay={3}
        className="card p-2 hidden md:flex absolute left-32 bottom-32 mt-60"
      >
        <Brush size={20} />
      </Float>

      <div className="flex h-full space-y-6 flex-col items-center">
        <Stagger className="text-center flex flex-col gap-6 items-center z-10">
          <StaggerItem>
            <Badge variant={"green"} className="py-2 px-4 border-none gap-2">
              <div className="size-1.5 bg-green-300 animate-pulse rounded-full" />
              <h1 className="text-xs font-medium">پلتفرم آموزشی آی‌گرافیکال</h1>
            </Badge>
          </StaggerItem>
          <StaggerItem>
            <p className="text-6xl font-bold leading-[60px] md:leading-none">
              ایده ها وقتی{" "}
              <Highlight>ساخته</Highlight>{" "}
              میشن، دیده میشن!
            </p>

            <p className="text-muted-foreground text-sm mt-3">
              از مبتدی تا حرفه‌ای، یادگیری طراحی گرافیک را با دوره‌های تخصصی و
              پروژه‌محور تجربه کنید. <br />
              جدیدترین تکنیک‌ها، نرم‌افزارهای قدرتمند، و راهکارهای عملی برای
              تسلط بر گرافیک دیجیتال، همه در یکجا!
            </p>
          </StaggerItem>

          <StaggerItem className="flex items-center gap-2 text-xs">
            <span>میانگین امتیاز: 4.9/5</span>
            <Image src={stars} width={110} height={110} alt="stars" />
          </StaggerItem>

          <StaggerItem className="flex flex-col items-center gap-4">
            <Tap>
              <a href="#courses">
                <Button size={"lg"}>مشاهده دوره ها</Button>
              </a>
            </Tap>
            <SocialsIcon />
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
};

export default LandingPage;

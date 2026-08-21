import Slider from "@/components/Slider";
import { stars } from "@/public";
import { database } from "@igraph/database";
import SocialsIcon from "@igraph/ui/components/SocialsIcon";
import { Badge } from "@igraph/ui/components/ui/badge";
import { Button } from "@igraph/ui/components/ui/button";
import Image from "next/image";

const LandingPage = async () => {
  const sliders = await database.slider.findMany({
    where: { type: "MAIN", active: true },
    include: { image: true },
  });

  return (
    <div className="space-y-10 px-4">
      <Slider type="MAIN" sliders={sliders} />

      <div className="flex h-full space-y-6 flex-col items-center">
        <div className="text-center flex flex-col gap-6 items-center z-10">
          <Badge variant={"green"} className="py-2 px-4 border-none gap-2">
            <div className="size-1.5 bg-green-300 animate-pulse rounded-full" />
            <h1 className="text-xs font-medium">پلتفرم آموزشی آی‌گرافیکال</h1>
          </Badge>
          <div>
            <p className="text-6xl font-bold leading-[60px] md:leading-none">
              ایده ها وقتی{" "}
              <span className="bg-primary text-primary-foreground px-1 ">
                ساخته
              </span>{" "}
              میشن، دیده میشن!
            </p>

            <p className="text-muted-foreground text-sm">
              از مبتدی تا حرفه‌ای، یادگیری طراحی گرافیک را با دوره‌های تخصصی و
              پروژه‌محور تجربه کنید. <br />
              جدیدترین تکنیک‌ها، نرم‌افزارهای قدرتمند، و راهکارهای عملی برای
              تسلط بر گرافیک دیجیتال، همه در یکجا!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span>میانگین امتیاز: 4.8/5</span>
            <Image src={stars} width={120} height={120} alt="stars" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <a href="#courses">
              <Button size={"lg"}>مشاهده دوره ها</Button>
            </a>
            <SocialsIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

{
  /* <div className="text-muted-foreground absolute w-full max-w-lg  hidden md:block">
          <div>
            <div className="card p-2 flex justify-center items-center absolute left-0 top-20">
              <MousePointer2 size={20} />
            </div>
            <div className="card p-2 flex justify-center items-center absolute right-0 top-24">
              <Pipette size={20} />
            </div>
          </div>
          <div className="card p-2 absolute right-10 top-0 mt-60">
            <Type size={20} />
          </div>
          <div className="card p-2 absolute left-10 top-0 mt-60">
            <Brush size={20} />
          </div>
        </div> */
}

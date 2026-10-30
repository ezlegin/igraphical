import { getSessionUser } from "@/data/user";
import { database } from "@igraph/database";
import StatusCardsGrid from "./components/StatusCardsGrid";
import RunningCourses from "./components/RunningCourses";
import LastTicketsList from "./components/LastTicketsList";
import Reveal from "@/components/motion/Reveal";
import { ArrowUpLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { formatPriceBy3Digits } from "@igraph/utils";
import Slider from "@/components/Slider";

const page = async () => {
  const user = await getSessionUser();
  const userId = user?.id;

  const runningEnrollment = await database.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    where: {
      userId: userId,
      completedAt: null,
    },
    include: {
      course: {
        include: {
          enrollment: {
            where: { userId },
            include: {
              classroom: true,
            },
          },
          image: true,
          tutor: true,
          curriculum: {
            include: {
              lessons: {
                include: {
                  lessonProgress: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: 3,
  });

  const runningCourses = runningEnrollment.map((item) => item.course);

  const tickets = await database.ticket.findMany({
    where: {
      userId: userId,
    },
  });

  const wallet = await database.wallet.findFirst({
    where: { userId },
  });

  const sliders = await database.slider.findMany({
    where: { type: "PANEL", active: true },
    include: { image: true },
  });

  return (
    <div className="space-y-6">
      <Reveal className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">خوش برگشتی 👋</p>
          <h1 className="mt-1 text-3xl font-black md:text-4xl">
            سلام <span className="text-gradient">{user?.firstName}</span>، امروز چی می‌سازیم؟
          </h1>
        </div>
        <Link
          href="/courses"
          className="group flex w-fit items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          کشف دوره‌های جدید
          <ArrowUpLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </Reveal>

      {sliders.length > 0 && (
        <div className="overflow-hidden rounded-[1.75rem] border border-foreground/10">
          <Slider type="PANEL" sliders={sliders} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatusCardsGrid />

        <div className="studio-card studio-noise relative col-span-2 flex items-center justify-between gap-3 overflow-hidden p-5 lg:col-span-1">
          <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-lime/20 blur-2xl" />
          <div className="relative space-y-1">
            <span className="text-xs text-muted-foreground">موجودی کیف پول</span>
            <p className="text-xl font-black">
              {formatPriceBy3Digits(wallet?.balance || 0)}
              <span className="mr-1 text-xs font-normal text-muted-foreground">تومان</span>
            </p>
          </div>
          <span className="relative flex size-12 items-center justify-center rounded-2xl bg-lime text-black">
            <Wallet size={22} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-8">
        <div className="xl:col-span-5">
          <RunningCourses runningCourses={runningCourses} showBtn />
        </div>
        <div className="xl:col-span-3">
          <LastTicketsList tickets={tickets} />
        </div>
      </div>
    </div>
  );
};

export default page;

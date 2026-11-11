import Reveal from "@/components/motion/Reveal";
import { getSessionUser } from "@/data/user";
import { getSubscriptionSummary, subscriptionsEnabled } from "@/lib/access";
import { database } from "@igraph/database";
import { formatJalaliDate } from "@igraph/utils";
import { Metadata } from "next";
import PlansCheckout from "./PlansCheckout";

export const metadata: Metadata = {
  title: "اشتراک آی‌گرافیکال",
  description:
    "با یک اشتراک به همه دوره‌های آی‌گرافیکال دسترسی داشته باشید؛ همراه با مدرک، دوره‌های جدید و منتورشیپ اختیاری.",
  alternates: { canonical: "/plans" },
};

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "بعد از پایان اشتراک چه می‌شود؟",
    a: "کلاس‌ها قفل می‌شوند اما پیشرفت و مدارک شما محفوظ می‌ماند. با تمدید، دقیقاً از همان‌جا ادامه می‌دهید.",
  },
  {
    q: "اگر اشتراک فعال داشته باشم و دوباره بخرم؟",
    a: "زمان جدید به انتهای اشتراک فعلی اضافه می‌شود و هیچ روزی از دست نمی‌رود.",
  },
  {
    q: "منتورشیپ چیست؟",
    a: "امکان پرسش و پاسخ مستقیم با مدرس داخل کلاس هر دوره، با ارسال فایل و تصویر، در تمام مدت اشتراک.",
  },
  {
    q: "دوره‌هایی که قبلاً خریده‌ام چه می‌شوند؟",
    a: "تا یک سال پس از راه‌اندازی اشتراک، به همراه منتورشیپ، به آن‌ها دسترسی دارید.",
  },
];

const page = async () => {
  const [plans, user, courses] = await Promise.all([
    database.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { months: "asc" }],
    }),
    getSessionUser(),
    database.course.findMany({
      where: { status: { not: "DRAFT" } },
      select: {
        duration: true,
        price: true,
        curriculum: { select: { _count: { select: { lessons: true } } } },
      },
    }),
  ]);
  const summary = user ? await getSubscriptionSummary(user.id) : null;

  const stats = {
    courses: courses.length,
    hours: Math.round(courses.reduce((a, c) => a + c.duration, 0) / 60),
    lessons: courses.reduce(
      (a, c) => a + c.curriculum.reduce((b, s) => b + s._count.lessons, 0),
      0,
    ),
    catalogValue: courses.reduce((a, c) => a + c.price, 0),
  };

  const enabled = subscriptionsEnabled() && plans.length > 0;

  return (
    <div className="mx-auto max-w-screen-xl space-y-14 py-6 md:py-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-foreground/10 px-6 pb-10 pt-12 md:px-12 md:pt-16">
        <div className="studio-grid studio-fade absolute inset-0 -z-10" />
        <div className="absolute -top-24 left-1/2 -z-10 h-64 w-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        
        <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            اشتراک آی‌گرافیکال
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl md:leading-[1.25]">
            یک اشتراک، <span className="text-gradient">همه دوره‌ها</span>
          </h1>
          <p className="text-sm leading-7 text-muted-foreground md:text-base">
            به جای خرید تک‌تک دوره‌ها، با یک اشتراک به کل کتابخانه آموزشی
            آی‌گرافیکال و هر دوره‌ای که از این به بعد منتشر می‌شود دسترسی داشته
            باشید.
          </p>
          {summary?.endsAt && (
            <p className="inline-block rounded-full bg-foreground/5 px-4 py-1.5 text-xs text-muted-foreground">
              اشتراک شما تا {formatJalaliDate(summary.endsAt)} فعال است؛ خرید
              جدید به انتهای آن اضافه می‌شود.
            </p>
          )}
        </Reveal>

        <div className="mt-10">
          {enabled ? (
            <PlansCheckout
              plans={plans.map((p) => ({
                id: p.id,
                title: p.title,
                months: p.months,
                price: p.price,
                compareAtPrice: p.compareAtPrice,
                mentorshipPrice: p.mentorshipPrice,
              }))}
              stats={stats}
              isLoggedIn={!!user}
              walletBalance={user?.wallet?.balance ?? 0}
            />
          ) : (
            <p className="text-center text-muted-foreground">
              فروش اشتراک به زودی آغاز می‌شود.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-5">
        <h2 className="text-center text-xl font-bold md:text-2xl">
          سوالات متداول
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-foreground/10 bg-background/40 p-5 open:border-foreground/25"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default page;

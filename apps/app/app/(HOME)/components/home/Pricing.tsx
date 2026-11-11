import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { subscriptionsEnabled } from "@/lib/access";
import { database } from "@igraph/database";
import { formatPriceBy3Digits } from "@igraph/utils";
import {
  ArrowLeft,
  Award,
  Check,
  MessageCircleQuestion,
  Sparkles,
  TvMinimalPlay,
} from "lucide-react";
import Link from "next/link";
import SectionHeading from "./SectionHeading";

const periodLabel = (m: number) => (m === 12 ? "سالانه" : `${m} ماهه`);

// Subscription plans on the home page: every plan side by side, the best
// value highlighted, and each card linking to checkout with that plan picked.
export default async function Pricing() {
  if (!subscriptionsEnabled()) return null;

  const [plans, courses] = await Promise.all([
    database.plan.findMany({
      where: { isActive: true, price: { gt: 0 } },
      orderBy: [{ sortOrder: "asc" }, { months: "asc" }],
    }),
    database.course.findMany({
      where: { status: { not: "DRAFT" } },
      select: { duration: true, price: true },
    }),
  ]);
  if (!plans.length) return null;

  const monthly =
    plans.find((p) => p.months === 1)?.price ??
    Math.round(plans[0]!.price / plans[0]!.months);
  const saving = (months: number, price: number) =>
    months > 1 ? Math.round((1 - price / (monthly * months)) * 100) : 0;
  const best = plans.reduce((a, b) => (b.price / b.months < a.price / a.months ? b : a));

  const hours = Math.round(courses.reduce((a, c) => a + c.duration, 0) / 60);
  const catalogValue = courses.reduce((a, c) => a + c.price, 0);

  const included = [
    { icon: TvMinimalPlay, text: `همه ${courses.length} دوره، بیش از ${hours} ساعت آموزش` },
    { icon: Sparkles, text: "دوره‌های جدید، بدون هزینه اضافه" },
    { icon: Award, text: "مدرک پایان دوره قابل استعلام" },
  ];

  return (
    <section className="space-y-10" id="plans">
      <SectionHeading
        index="05"
        eyebrow="اشتراک آی‌گرافیکال"
        align="center"
        title={
          <>
            یک اشتراک، <span className="text-gradient">همه دوره‌ها</span>
          </>
        }
        description={
          catalogValue > best.price
            ? `خرید جداگانه همه دوره‌ها ${formatPriceBy3Digits(catalogValue)} تومان می‌شه؛ با اشتراک، کل کتابخانه مال توئه.`
            : "به‌جای خرید تک‌تک دوره‌ها، با یک اشتراک به کل کتابخانه دسترسی داشته باش."
        }
      />

      <Stagger
        className={`mx-auto grid max-w-5xl gap-4 pt-3 sm:grid-cols-2 ${
          plans.length >= 4 ? "lg:grid-cols-4" : plans.length === 3 ? "lg:grid-cols-3" : ""
        }`}
      >
        {plans.map((p) => {
          const isBest = p.id === best.id;
          const save = saving(p.months, p.price);
          return (
            <StaggerItem key={p.id}>
              <div
                className={`relative flex h-full flex-col rounded-[1.5rem] border p-5 transition-colors md:p-6 ${
                  isBest
                    ? "border-primary/60 bg-primary/[0.07] shadow-[0_30px_70px_-45px_hsl(var(--primary))]"
                    : "border-foreground/10 bg-card/40 hover:border-foreground/25"
                }`}
              >
                {isBest && (
                  <span className="absolute -top-3 right-5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                    به‌صرفه‌ترین
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <p className="font-bold">{periodLabel(p.months)}</p>
                  {save > 0 && (
                    <span
                      dir="ltr"
                      className="rounded-full bg-lime/15 px-2 py-0.5 text-[11px] font-bold text-lime"
                    >
                      -{save}%
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPriceBy3Digits(p.compareAtPrice)}
                    </p>
                  )}
                  <p className="mt-0.5">
                    <span className="text-3xl font-black">
                      {formatPriceBy3Digits(p.price)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">تومان</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.months > 1
                      ? `ماهی ${formatPriceBy3Digits(Math.round(p.price / p.months))} تومان`
                      : "پرداخت ماه‌به‌ماه"}
                  </p>
                </div>

                <div className="my-5 h-px bg-foreground/10" />

                <ul className="space-y-2.5 text-[13px]">
                  {included.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-2">
                      <Icon size={15} className="mt-0.5 shrink-0 text-primary" />
                      <span className="text-foreground/85">{text}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <MessageCircleQuestion size={15} className="mt-0.5 shrink-0" />
                    <span>
                      منتورشیپ اختیاری،{" "}
                      {formatPriceBy3Digits(p.mentorshipPrice)} تومان
                    </span>
                  </li>
                </ul>

                <Link
                  href={`/plans?plan=${p.id}`}
                  className={`group mt-6 flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors ${
                    isBest
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5"
                  }`}
                >
                  انتخاب {periodLabel(p.months)}
                  <ArrowLeft
                    size={16}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </Link>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {[
          "پرداخت امن با درگاه بانکی",
          "امکان پرداخت اقساطی",
          "خرید جدید به انتهای اشتراک فعلی اضافه می‌شه",
        ].map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <Check size={13} className="text-lime" />
            {t}
          </span>
        ))}
      </p>
    </section>
  );
}

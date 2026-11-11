"use client";

import {
  getSubscriptionQuote,
  startSubscriptionCheckout,
} from "@/actions/subscription";
import { digipayLogo, sadadLogo, zarrinpalLogo } from "@/public";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { Input } from "@igraph/ui/components/ui/input";
import { Switch } from "@igraph/ui/components/ui/switch";
import { formatPriceBy3Digits } from "@igraph/utils";
import {
  Award,
  Check,
  Download,
  Headset,
  Infinity as InfinityIcon,
  MessageCircleQuestion,
  Sparkles,
  TvMinimalPlay,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type PlanView = {
  id: number;
  title: string;
  months: number;
  price: number;
  compareAtPrice: number | null;
  mentorshipPrice: number;
};

type Stats = {
  courses: number;
  hours: number;
  lessons: number;
  catalogValue: number;
};

type Method = "SADAD" | "ZARRIN_PAL" | "DIGIPAY";

type QuoteView = {
  itemsTotal: number;
  couponAmount: number;
  walletAmount: number;
  total: number;
};

const periodLabel = (m: number) => (m === 12 ? "سالانه" : `${m} ماهه`);

const methods: { value: Method; label: string; logo: string }[] = [
  { value: "SADAD", label: "بانک ملی", logo: sadadLogo },
  { value: "ZARRIN_PAL", label: "زرین پال", logo: zarrinpalLogo },
  { value: "DIGIPAY", label: "اقساطی", logo: digipayLogo },
];

const PlansCheckout = ({
  plans,
  stats,
  isLoggedIn,
  walletBalance,
}: {
  plans: PlanView[];
  stats: Stats;
  isLoggedIn: boolean;
  walletBalance: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [planId, setPlanId] = useState(plans.at(-1)!.id);
  const [mentorship, setMentorship] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string>();
  const [useWallet, setUseWallet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Method>("SADAD");
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [paying, startPaying] = useTransition();

  const plan = plans.find((p) => p.id === planId)!;
  const monthlyBase =
    Math.max(...plans.filter((p) => p.months === 1).map((p) => p.price), 0) ||
    Math.round(plans[0]!.price / plans[0]!.months);
  const savingPct = (p: PlanView) =>
    monthlyBase && p.months > 1
      ? Math.round((1 - p.price / (monthlyBase * p.months)) * 100)
      : 0;

  const localTotal = plan.price + (mentorship ? plan.mentorshipPrice : 0);
  const total = quote?.total ?? localTotal;

  // The server is the source of truth for the final amount.
  useEffect(() => {
    if (!isLoggedIn) return setQuote(null);
    let cancelled = false;
    getSubscriptionQuote({ planId, mentorship, couponCode, useWallet }).then(
      (res) => {
        if (cancelled) return;
        if ("error" in res) {
          toast.error(res.error);
          if (couponCode) setCouponCode(undefined);
          return;
        }
        setQuote(res.quote);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [planId, mentorship, couponCode, useWallet, isLoggedIn]);

  const onPay = () =>
    startPaying(async () => {
      if (!isLoggedIn) {
        router.push(`/login?callbackUrl=${pathname}`);
        return;
      }
      const res = await startSubscriptionCheckout({
        planId,
        mentorship,
        couponCode,
        useWallet,
        paymentMethod,
      });
      if ("error" in res && res.error) return void toast.error(res.error);
      if ("paymentUrl" in res && res.paymentUrl) {
        toast.success(res.success);
        window.location.href = res.paymentUrl;
        return;
      }
      if ("redirectUrl" in res && res.redirectUrl) {
        toast.success(res.success);
        router.push(res.redirectUrl);
      }
    });

  const features = [
    {
      icon: TvMinimalPlay,
      text: `دسترسی کامل به ${stats.courses} دوره، بیش از ${stats.hours} ساعت آموزش`,
    },
    { icon: Sparkles, text: "همه دوره‌های جدیدی که منتشر می‌شوند" },
    { icon: Award, text: "مدرک پایان دوره با کد استعلام" },
    { icon: Download, text: "فایل‌های تمرین و پروژه‌ها" },
    { icon: Headset, text: "پشتیبانی از طریق تیکت" },
    { icon: InfinityIcon, text: "پیشرفت و مدارک شما همیشه محفوظ می‌ماند" },
  ];

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-4 md:grid-cols-[1.1fr_1fr]">
      {/* What's included */}
      <div className="studio-card studio-noise overflow-hidden shadow-[0_30px_90px_-60px_hsl(var(--primary)/0.35)] self-start">
        {/* Period toggle */}
        <div className="flex justify-center border-b border-foreground/10 p-4">
          <div
            role="radiogroup"
            aria-label="مدت اشتراک"
            style={{
              gridTemplateColumns: `repeat(${plans.length}, minmax(0, 1fr))`,
            }}
            className="grid gap-1 rounded-full border border-foreground/10 bg-background/60 p-1"
          >
            {plans.map((p) => {
              const active = p.id === planId;
              const save = savingPct(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPlanId(p.id)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-medium transition-colors md:text-sm ${
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {periodLabel(p.months)}
                  {save > 0 && (
                    <span
                      dir="ltr"
                      aria-label={`${save}% تخفیف`}
                      className={`ms-1.5 inline-block whitespace-nowrap rounded-full px-1 align-middle text-[9px] font-bold leading-4 ${
                        active ? "bg-lime text-black" : "bg-lime/20 text-lime"
                      }`}
                    >
                      -{save}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-6 p-6 md:p-8">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{plan.title}</p>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-black md:text-5xl">
                {formatPriceBy3Digits(plan.price)}
              </span>
              <span className="text-sm text-muted-foreground">تومان</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {plan.compareAtPrice && plan.compareAtPrice > plan.price && (
                <span className="line-through">
                  {formatPriceBy3Digits(plan.compareAtPrice)}
                </span>
              )}
              {plan.months > 1 && (
                <span>
                  معادل ماهی{" "}
                  <span className="text-foreground">
                    {formatPriceBy3Digits(Math.round(plan.price / plan.months))}
                  </span>{" "}
                  تومان
                </span>
              )}
            </div>
          </div>

          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {stats.catalogValue > plan.price && (
            <p className="rounded-2xl border border-dashed border-foreground/15 p-3 text-xs leading-6 text-muted-foreground">
              ارزش خرید جداگانه همه دوره‌ها{" "}
              <span className="font-bold text-foreground">
                {formatPriceBy3Digits(stats.catalogValue)}
              </span>{" "}
              تومان است.
            </p>
          )}
        </div>
      </div>

      {/* Checkout */}
      <div className="studio-card studio-noise overflow-hidden shadow-[0_30px_90px_-60px_hsl(var(--primary)/0.35)] space-y-5 self-start p-6 md:p-8">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMentorship((m) => !m);
            }
          }}
          onClick={() => setMentorship((m) => !m)}
          className={`w-full cursor-pointer rounded-2xl border p-4 text-right transition-colors ${
            mentorship
              ? "border-primary bg-primary/10"
              : "border-foreground/10 hover:border-foreground/25"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lime text-black">
                <MessageCircleQuestion size={20} />
              </span>
              <div>
                <p className="font-bold">افزودن منتورشیپ</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  پرسش و پاسخ مستقیم با مدرس در همه دوره‌ها، به مدت{" "}
                  {plan.months} ماه
                </p>
              </div>
            </div>
            <Switch
              dir="ltr"
              checked={mentorship}
              onCheckedChange={setMentorship}
              onClick={(e) => e.stopPropagation()}
              aria-label="منتورشیپ"
            />
          </div>
          <p className="mt-3 text-xs">
            +{" "}
            <span className="font-bold">
              {formatPriceBy3Digits(plan.mentorshipPrice)}
            </span>{" "}
            تومان
          </p>
        </div>

        {isLoggedIn && (
          <div className="space-y-3 text-sm">
            {walletBalance > 0 && (
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  استفاده از کیف پول (
                  <span>{formatPriceBy3Digits(walletBalance)}</span> تومان)
                </span>
                <Switch
                  dir="ltr"
                  checked={useWallet}
                  onCheckedChange={setUseWallet}
                />
              </label>
            )}

            {!showCoupon && !couponCode ? (
              <button
                type="button"
                className="text-xs text-primary underline-offset-4 hover:underline"
                onClick={() => setShowCoupon(true)}
              >
                کد تخفیف دارید؟
              </button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="کد تخفیف"
                  value={couponInput}
                  disabled={!!couponCode}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="rounded-full"
                />
                {couponCode ? (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setCouponCode(undefined);
                      setCouponInput("");
                    }}
                  >
                    حذف
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={!couponInput.trim()}
                    onClick={() => setCouponCode(couponInput.trim())}
                  >
                    اعمال
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 rounded-2xl bg-foreground/[0.03] p-4 text-sm">
          <Row
            label={`اشتراک ${periodLabel(plan.months)}`}
            value={plan.price}
          />
          {mentorship && <Row label="منتورشیپ" value={plan.mentorshipPrice} />}
          {!!quote?.couponAmount && (
            <Row label="کد تخفیف" value={-quote.couponAmount} accent />
          )}
          {!!quote?.walletAmount && (
            <Row label="کیف پول" value={-quote.walletAmount} accent />
          )}
          <div className="flex items-baseline justify-between border-t border-foreground/10 pt-3">
            <span className="font-medium">قابل پرداخت</span>
            <span>
              <span className="text-xl font-black">
                {formatPriceBy3Digits(total)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">تومان</span>
            </span>
          </div>
        </div>

        {isLoggedIn && total > 0 && (
          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label="روش پرداخت"
          >
            {methods.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={paymentMethod === m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs transition-colors ${
                  paymentMethod === m.value
                    ? "border-primary bg-primary/10"
                    : "border-foreground/10 text-muted-foreground hover:border-foreground/25"
                }`}
              >
                <Image alt="" src={m.logo} width={24} height={24} />
                {m.label}
              </button>
            ))}
          </div>
        )}

        <Button
          size="lg"
          className="h-12 w-full rounded-full text-base"
          disabled={paying}
          onClick={onPay}
        >
          <Loader loading={paying} />
          {!isLoggedIn ? (
            "ورود و خرید اشتراک"
          ) : total === 0 ? (
            "فعال‌سازی اشتراک"
          ) : (
            <>
              پرداخت <span>{formatPriceBy3Digits(total)}</span> تومان
            </>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Check size={12} className="text-lime" />
          خرید جدید به انتهای اشتراک فعلی شما اضافه می‌شود
        </p>
      </div>
    </div>
  );
};

const Row = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={accent ? "text-lime" : undefined}>
      <span>
        {value < 0 && "−"}
        {formatPriceBy3Digits(Math.abs(value))}
      </span>{" "}
      تومان
    </span>
  </div>
);

export default PlansCheckout;

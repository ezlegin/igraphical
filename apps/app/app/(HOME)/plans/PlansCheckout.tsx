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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@igraph/ui/components/ui/toggle-group";
import { formatPriceBy3Digits } from "@igraph/utils";
import { Check } from "lucide-react";
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

type Method = "SADAD" | "ZARRIN_PAL" | "DIGIPAY";

type QuoteView = {
  itemsTotal: number;
  couponAmount: number;
  walletAmount: number;
  total: number;
};

const PlansCheckout = ({
  plans,
  isLoggedIn,
  walletBalance,
}: {
  plans: PlanView[];
  isLoggedIn: boolean;
  walletBalance: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [planId, setPlanId] = useState(plans.at(-1)!.id);
  const [mentorship, setMentorship] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string>();
  const [useWallet, setUseWallet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Method>("SADAD");
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [paying, startPaying] = useTransition();

  const plan = plans.find((p) => p.id === planId)!;
  const localTotal = plan.price + (mentorship ? plan.mentorshipPrice : 0);

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

  const total = quote?.total ?? localTotal;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => {
          const selected = p.id === planId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlanId(p.id)}
              className={`rounded-2xl border p-5 text-right transition ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{p.title}</span>
                {selected && <Check className="text-primary" size={20} />}
              </div>
              <div className="mt-3 space-y-1">
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPriceBy3Digits(p.compareAtPrice)} تومان
                  </div>
                )}
                <div className="text-xl font-bold">
                  {formatPriceBy3Digits(p.price)} تومان
                </div>
                <div className="text-xs text-muted-foreground">
                  ماهانه {formatPriceBy3Digits(Math.round(p.price / p.months))}{" "}
                  تومان
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card space-y-5 self-start rounded-2xl border p-5">
        <label className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">منتورشیپ (پرسش از مدرس)</div>
            <div className="text-xs text-muted-foreground">
              به مدت {plan.months} ماه، +
              {formatPriceBy3Digits(plan.mentorshipPrice)} تومان
            </div>
          </div>
          <Switch
            dir="ltr"
            checked={mentorship}
            onCheckedChange={setMentorship}
          />
        </label>

        {isLoggedIn && (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="کد تخفیف"
                value={couponInput}
                disabled={!!couponCode}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              {couponCode ? (
                <Button
                  variant="outline"
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
                  disabled={!couponInput.trim()}
                  onClick={() => setCouponCode(couponInput.trim())}
                >
                  اعمال
                </Button>
              )}
            </div>

            {walletBalance > 0 && (
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  استفاده از کیف پول ({formatPriceBy3Digits(walletBalance)}{" "}
                  تومان)
                </span>
                <Switch
                  dir="ltr"
                  checked={useWallet}
                  onCheckedChange={setUseWallet}
                />
              </label>
            )}
          </>
        )}

        <div className="space-y-1 text-sm">
          <Row label="مبلغ" value={quote?.itemsTotal ?? localTotal} />
          {!!quote?.couponAmount && (
            <Row label="کد تخفیف" value={-quote.couponAmount} />
          )}
          {!!quote?.walletAmount && (
            <Row label="کیف پول" value={-quote.walletAmount} />
          )}
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>قابل پرداخت</span>
            <span>{formatPriceBy3Digits(total)} تومان</span>
          </div>
        </div>

        {total > 0 && (
          <ToggleGroup
            type="single"
            dir="rtl"
            variant="outline"
            className="flex-col"
            value={paymentMethod}
            onValueChange={(v) => v && setPaymentMethod(v as Method)}
          >
            <div className="flex w-full gap-2">
              <ToggleGroupItem className="w-full" value="SADAD">
                <Image alt="" src={sadadLogo} width={25} height={25} />
                درگاه بانک ملی
              </ToggleGroupItem>
              <ToggleGroupItem className="w-full" value="ZARRIN_PAL">
                <Image alt="" src={zarrinpalLogo} width={25} height={25} />
                زرین پال
              </ToggleGroupItem>
            </div>
            <ToggleGroupItem className="w-full" value="DIGIPAY">
              <Image alt="" src={digipayLogo} width={23} height={23} />
              پرداخت اقساطی
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        <Button className="w-full" disabled={paying} onClick={onPay}>
          <Loader loading={paying} />
          {!isLoggedIn
            ? "ورود و خرید اشتراک"
            : total === 0
              ? "فعال‌سازی اشتراک"
              : `پرداخت ${formatPriceBy3Digits(total)} تومان`}
        </Button>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>
      {value < 0 && "−"}
      {formatPriceBy3Digits(Math.abs(value))} تومان
    </span>
  </div>
);

export default PlansCheckout;

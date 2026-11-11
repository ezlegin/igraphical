"use client";

import {
  getMentorshipAddonOptions,
  startMentorshipCheckout,
} from "@/actions/subscription";
import { sadadLogo, zarrinpalLogo } from "@/public";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@igraph/ui/components/ui/dialog";
import { Switch } from "@igraph/ui/components/ui/switch";
import { formatJalaliDate, formatPriceBy3Digits } from "@igraph/utils";
import { Headset } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type Option = {
  key: string;
  months: number | null;
  days: number;
  startsAt: Date;
  endsAt: Date;
  price: number;
  beyondAccess: boolean;
};

type Method = "SADAD" | "ZARRIN_PAL";

const methods: { value: Method; label: string; logo: string }[] = [
  { value: "SADAD", label: "بانک ملی", logo: sadadLogo },
  { value: "ZARRIN_PAL", label: "زرین پال", logo: zarrinpalLogo },
];

const optionTitle = (o: Option) =>
  o.months === null
    ? "تا پایان اشتراک فعلی"
    : o.months === 12
      ? "یک سال"
      : `${o.months} ماه`;

/** Lets a subscriber buy mentorship on its own, for a length they choose. */
const MentorshipDialog = ({ hasMentorship }: { hasMentorship: boolean }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>();
  const [error, setError] = useState<string>();
  const [walletBalance, setWalletBalance] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [useWallet, setUseWallet] = useState(false);
  const [method, setMethod] = useState<Method>("SADAD");
  const [paying, startPaying] = useTransition();

  // Prices come from the server each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setOptions(undefined);
    setError(undefined);
    getMentorshipAddonOptions().then((res) => {
      if (cancelled) return;
      if ("error" in res) return setError(res.error);
      setOptions(res.options);
      setWalletBalance(res.walletBalance);
      setSelected(res.options[0]?.key);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const option = options?.find((o) => o.key === selected);
  const walletAmount =
    option && useWallet ? Math.min(walletBalance, option.price) : 0;
  const total = option ? option.price - walletAmount : 0;

  const onPay = () =>
    startPaying(async () => {
      if (!option) return;
      const res = await startMentorshipCheckout({
        key: option.key,
        useWallet,
        paymentMethod: method,
      });
      if ("error" in res && res.error) return void toast.error(res.error);
      if ("paymentUrl" in res && res.paymentUrl) {
        toast.success(res.success);
        window.location.href = res.paymentUrl;
        return;
      }
      if ("redirectUrl" in res && res.redirectUrl) {
        toast.success(res.success);
        setOpen(false);
        router.refresh();
      }
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Headset size={14} />
          {hasMentorship ? "تمدید منتورشیپ" : "افزودن منتورشیپ"}
        </button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader className="space-y-1.5 text-right sm:text-right">
          <DialogTitle className="text-base">
            {hasMentorship ? "تمدید منتورشیپ" : "افزودن منتورشیپ"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-5">
            پرسش و پاسخ مستقیم با مدرس در همه دوره‌ها. مدت دلخواه را انتخاب
            کنید.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : !options ? (
          <div className="flex justify-center py-10">
            <Loader loading />
          </div>
        ) : (
          <div className="space-y-4">
            <div
              role="radiogroup"
              aria-label="مدت منتورشیپ"
              className="space-y-2"
            >
              {options.map((o) => {
                const active = o.key === selected;
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(o.key)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right transition-colors ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-foreground/10 hover:border-foreground/25"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {optionTitle(o)}
                        {o.months === null && (
                          <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                            ({o.days} روز)
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        تا {formatJalaliDate(new Date(o.endsAt))}
                        {o.beyondAccess &&
                          " · فراتر از اشتراک فعلی؛ با تمدید اشتراک قابل استفاده است"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold">
                      {formatPriceBy3Digits(o.price)}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        تومان
                      </span>
                    </p>
                  </button>
                );
              })}
            </div>

            {walletBalance > 0 && (
              <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
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

            {total > 0 && (
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="روش پرداخت"
              >
                {methods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    role="radio"
                    aria-checked={method === m.value}
                    onClick={() => setMethod(m.value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-2 py-2.5 text-xs transition-colors ${
                      method === m.value
                        ? "border-primary bg-primary/10"
                        : "border-foreground/10 text-muted-foreground hover:border-foreground/25"
                    }`}
                  >
                    <Image alt="" src={m.logo} width={20} height={20} />
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            <Button
              className="h-11 w-full rounded-full"
              disabled={paying || !option}
              onClick={onPay}
            >
              <Loader loading={paying} />
              {total === 0 ? (
                "فعال‌سازی منتورشیپ"
              ) : (
                <>پرداخت {formatPriceBy3Digits(total)} تومان</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MentorshipDialog;

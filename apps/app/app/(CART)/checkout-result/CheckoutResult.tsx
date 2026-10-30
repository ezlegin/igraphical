"use client";

import { verifyPayment } from "@/actions/payment";
import useError from "@/hooks/useError";
import useSuccess from "@/hooks/useSuccess";
import { Button } from "@igraph/ui/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CheckoutSteps from "../cart/components/CheckoutSteps";

type Status = "SUCCESS" | "FAIL" | "PENDING";

interface Props {
  reference: string;
}

const CheckoutResult = ({ reference }: Props) => {
  const [result, setResult] = useState<Status>("PENDING");
  const [refId, setRefId] = useState<string>();
  const { error, setError } = useError();
  const { success, setSuccess } = useSuccess();

  const pending = result === "PENDING";
  const successStatus = result === "SUCCESS";
  const fail = result === "FAIL";

  useEffect(() => {
    const verifyCheckout = async () => {
      const res = await verifyPayment(reference);

      if (res.error) {
        setResult("FAIL");
        setError(res.error);
        return;
      }

      if (res.success && res.refId) {
        setResult("SUCCESS");
        setSuccess(res.success);
        setRefId(res.refId);
        return;
      }
    };

    verifyCheckout();
  }, []);

  const tone = pending ? "hsl(var(--primary))" : successStatus ? "#d4ff3f" : "hsl(var(--destructive))";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8">
      <CheckoutSteps current={successStatus ? 2 : 1} />

      <div className="studio-card studio-noise relative w-full overflow-hidden px-6 py-10 text-center md:px-10">
        <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full opacity-30 blur-3xl" style={{ background: tone }} />

        <div className="relative mx-auto mb-6 flex size-24 items-center justify-center">
          {successStatus && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-lime"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <AnimatePresence mode="wait">
            <motion.span
              key={result}
              initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className={`flex size-24 items-center justify-center rounded-full ${
                pending ? "bg-primary/15 text-primary" : successStatus ? "bg-lime text-black" : "bg-destructive/15 text-destructive"
              }`}
            >
              {pending ? (
                <Loader2 className="animate-spin" size={40} />
              ) : successStatus ? (
                <Check size={44} strokeWidth={3} />
              ) : (
                <X size={44} strokeWidth={3} />
              )}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="relative space-y-3">
          <h1 className="text-2xl font-black">
            {pending ? "در حال بررسی پرداخت" : successStatus ? "پرداخت موفق بود!" : "پرداخت ناموفق"}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">
            {pending ? "لطفا از این صفحه خارج نشوید!" : error ? error : success}
          </p>
          {error && (
            <p className="rounded-2xl bg-foreground/5 p-4 text-xs leading-6 text-muted-foreground">
              لطفا مجددا تلاش کنید. در صورت کسر مبلغ از حساب شما، این مبلغ حداکثر تا ۷۲ ساعت آینده به حساب شما
              واریز خواهد شد.
            </p>
          )}
          {successStatus && (
            <p className="en-digits inline-block rounded-full bg-foreground/5 px-4 py-1.5 text-xs text-muted-foreground">
              شناسه پرداخت: {refId}
            </p>
          )}
        </div>

        <div className="relative mt-8 space-y-3">
          {!fail && (
            <Link href={"/panel/courses"} className="block">
              <Button disabled={pending} size="lg" className="h-12 w-full rounded-full">
                شروع یادگیری در دوره‌های من
              </Button>
            </Link>
          )}
          {fail && (
            <Link href={"/cart"} className="block">
              <Button size="lg" className="h-12 w-full rounded-full">
                بازگشت به سبد خرید
              </Button>
            </Link>
          )}
          <Link href={"/panel/payments"} className="block">
            <Button variant="outline" size="lg" disabled={pending} className="h-12 w-full rounded-full border-foreground/15">
              لیست پرداخت‌ها
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutResult;

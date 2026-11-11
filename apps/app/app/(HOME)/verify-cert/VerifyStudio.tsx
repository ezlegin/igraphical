"use client";

import { verifyCertificate } from "@/actions/certificate";
import CertificatePaper from "@/components/CertificatePaper";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@igraph/ui/components/ui/input-otp";
import { formatJalaliDate } from "@igraph/utils";
import { BadgeCheck, RotateCcw, ScanLine, ShieldX } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type Found = {
  serial: string;
  issuedAt: Date;
  studentName: string;
  courseTitle: string;
  courseMinutes: number;
};
type State = "idle" | "checking" | "valid" | "invalid";

const SERIAL_LENGTH = 6;

/** Serial input on one side, a live certificate that "answers" on the other. */
export default function VerifyStudio() {
  const reduce = useReducedMotion();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [serial, setSerial] = useState("");
  const [state, setState] = useState<State>("idle");
  const [found, setFound] = useState<Found | null>(null);
  const [error, setError] = useState("");

  const check = async (value = serial) => {
    if (value.length < SERIAL_LENGTH || state === "checking") return;
    if (!executeRecaptcha) {
      setError("ری‌کپچا هنوز آماده نیست، چند لحظه دیگه دوباره امتحان کن.");
      return;
    }
    setError("");
    setState("checking");
    const token = await executeRecaptcha("certificate_form");
    const res = await verifyCertificate(value, token);
    if ("certificate" in res && res.certificate) {
      setFound(res.certificate);
      setState("valid");
    } else {
      setFound(null);
      setState("invalid");
    }
  };

  const reset = () => {
    setSerial("");
    setFound(null);
    setState("idle");
  };

  const hours = found ? Math.round(found.courseMinutes / 60) : 0;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      {/* input side */}
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ScanLine size={14} className="text-lime" />
            استعلام آنلاین گواهی
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl md:leading-[1.2]">
            این مدرک <span className="text-gradient">واقعیه؟</span>
          </h1>
          <p className="max-w-md text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            شماره سریال ۶ رقمی پایین گواهی رو وارد کن؛ در چند ثانیه می‌گیم این
            مدرک رو آی‌گرافیکال صادر کرده یا نه.
          </p>
        </div>

        {state === "valid" || state === "invalid" ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-md rounded-2xl border p-5 ${
              state === "valid"
                ? "border-lime/30 bg-lime/[0.06]"
                : "border-red-500/30 bg-red-500/[0.06]"
            }`}
          >
            {state === "valid" && found ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 font-bold text-lime">
                  <BadgeCheck size={20} /> این مدرک معتبره
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">هنرجو</dt>
                  <dd className="font-medium">{found.studentName}</dd>
                  <dt className="text-muted-foreground">دوره</dt>
                  <dd className="font-medium">{found.courseTitle}</dd>
                  <dt className="text-muted-foreground">تاریخ صدور</dt>
                  <dd className="font-medium">
                    {formatJalaliDate(found.issuedAt)}
                  </dd>
                  <dt className="text-muted-foreground">سریال</dt>
                  <dd dir="ltr" className="text-end font-mono font-medium">
                    {found.serial}
                  </dd>
                </dl>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="flex items-center gap-2 font-bold text-red-400">
                  <ShieldX size={20} /> مدرکی با این سریال پیدا نشد
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  سریال رو دوباره چک کن. اگه مطمئنی درسته، با پشتیبانی تماس
                  بگیر.
                </p>
              </div>
            )}
            <Button
              variant="outline"
              onClick={reset}
              className="mt-4 h-10 rounded-full border-foreground/15"
            >
              <RotateCcw size={15} />
              استعلام یک مدرک دیگه
            </Button>
          </motion.div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <div dir="ltr" className="flex justify-end">
              <InputOTP
                maxLength={SERIAL_LENGTH}
                value={serial}
                onChange={(v) => setSerial(v.replace(/\s/g, ""))}
                onComplete={(v: string) => check(v)}
                disabled={state === "checking"}
                autoFocus
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: SERIAL_LENGTH }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="size-12 rounded-xl border border-foreground/15 bg-background/50 font-mono text-lg first:rounded-xl last:rounded-xl md:size-14"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              disabled={serial.length < SERIAL_LENGTH || state === "checking"}
              className="h-12 w-full max-w-sm rounded-full"
            >
              <Loader loading={state === "checking"} />
              {state === "checking" ? "در حال بررسی…" : "استعلام مدرک"}
            </Button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>

      {/* live certificate */}
      <div className="relative mx-auto w-full max-w-lg">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: state === "valid" ? -1 : -3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-xl bg-[#f7f3ea] text-[#1b1530] shadow-2xl shadow-black/50 transition-[filter] duration-500 ${
            state === "invalid" ? "grayscale" : ""
          }`}
        >
          <CertificatePaper
            name={
              found ? (
                found.studentName
              ) : (
                <span className="inline-block h-5 w-40 rounded bg-[#1b1530]/10 align-middle md:h-6" />
              )
            }
            course={found ? found.courseTitle : "دوره آی‌گرافیکال"}
            detail={found && hours ? `به مدت ${hours} ساعت آموزش` : "—"}
            date={found ? formatJalaliDate(found.issuedAt) : "—"}
            serial={found ? found.serial : serial.padEnd(SERIAL_LENGTH, "·")}
            overlay={
              (state === "idle" || state === "checking") && !reduce ? (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 z-20 h-16 bg-gradient-to-b from-transparent via-[#6d4cff]/25 to-transparent"
                  animate={{ top: ["-15%", "100%"] }}
                  transition={{
                    duration: state === "checking" ? 0.9 : 3.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ) : null
            }
          />

          {/* verdict stamp */}
          <AnimatePresence>
            {(state === "valid" || state === "invalid") && (
              <motion.div
                key={state}
                initial={{ opacity: 0, scale: 2.2, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: -14 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`absolute left-[7%] top-[20%] z-30 rounded-lg border-[3px] px-3 py-1 text-base font-black md:text-xl ${
                  state === "valid"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-red-600 text-red-600"
                }`}
              >
                {state === "valid" ? "تأیید شد ✓" : "یافت نشد"}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

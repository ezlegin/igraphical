"use client";

import { Button } from "@igraph/ui/components/ui/button";
import { igraphLogoIcon } from "@/public";
import { BadgeCheck, Check, QrCode, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import type { PointerEvent } from "react";
import SectionHeading from "./SectionHeading";

export default function Certificate() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });
  const glareX = useTransform(sry, [-15, 15], ["0%", "100%"]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 24);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 24);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section className="studio-card studio-noise relative overflow-hidden px-6 py-12 md:px-14 md:py-16">
      <div className="absolute -right-24 top-0 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <SectionHeading
            index="06"
            eyebrow="گواهی پایان دوره"
            title={
              <>
                مدرکی که <span className="text-gradient">واقعا</span>
                <br />
                قابل استعلامه
              </>
            }
            description="بعد از اتمام هر دوره، گواهی اختصاصی آی‌گرافیکال با کد یکتا صادر میشه. کارفرماها می‌تونن در چند ثانیه اصالتش رو آنلاین بررسی کنن."
          />
          <ul className="space-y-3 text-sm">
            {["کد یکتا و QR برای هر گواهی", "استعلام آنلاین در سایت", "قابل ارائه در رزومه و لینکدین"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <BadgeCheck size={18} className="text-lime" />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/verify-cert" className="inline-block pt-2">
            <Button size="lg" className="h-12 rounded-full px-7">
              <ShieldCheck />
              استعلام مدرک
            </Button>
          </Link>
        </div>

        <div className="flex justify-center [perspective:1200px]" onPointerMove={onMove} onPointerLeave={onLeave}>
          <motion.div
            style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, rotateZ: -6, y: 40 }}
            whileInView={{ opacity: 1, rotateZ: -3, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[1.414/1] w-full max-w-lg overflow-hidden rounded-xl bg-[#f7f3ea] text-[#1b1530] shadow-[0_50px_90px_-35px_hsl(var(--primary)/0.75)]"
          >
            {/* guilloche background */}
            <Guilloche />
            {/* moving glare */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 opacity-40 mix-blend-soft-light"
              style={{ background: "linear-gradient(105deg, transparent 30%, white 50%, transparent 70%)", backgroundSize: "250% 100%", backgroundPositionX: glareX }}
            />
            {/* double frame */}
            <div className="absolute inset-2.5 rounded-lg border-2 border-[#6d4cff]/70" />
            <div className="absolute inset-[15px] rounded-md border border-[#6d4cff]/25" />
            {["top-2 right-2", "top-2 left-2 -scale-x-100", "bottom-2 right-2 -scale-y-100", "bottom-2 left-2 -scale-100"].map((pos) => (
              <Corner key={pos} className={`absolute ${pos}`} />
            ))}

            <div
              className="relative z-10 flex h-full flex-col px-[8%] py-[6.5%]"
              style={{ transform: "translateZ(40px)" }}
            >
              {/* header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src={igraphLogoIcon} alt="" width={26} height={26} className="size-6 md:size-7" />
                  <span className="text-[11px] font-black md:text-xs">آی‌گرافیکال</span>
                </div>
                <span dir="ltr" className="text-[7px] font-semibold tracking-[0.35em] text-[#6d4cff] md:text-[8px]">
                  CERTIFICATE OF COMPLETION
                </span>
              </div>

              {/* body */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-black md:text-xl">گواهی پایان دوره</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-px w-8 bg-gradient-to-l from-[#6d4cff] to-transparent" />
                  <span className="size-1 rotate-45 bg-[#c7e83a]" />
                  <span className="h-px w-8 bg-gradient-to-r from-[#6d4cff] to-transparent" />
                </div>
                <p className="mt-2.5 text-[9px] text-[#1b1530]/55 md:text-[10px]">این گواهی با افتخار تقدیم می‌شود به</p>
                <p className="mt-1 text-xl font-black text-[#6d4cff] md:text-[26px]">نام هنرجوی شما</p>
                <p className="mt-2 max-w-[85%] text-[9px] leading-5 text-[#1b1530]/70 md:text-[10px]">
                  به پاس گذراندن موفق <span className="font-bold text-[#1b1530]">دوره جامع ادوبی ایلوستریتور</span>{" "}
                  به مدت ۱۰ ساعت آموزش پروژه‌محور
                </p>
              </div>

              {/* footer */}
              <div className="flex items-end justify-between gap-3">
                <div className="w-[30%] text-center">
                  <Signature />
                  <div className="h-px bg-[#1b1530]/30" />
                  <p className="mt-1 text-[8px] text-[#1b1530]/60 md:text-[9px]">مدیر آموزش آی‌گرافیکال</p>
                </div>
                <Seal />
                <div className="flex w-[30%] items-end justify-end gap-2">
                  <div className="text-end text-[7px] leading-4 text-[#1b1530]/55 md:text-[8px]">
                    <p>تاریخ: ۱۴۰۴/۰۸/۲۰</p>
                    <p dir="ltr" className="font-mono">IG-1404-08-2187</p>
                  </div>
                  <QrCode className="size-7 shrink-0 text-[#1b1530]/80 md:size-8" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Guilloche() {
  return (
    <svg aria-hidden className="absolute inset-0 size-full opacity-[0.09]" viewBox="0 0 400 283" preserveAspectRatio="none">
      {Array.from({ length: 14 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${40 + i * 15} C 70 ${10 + i * 15}, 130 ${70 + i * 15}, 200 ${40 + i * 15} S 330 ${10 + i * 15}, 400 ${40 + i * 15}`}
          fill="none"
          stroke="#6d4cff"
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="28" height="28" viewBox="0 0 28 28" className={className}>
      <path d="M2 26 V8 Q2 2 8 2 H26" fill="none" stroke="#6d4cff" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" fill="#c7e83a" />
    </svg>
  );
}

function Signature() {
  return (
    <svg aria-hidden viewBox="0 0 120 34" className="mx-auto h-6 w-full md:h-7">
      <path
        d="M6 24 C 18 6, 26 30, 34 16 S 46 4, 52 20 C 56 30, 64 10, 72 18 S 88 26, 96 12 C 100 6, 108 10, 114 16"
        fill="none"
        stroke="#1b1530"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Seal() {
  return (
    <div className="relative grid size-14 shrink-0 place-items-center md:size-16">
      <svg aria-hidden viewBox="0 0 64 64" className="absolute inset-0 size-full">
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x="30" y="1" width="4" height="10" rx="2" fill="#6d4cff" transform={`rotate(${i * 15} 32 32)`} />
        ))}
        <circle cx="32" cy="32" r="22" fill="#6d4cff" />
        <circle cx="32" cy="32" r="18.5" fill="none" stroke="#c7e83a" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
      <Check className="relative size-6 text-[#c7e83a]" strokeWidth={3} />
    </div>
  );
}

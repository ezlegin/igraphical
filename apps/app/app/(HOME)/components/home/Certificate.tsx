"use client";

import { Button } from "@igraph/ui/components/ui/button";
import { BadgeCheck, QrCode, ShieldCheck } from "lucide-react";
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
          <Link href="/verify-cert">
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
            className="relative aspect-[1.414/1] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1830] via-[#120f1f] to-[#0b0a12] p-6 shadow-[0_40px_80px_-30px_hsl(var(--primary)/0.6)] md:p-8"
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
              style={{ background: "linear-gradient(105deg, transparent 30%, white 50%, transparent 70%)", backgroundSize: "250% 100%", backgroundPositionX: glareX }}
            />
            <div className="absolute inset-3 rounded-xl border border-[#d4ff3f]/20" />
            <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(40px)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-white/40">CERTIFICATE</p>
                  <p className="mt-1 text-lg font-bold text-white">گواهی پایان دوره</p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-full bg-lime text-black">
                  <BadgeCheck size={24} />
                </span>
              </div>
              <div>
                <p className="text-xs text-white/50">این گواهی به</p>
                <p className="mt-1 text-2xl font-black text-white">نام هنرجوی شما</p>
                <p className="mt-2 text-xs text-white/50">
                  برای اتمام موفق <span className="text-primary">دوره جامع ادوبی ایلوستریتور</span>
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div className="en-digits text-[10px] text-white/40">
                  ID · IG-1404-08-2187
                </div>
                <QrCode size={40} className="text-white/70" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

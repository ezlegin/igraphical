"use client";

import { Button } from "@igraph/ui/components/ui/button";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import CertificatePaper from "@/components/CertificatePaper";
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
            {[
              "کد یکتا و QR برای هر گواهی",
              "استعلام آنلاین در سایت",
              "قابل ارائه در رزومه و لینکدین",
            ].map((t) => (
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

        <div
          className="flex justify-center [perspective:1200px]"
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <motion.div
            style={{
              rotateX: srx,
              rotateY: sry,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, rotateZ: -6, y: 40 }}
            whileInView={{ opacity: 1, rotateZ: -3, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[1.414/1] w-full max-w-lg overflow-hidden rounded-xl bg-[#f7f3ea] text-[#1b1530] shadow-[0_50px_90px_-35px_hsl(var(--primary)/0.75)]"
          >
            <CertificatePaper
              name="نام هنرجوی شما"
              course="دوره جامع ادوبی ایلوستریتور"
              detail="به مدت ۱۰ ساعت آموزش پروژه‌محور"
              date="۱۴۰۴/۰۸/۲۰"
              serial="IG-1404-08-2187"
              depth
              overlay={
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 opacity-40 mix-blend-soft-light"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, white 50%, transparent 70%)",
                    backgroundSize: "250% 100%",
                    backgroundPositionX: glareX,
                  }}
                />
              }
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

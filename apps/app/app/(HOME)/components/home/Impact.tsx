"use client";

import AnimatedCounter from "@/components/motion/AnimatedCounter";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import {
  Award,
  Clock,
  Headphones,
  Infinity as InfinityIcon,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

export default function Impact() {
  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        index="04"
        eyebrow="چرا آی‌گرافیکال؟"
        title={
          <>
            عددها <span className="text-gradient">خودشون</span> حرف می‌زنن
          </>
        }
        description="مدرسه هنر آی‌گرافیکال؛ جایی که یادگیری فقط درس و تمرین نیست، یه تجربه‌ی باحاله."
      />

      <Stagger className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-3 md:grid-cols-4">
        {/* hero stat */}
        <StaggerItem className="col-span-2 row-span-2">
          <div className="studio-card studio-noise relative flex h-full flex-col justify-between overflow-hidden p-5 md:p-6">
            <div className="absolute -left-16 -top-16 size-56 rounded-full bg-primary/25 blur-3xl" />
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Users size={17} />
            </span>
            <div className="relative">
              <p className="en-digits text-4xl font-black tracking-tight md:text-5xl">
                <AnimatedCounter value={6} />
                <span className="text-primary">K+</span>
              </p>
              <p className="mt-1.5 font-semibold">کاربر فعال ماهانه</p>
              <p className="mt-1 text-sm text-muted-foreground">که هر روز با آی‌گرافیکال یاد می‌گیرن و می‌سازن.</p>
            </div>
            <MiniBars />
          </div>
        </StaggerItem>

        <StaggerItem>
          <StatCard icon={Star} tone="#ffc928" value={<><AnimatedCounter value={4.9} decimals={1} /><span className="text-base text-muted-foreground">/5</span></>} label="میانگین امتیاز دانشجوها" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Clock} tone="#d4ff3f" value={<><AnimatedCounter value={200} />K+</>} label="ساعت تماشای ماهانه" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Award} tone="#f472b6" value={<>+<AnimatedCounter value={3} />K</>} label="فارغ‌التحصیل از ۱۴۰۱" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Users} tone="#60a5fa" value={<>+<AnimatedCounter value={100} />K</>} label="همراه در شبکه‌های اجتماعی" />
        </StaggerItem>

        {/* features */}
        <StaggerItem className="col-span-2">
          <Feature icon={InfinityIcon} title="یک اشتراک، همه دوره‌ها" text="با یک اشتراک به کل کتابخانه آموزشی و دوره‌های جدید دسترسی داری." />
        </StaggerItem>
        <StaggerItem>
          <Feature icon={RefreshCw} title="همیشه به‌روز" text="آپدیت‌ترین آموزش‌ها و نسخه‌ها." compact />
        </StaggerItem>
        <StaggerItem>
          <Feature icon={Headphones} title="پشتیبانی سریع" text="از مدرس بپرس، جواب بگیر." compact />
        </StaggerItem>
      </Stagger>
    </section>
  );
}

function StatCard({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof Star;
  tone: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="studio-card flex h-full flex-col justify-between gap-4 p-4 md:p-5"
    >
      <span
        className="flex size-8 items-center justify-center rounded-lg"
        style={{ background: `${tone}1f`, color: tone }}
      >
        <Icon size={15} />
      </span>
      <div>
        <p className="en-digits text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
  compact,
}: {
  icon: typeof Star;
  title: string;
  text: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`studio-card flex h-full gap-3 p-4 md:p-5 ${compact ? "flex-col" : "items-center"}`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-lime">
        <Icon size={17} />
      </span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">{text}</p>
      </div>
    </motion.div>
  );
}

function MiniBars() {
  const bars = [30, 45, 38, 60, 52, 75, 68, 90, 82, 100];
  return (
    <div className="relative mt-4 flex h-12 items-end gap-1.5" dir="ltr">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="flex-1 rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

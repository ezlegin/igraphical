import RecaptchaWrapper from "@igraph/ui/components/RecaptchaWrapper";
import { Hash, Search, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import VerifyStudio from "./VerifyStudio";

const steps = [
  {
    icon: Hash,
    title: "سریال رو پیدا کن",
    text: "شماره ۶ رقمی پایین هر گواهی، کنار کد QR چاپ شده.",
  },
  {
    icon: Search,
    title: "وارد کن",
    text: "به محض تایپ رقم آخر، استعلام خودکار انجام می‌شه.",
  },
  {
    icon: ShieldCheck,
    title: "نتیجه رو ببین",
    text: "نام هنرجو، دوره و تاریخ صدور از سامانه آی‌گرافیکال نمایش داده می‌شه.",
  },
];

const page = () => {
  return (
    <div className="space-y-24 pb-24 pt-8 md:pt-14">
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_55%_60%_at_50%_45%,#000_30%,transparent_100%)]">
          <div className="studio-grid absolute inset-0" />
        </div>
        <RecaptchaWrapper
          recaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        >
          <VerifyStudio />
        </RecaptchaWrapper>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:gap-10">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="space-y-3 border-t border-foreground/10 pt-5"
          >
            <p className="flex items-center gap-2 text-sm font-bold">
              <span className="en-digits text-xs text-primary">0{i + 1}</span>
              <s.icon size={16} className="text-primary" />
              {s.title}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </section>

      <p className="mx-auto max-w-2xl text-center text-xs leading-6 text-muted-foreground">
        کارفرمای محترم؛ اگه گواهی‌ای در سامانه پیدا نشد یا اطلاعاتش با رزومه
        هم‌خوانی نداشت، لطفاً از طریق صفحه تماس با ما اطلاع بدید.
      </p>
    </div>
  );
};

export default page;

export const metadata: Metadata = {
  title: "استعلام مدرک",
  alternates: { canonical: "/verify-cert" },
  description:
    "استعلام آنلاین مدرک دوره‌های گذرانده‌شده در آی‌گرافیکال. به‌سادگی و تنها با وارد کردن سریال مدرک اعتبار مدرک خود را بررسی کنید.",
};

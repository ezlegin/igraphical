import LoginForm from "@/components/forms/login/LoginForm";
import { database } from "@igraph/database";
import IgraphLogo from "@igraph/ui/components/IgraphLogo";
import {
  ArrowUpLeft,
  Award,
  Layers,
  MessageCircleQuestion,
} from "lucide-react";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import ArtboardScene from "./ArtboardScene";

export interface LoginFormsProps {
  setLoginStep: Dispatch<SetStateAction<"INPUT" | "OTP" | "REGISTER">>;
  setInputFormValue?: Dispatch<React.SetStateAction<string>>;
  inputFormValue?: string;
  setIsNewUser?: Dispatch<React.SetStateAction<boolean>>;
  isNewUser?: boolean;
  redirectTo?: string;
  onSuccess?: () => void;
  /** Set by the OTP step; proves verification happened and unlocks login. */
  loginToken?: string;
  setLoginToken?: Dispatch<React.SetStateAction<string>>;
}

// Rendered per request: the stats need the database, which the image build
// (CI) doesn't have.
export const dynamic = "force-dynamic";

const perks = [
  { icon: Layers, text: "همه دوره‌ها با یک اشتراک" },
  { icon: MessageCircleQuestion, text: "پرسش و پاسخ با مدرس" },
  { icon: Award, text: "مدرک پایان دوره با کد استعلام" },
];

const page = async () => {
  // decorative numbers only; never let them break the login page
  const [courses, students] = await Promise.all([
    database.course.count({ where: { status: { not: "DRAFT" } } }),
    database.user.count(),
  ]).catch(() => [0, 0]);

  return (
    <div className="mx-auto grid min-h-screen max-w-screen-xl grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,420px)_minmax(0,680px)] lg:justify-between lg:gap-10">
      {/* form column */}
      <section className="flex flex-col py-2 lg:py-6">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="صفحه اصلی">
            <IgraphLogo />
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-1 rounded-full border border-foreground/10 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            صفحه اصلی
            <ArrowUpLeft
              size={13}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        <div className="my-auto space-y-6 py-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              یک قدم تا شروع یادگیری
            </span>
            <h1 className="text-2xl font-black leading-snug md:text-3xl">
              به <span className="text-gradient">آی‌گرافیکال</span> خوش آمدی
            </h1>
            <p className="text-sm text-muted-foreground">
              ورود و ثبت‌نام در یک مرحله، فقط با شماره موبایل یا ایمیل.
            </p>
          </div>

          <div className="login-panel studio-card studio-noise overflow-hidden shadow-[0_30px_90px_-50px_hsl(var(--primary)/0.5)]">
            <div className="flex items-center gap-1.5 border-b border-foreground/10 px-5 py-3">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ms-auto text-[11px] text-muted-foreground">
                login.ig
              </span>
            </div>
            <div className="relative">
              <LoginForm />
            </div>
          </div>

          <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {perks.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 rounded-2xl border border-foreground/10 bg-background/40 px-3 py-2.5 text-[11px] text-muted-foreground"
              >
                <Icon size={15} className="shrink-0 text-lime" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-muted-foreground">
          با ورود،{" "}
          <Link
            href="/terms-and-conditions"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            قوانین و مقررات
          </Link>{" "}
          آی‌گرافیکال را می‌پذیرید.
        </p>
      </section>

      {/* artboard column */}
      <section className="hidden items-center py-6 lg:flex">
        <ArtboardScene courses={courses} students={students} />
      </section>
    </div>
  );
};

export default page;

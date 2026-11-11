import { Metadata } from "next";
import "./login.css";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="login-canvas min-h-screen">{children}</main>;
}

export const metadata: Metadata = {
  title: `🔏 ورود یا ثبت نام`,
  description:
    "ورود یا ثبت‌نام در آی‌گرافیکال به شما امکان دسترسی به دوره‌ها، ذخیره پیشرفت، دریافت گواهی و ارتباط مستقیم با مدرسین را می‌دهد.",
};

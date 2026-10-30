import MobileNavbar from "@/components/MobileNavbar";
import SimpleFooter from "@/components/SimpleFooter";
import { authenticateSession } from "@/lib/auth";
import IgraphLogoSquare from "@igraph/ui/components/IgraphLogoSquare";
import NotifBar from "@igraph/ui/components/NotifBar";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await authenticateSession();

  return (
    <div className="relative mx-auto grid min-h-screen max-w-screen-xl grid-cols-1 grid-rows-[auto_1fr_auto] overflow-clip p-3">
      <div className="studio-grid studio-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-40 w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />

      <div className="space-y-3">
        <NotifBar />
        <header className="flex items-center justify-between rounded-full border border-foreground/10 bg-background/40 p-1.5 pe-4 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <IgraphLogoSquare size={40} />
            <span className="hidden text-sm font-bold sm:block">آی‌گرافیکال</span>
          </Link>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={15} className="text-lime" />
            پرداخت امن
          </span>
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight size={14} />
            ادامه خرید
          </Link>
        </header>
      </div>

      <main className="relative pb-24 pt-10 md:pt-14">
        {children}
        <MobileNavbar />
      </main>

      <div className="hidden md:block">
        <SimpleFooter />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: {
    default: "سبد خرید",
    template: "%s - آی‌گرافیکال",
  },
  description: "آی‌گرافیکال: جایی که خلاقیت جان می‌گیرد!",
};

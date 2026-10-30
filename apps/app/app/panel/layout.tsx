import { SideBar } from "@/app/panel/components/SideBar";
import { getSessionUser } from "@/data/user";
import { authenticateSession } from "@/lib/auth";
import NotifBar from "@igraph/ui/components/NotifBar";
import { Button } from "@igraph/ui/components/ui/button";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@igraph/ui/components/ui/sidebar";
import UserBar from "@igraph/ui/components/UserBar";
import { Home } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  await authenticateSession();

  return (
    <div className="relative isolate">
      <div className="studio-grid studio-fade pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px]" />
      <div className="pointer-events-none fixed left-1/3 top-0 -z-10 h-48 w-[600px] rounded-full bg-primary/15 blur-[120px]" />

      <SidebarProvider>
        <SideBar user={user} />
        <main className="mx-auto w-full min-w-0 p-4 sm:max-w-screen-xl md:p-6">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <SidebarTrigger
              variant={"outline"}
              size={"icon"}
              className="size-11 rounded-full border-foreground/15"
            />

            <div className="flex gap-2">
              <Link href={"/"}>
                <Button
                  className="size-11 rounded-full border-foreground/15 text-muted-foreground"
                  size={"icon"}
                  variant={"outline"}
                >
                  <Home />
                </Button>
              </Link>
              <UserBar user={user!} />
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <NotifBar />
            </div>

            <div className="mr-auto hidden lg:block">
              <UserBar user={user!} />
            </div>
          </div>

          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}

// SEO
export const metadata: Metadata = {
  title: {
    default: "حساب کاربری",
    template: "%s - حساب کاربری",
  },
  description: "آی‌گرافیکال: جایی که خلاقیت جان می‌گیرد!",
};

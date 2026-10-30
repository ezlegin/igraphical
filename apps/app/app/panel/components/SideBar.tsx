"use client";

import { loginPageRoute } from "@/middleware";
import { Image, User } from "@igraph/database";
import Avatar from "@igraph/ui/components/Avatar";
import IgraphLogo from "@igraph/ui/components/IgraphLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@igraph/ui/components/ui/sidebar";
import { cn } from "@igraph/utils";
import {
  CreditCard,
  Headset,
  LogOut,
  PanelRight,
  Pencil,
  TvMinimalPlay,
  User as UserIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

interface UserType extends User {
  image: Image | null;
}

interface Props {
  user: UserType | null | undefined;
}
export function SideBar({ user }: Props) {
  if (!user) return redirect(loginPageRoute);

  const pathName = usePathname();

  return (
    <Sidebar side="right" className="border-l border-foreground/10 bg-background p-3">
      <SidebarHeader className="space-y-6 p-3">
        <Link href={"/"}>
          <IgraphLogo />
        </Link>

        <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-foreground/10 bg-card p-3">
          <div className="absolute -left-8 -top-8 size-24 rounded-full bg-primary/25 blur-2xl" />
          <div className="relative flex min-w-0 items-center gap-2.5">
            <Avatar src={user.image?.url} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-foreground">
                {user.fullName}
              </span>
              <span className="en-digits text-[11px] text-muted-foreground">
                {user.phone}
              </span>
            </div>
          </div>

          <Link
            href={"/panel/profile"}
            aria-label="ویرایش پروفایل"
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Pencil size={14} />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>منو کاربری</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentMenu.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton size={"lg"} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        pathName === item.href
                          ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary))] hover:bg-primary hover:text-primary-foreground"
                          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                        "rounded-xl transition-colors",
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="mb-5">
          {footerMenu.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="cursor-pointer" onClick={() => signOut()}>
                <LogOut />
                <span>خروج از حساب</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// CONTENT MENI ITEMS
const contentMenu = [
  {
    title: "داشبورد",
    href: "/panel",
    icon: PanelRight,
  },
  {
    title: "دوره‌ها",
    href: "/panel/courses",
    icon: TvMinimalPlay,
  },
  {
    title: "پشتیبانی",
    href: "/panel/tickets",
    icon: Headset,
  },
  {
    title: "پرداخت‌ها",
    href: "/panel/payments",
    icon: CreditCard,
  },
];

// FOOTER MENU ITEMS
const footerMenu = [
  {
    title: "پروفایل",
    href: "/panel/profile",
    icon: UserIcon,
  },
];

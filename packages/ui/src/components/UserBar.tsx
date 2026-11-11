"use client";

import { Image, User } from "@igraph/database";
import {
  ChevronDown,
  CreditCard,
  Headset,
  LogOut,
  PanelRight,
  TvMinimalPlay,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@igraph/ui/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Avatar from "./Avatar";

interface UserType extends User {
  image: Image | null;
}
interface Props {
  user: UserType;
}

const UserBar = ({ user }: Props) => {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 py-1 pe-3 ps-1 text-sm font-medium backdrop-blur transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 data-[state=open]:border-primary/40">
        <Avatar src={user?.image?.url} size={28} />
        <span className="max-w-[140px] truncate">{user?.fullName}</span>
        <ChevronDown
          size={15}
          className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border-foreground/10 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
      >
        {/* who is signed in */}
        <div className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] p-3">
          <Avatar src={user?.image?.url} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.fullName}</p>
            <p className="en-digits truncate text-[11px] text-muted-foreground">
              {user?.phone || user?.email}
            </p>
          </div>
        </div>

        <DropdownMenuGroup className="mt-1.5 space-y-0.5">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.href}
              asChild
              className="cursor-pointer gap-3 rounded-xl px-2 py-2 text-[13px] focus:bg-foreground/[0.06]"
            >
              <Link href={item.href}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon size={16} />
                </span>
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-foreground/10" />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer gap-3 rounded-xl px-2 py-2 text-[13px] text-muted-foreground focus:bg-destructive/10 focus:text-destructive"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <LogOut size={16} />
          </span>
          خروج از حساب
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const menuItems = [
  { label: "داشبورد", href: "/panel", icon: PanelRight },
  { label: "دوره‌های من", href: "/panel/courses", icon: TvMinimalPlay },
  { label: "پشتیبانی", href: "/panel/tickets", icon: Headset },
  { label: "پرداخت‌ها", href: "/panel/payments", icon: CreditCard },
  { label: "پروفایل", href: "/panel/profile", icon: UserIcon },
];

export default UserBar;

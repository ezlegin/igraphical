"use client";

import { BookOpen, CheckCircle, Home, TvMinimalPlay, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const rootItems = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/courses", label: "دوره ها", icon: TvMinimalPlay },
  { href: "/blog", label: "بلاگ", icon: BookOpen },
  { href: "/verify-cert", label: "استعلام مدرک", icon: CheckCircle },
  { href: "/panel", label: "حساب کاربری", icon: User },
];

export default function MobileNavbar() {
  const pathName = usePathname();
  const hideMobileNavbar = pathName.startsWith("/courses/");

  return (
    !hideMobileNavbar && (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-md md:hidden z-50">
        <ul className="flex justify-around items-center h-14">
          {rootItems.map(({ href, label, icon: Icon }) => (
            <li key={href} className="w-1/5 relative">
              {(href === "/" ? pathName === "/" : pathName.startsWith(href)) && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute -top-px inset-x-3 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Link
                href={href}
                className={`flex flex-col gap-0.5 items-center active:scale-90 transition-transform ${
                  (href === "/" ? pathName === "/" : pathName.startsWith(href))
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="text-[11px]">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  );
}

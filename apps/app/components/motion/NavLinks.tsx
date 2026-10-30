"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface Item {
  label: string;
  href: string;
}

export default function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const active = items.find((i) => pathname.startsWith(i.href))?.href ?? null;
  const highlighted = hovered ?? active;

  return (
    <ul
      className="items-center text-sm text-muted-foreground hidden md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item) => (
        <li key={item.href} className="relative" onMouseEnter={() => setHovered(item.href)}>
          {highlighted === item.href && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-full bg-primary/15"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <Link
            href={item.href}
            className={`relative block px-5 py-2 transition-colors ${
              highlighted === item.href ? "text-foreground" : ""
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

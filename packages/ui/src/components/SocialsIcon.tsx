import { Instagram, Send, Youtube } from "lucide-react";
import Link from "next/link";
import React from "react";

const SocialsIcon = () => {
  return (
    <ul className="flex gap-3 items-center text-muted-foreground">
      {socials.map((social) => (
        <li key={social.href}>
          <Link href={social.href}>{social.icon}</Link>
        </li>
      ))}
    </ul>
  );
};

const socials = [
  {
    href: "https://instagram.com/igraphical.ir",
    icon: <Instagram size={18} />,
  },
  { href: "https://youtube.com/c/@igraphical", icon: <Youtube size={21} /> },
  { href: "https://t.me/igraphical", icon: <Send size={17} /> },
];

export default SocialsIcon;

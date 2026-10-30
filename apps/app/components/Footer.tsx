import IgraphLogoSquare from "@igraph/ui/components/IgraphLogoSquare";
import SocialsIcon from "@igraph/ui/components/SocialsIcon";
import { ArrowUpLeft, Copyright } from "lucide-react";
import Link from "next/link";
import Reveal from "./motion/Reveal";

const columns = [
  {
    title: "آی‌گرافیکال",
    links: [
      { label: "صفحه اصلی", href: "/" },
      { label: "مدرسین", href: "/tutors" },
      { label: "تدریس در آی‌گرافیکال", href: "/teach" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
  {
    title: "یادگیری",
    links: [
      { label: "همه دوره‌ها", href: "/courses" },
      { label: "دوره‌های رایگان", href: "/courses?isFree=true" },
      { label: "وبلاگ", href: "/blog" },
      { label: "استعلام مدرک", href: "/verify-cert" },
    ],
  },
  {
    title: "پشتیبانی",
    links: [
      { label: "سوالات متداول", href: "/faq" },
      { label: "قوانین و حریم شخصی", href: "/terms-and-conditions" },
      { label: "حساب کاربری", href: "/panel" },
    ],
  },
];

const Footer = () => {
  return (
    <Reveal className="mt-4">
      <footer className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-card/40 px-6 pb-6 pt-12 md:px-12 md:pt-16">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <IgraphLogoSquare />
            </Link>
            <p className="max-w-xs text-sm leading-7 text-muted-foreground">
              مدرسه هنر آی‌گرافیکال؛ جایی که ایده‌ها ساخته میشن. آموزش پروژه‌محور طراحی گرافیک، از صفر تا ورود به بازار کار.
            </p>
            <SocialsIcon />
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <p className="text-sm font-bold">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                      <ArrowUpLeft
                        size={13}
                        className="opacity-0 transition-all group-hover:-translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <a
            className="h-[120px] w-[90px] overflow-hidden rounded-xl bg-background"
            referrerPolicy="origin"
            target="_blank"
            href="https://trustseal.enamad.ir/?id=214895&Code=1Wgxc21JlxfhD1Coppnv"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              referrerPolicy="origin"
              data-code="1Wgxc21JlxfhD1Coppnv"
              src="https://trustseal.enamad.ir/logo.aspx?id=214895&Code=1Wgxc21JlxfhD1Coppnv"
              alt="e-namad"
              className="cursor-pointer"
            />
          </a>
        </div>

        {/* giant wordmark */}
        <p
          aria-hidden
          dir="ltr"
          className="pointer-events-none relative mt-14 select-none bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-center text-[14vw] font-black leading-none tracking-tighter text-transparent xl:text-[180px]"
        >
          iGraphical
        </p>

        <div className="relative mt-2 flex flex-col items-center justify-between gap-2 border-t border-foreground/10 pt-5 text-xs text-muted-foreground md:flex-row">
          <p className="flex items-center gap-1.5">
            <Copyright size={14} />
            تمامی حقوق برای شرکت آی‌گرافیکال محفوظ است.
          </p>
          <p>ساخته شده با 💜 برای طراح‌های ایرانی</p>
        </div>
      </footer>
    </Reveal>
  );
};

export default Footer;

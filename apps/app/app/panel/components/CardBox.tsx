import { ArrowUpLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const CardBox = ({
  title,
  btn,
  children,
  className,
}: {
  title: string;
  btn?: { title: string; href: string };
  children: ReactNode;
  className?: string;
}) => {
  return (
    <section className={`studio-card flex flex-col ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="flex items-center gap-2.5 font-bold">
          <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-lime" />
          {title}
        </h2>

        {btn && (
          <Link
            href={btn.href}
            className="group flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {btn.title}
            <ArrowUpLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="h-full space-y-3 p-5 pt-2">{children}</div>
    </section>
  );
};

export default CardBox;

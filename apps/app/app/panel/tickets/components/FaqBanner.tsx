import { Button } from "@igraph/ui/components/ui/button";
import { Headset, Plus } from "lucide-react";
import Link from "next/link";

const FaqBanner = () => {
  return (
    <section className="studio-card studio-noise relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center md:flex-row md:p-8 md:text-right">
      <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/25 blur-3xl" />
      <span className="relative flex size-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary/15 text-primary">
        <Headset size={30} />
      </span>
      <div className="relative flex-1 space-y-1">
        <h2 className="text-lg font-bold">قبل از ارسال تیکت</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          با مراجعه به صفحه <span className="font-semibold text-primary">سوالات متداول</span> می‌تونی خیلی سریع
          مشکلت رو حل کنی!
        </p>
      </div>
      <div className="relative flex gap-3">
        <Link href={"/faq"}>
          <Button variant="outline" className="rounded-full border-foreground/15">
            سوالات متداول
          </Button>
        </Link>
        <Link href={"/panel/tickets/new"}>
          <Button className="rounded-full">
            <Plus />
            تیکت جدید
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FaqBanner;

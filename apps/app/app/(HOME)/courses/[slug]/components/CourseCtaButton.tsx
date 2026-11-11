"use client";

import { enrollInCourse } from "@/actions/enrollment";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { cn } from "@igraph/ui/lib/utils";
import { ArrowLeft, Crown, TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { CourseCtaState } from "./types";

/** The one primary action on the course page, in whatever state applies. */
export default function CourseCtaButton({
  cta,
  className,
  size = "lg",
}: {
  cta: CourseCtaState;
  className?: string;
  size?: "lg" | "sm";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  const base = cn(
    "group rounded-full",
    size === "lg" ? "h-12 px-7" : "h-10 px-5 text-sm",
    className,
  );

  if (cta.classroomId && cta.canStart)
    return (
      <Link href={`/classroom/${cta.classroomId}`}>
        <Button className={base}>
          <TvMinimalPlay size={18} />
          ادامه در کلاس درس
        </Button>
      </Link>
    );

  if (cta.canStart)
    return (
      <Button
        className={base}
        disabled={pending}
        onClick={() =>
          start(async () => {
            if (!cta.isLoggedIn)
              return router.push(`/login?callbackUrl=${pathname}`);
            const res = await enrollInCourse(cta.courseId);
            if ("classroomId" in res && res.classroomId)
              return router.push(`/classroom/${res.classroomId}`);
            if (res.error) toast.error(res.error);
            if ("needsPlan" in res && res.needsPlan) router.push("/plans");
          })
        }
      >
        <Loader loading={pending} />
        {cta.isFree ? "شروع رایگان دوره" : "شروع دوره"}
        <ArrowLeft
          className="transition-transform group-hover:-translate-x-1"
          size={18}
        />
      </Button>
    );

  return (
    <Link href="/plans">
      <Button className={base}>
        <Crown size={18} />
        {cta.classroomId ? "تمدید اشتراک" : "خرید اشتراک و شروع"}
      </Button>
    </Link>
  );
}

"use client";

import { enrollInCourse } from "@/actions/enrollment";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { Crown, TvMinimalPlay, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

const SubscriptionCourseButton = ({
  courseId,
  classroomId,
  canStart,
  isLoggedIn,
}: {
  courseId: number;
  classroomId?: string;
  /** free course or active subscription (or valid legacy enrollment) */
  canStart: boolean;
  isLoggedIn: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  const onStart = () =>
    start(async () => {
      if (!isLoggedIn) return router.push(`/login?callbackUrl=${pathname}`);
      const res = await enrollInCourse(courseId);
      if ("classroomId" in res && res.classroomId)
        return router.push(`/classroom/${res.classroomId}`);
      if (res.error) toast.error(res.error);
      if ("needsPlan" in res && res.needsPlan) router.push("/plans");
    });

  const button =
    classroomId && canStart ? (
      <Link href={`/classroom/${classroomId}`}>
        <Button variant="lightPrimary" className="w-full">
          <TvMinimalPlay size={22} />
          ورود به کلاس درس
        </Button>
      </Link>
    ) : canStart ? (
      <Button className="w-full" disabled={pending} onClick={onStart}>
        <Loader loading={pending} />
        <UserPlus />
        شروع دوره
      </Button>
    ) : (
      <Link href="/plans">
        <Button className="w-full">
          <Crown size={20} />
          {classroomId ? "تمدید اشتراک" : "خرید اشتراک و شروع دوره"}
        </Button>
      </Link>
    );

  return (
    <>
      <div className="pb-3">{button}</div>
      <div className="lg:hidden">
        <div className="card fixed bottom-0 left-1/2 w-full -translate-x-1/2 rounded-bl-none rounded-br-none px-4">
          {button}
        </div>
      </div>
    </>
  );
};

export default SubscriptionCourseButton;

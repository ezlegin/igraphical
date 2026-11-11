"use client";

import { enrollInCourse } from "@/actions/enrollment";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

/** Brings a removed course back to the active list, if a slot is free. */
const RestoreCourseButton = ({ courseId }: { courseId: number }) => {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      size="sm"
      variant="lightPrimary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await enrollInCourse(courseId);
          if (res.error) {
            toast.error(res.error);
            if ("needsPlan" in res && res.needsPlan) router.push("/plans");
            return;
          }
          toast.success("دوره دوباره فعال شد.");
          router.refresh();
        })
      }
    >
      <Loader loading={pending} />
      فعال‌سازی دوباره
    </Button>
  );
};

export default RestoreCourseButton;

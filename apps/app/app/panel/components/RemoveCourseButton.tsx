"use client";

import { archiveEnrollment } from "@/actions/enrollment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@igraph/ui/components/ui/alert-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

/** Removes a course from the active list (frees a slot, keeps progress). */
const RemoveCourseButton = ({
  enrollmentId,
  title,
}: {
  enrollmentId: number;
  title: string;
}) => {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onRemove = () =>
    start(async () => {
      const res = await archiveEnrollment(enrollmentId);
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      if ("success" in res) toast.success(res.success);
      router.refresh();
    });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={pending}
          aria-label={`حذف «${title}» از دوره‌های من`}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <X size={12} />
          حذف از دوره‌ها
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">
            حذف «{title}» از دوره‌های من؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            با حذف این دوره، یک جایگاه برای شروع دوره جدید آزاد می‌شود. پیشرفت
            شما محفوظ می‌ماند و هر زمان بخواهید می‌توانید دوره را دوباره فعال
            کنید.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction onClick={onRemove}>
            حذف از دوره‌های من
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveCourseButton;

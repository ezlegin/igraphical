"use client";

import { createReview } from "@/actions/review";
import {
  courseReviewFormSchema,
  CourseReviewFormType,
} from "@/lib/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Loader from "@igraph/ui/components/Loader";
import Rating from "@igraph/ui/components/Rating";
import { Button } from "@igraph/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@igraph/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@igraph/ui/components/ui/form";
import { Textarea } from "@igraph/ui/components/ui/textarea";
import { Star, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
const MIN_REVIEW = 40; // same as courseReviewFormSchema
const ratingLabels = ["ضعیف", "قابل قبول", "خوب", "خیلی خوب", "عالی"];

interface Props {
  userId: number;
  courseId: number;
}

const CourseRatingForm = ({ userId, courseId }: Props) => {
  //HOOKS
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CourseReviewFormType>({
    resolver: zodResolver(courseReviewFormSchema),
    defaultValues: {
      rating: rating,
      review: "",
    },
  });

  const handleRatingSubmit = (rating: number) => {
    setRating(rating);
    form.setValue("rating", rating);
  };

  const onSubmit = async (data: CourseReviewFormType) => {
    const res = await createReview(data, userId, courseId);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    if (res.success) {
      toast.success(res.success);
      setIsOpen(false);
      router.refresh();
    }
  };

  const reviewLength =
    form.watch("review")?.length > 100 ? 100 : form.watch("review")?.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"secondary"}>
          <Star size={15} />
          ثبت امتیاز
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="max-w-md gap-5">
        <div className="space-y-2 text-center">
          <DialogTitle className="text-base">
            امتیاز شما به این دوره
          </DialogTitle>
          <DialogDescription className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] text-amber-500">
            <TriangleAlert size={13} />
            امتیاز و نظر پس از ثبت قابل تغییر نیست
          </DialogDescription>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Rating
            size={30}
            rating={rating}
            handleRatingSubmit={handleRatingSubmit}
          />
          <p className="h-4 text-xs text-muted-foreground">
            {rating > 0 ? ratingLabels[rating - 1] : "روی ستاره‌ها بزنید"}
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    {rating > 0 && (
                      <Textarea
                        {...field}
                        className="block min-h-[110px] w-full resize-none rounded-2xl border border-foreground/10 bg-background/40 p-3 text-sm focus-visible:border-primary/60 focus-visible:ring-0"
                        placeholder="نظر شما درباره این دوره..."
                        value={field.value}
                        onChange={(e) => {
                          // Replace multiple consecutive spaces with a single space
                          const valueWithSingleSpaces = e.target.value.replace(
                            /\s{2,}/g,
                            " ",
                          );
                          field.onChange(valueWithSingleSpaces);
                        }}
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {rating > 0 && (
              <div className="space-y-1.5">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    style={{ width: `${reviewLength || 0}%` }}
                    className={`h-full rounded-full transition-all ${
                      reviewLength >= MIN_REVIEW
                        ? "bg-gradient-to-l from-primary to-lime"
                        : "bg-primary"
                    }`}
                  />
                  {/* the minimum length mark on the bar (bar is 100 chars wide) */}
                  <span className="absolute inset-y-0 right-[40%] w-px bg-foreground/40" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span
                    className={
                      reviewLength >= MIN_REVIEW ? "text-lime" : undefined
                    }
                  >
                    {reviewLength >= 100
                      ? "عالی، ممنون از نظر کاملت"
                      : reviewLength >= MIN_REVIEW
                        ? "خوبه، قابل ثبت است"
                        : `حداقل ${MIN_REVIEW - (reviewLength || 0)} حرف دیگر بنویسید`}
                  </span>
                  <span className="en-digits">
                    {form.watch("review")?.length || 0}
                  </span>
                </div>
              </div>
            )}

            <Button
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="h-11 w-full rounded-full"
            >
              <Loader loading={form.formState.isSubmitting} />
              ثبت امتیاز
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseRatingForm;

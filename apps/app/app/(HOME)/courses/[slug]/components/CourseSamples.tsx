import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@igraph/ui/components/ui/dialog";
import Image from "next/image";
import DetailSection from "./DetailSection";

interface Props {
  courseTitle: string;
  exercises: { title: string; url: string }[] | undefined;
}

// Student work as a swipeable film strip.
const CourseExercise = ({ exercises, courseTitle }: Props) => {
  if (!exercises?.length) return null;

  return (
    <DetailSection
      eyebrow="نمونه‌کارها"
      title="چیزهایی که توی این دوره ساخته می‌شه"
    >
      <div className="studio-mask-x -mx-3 overflow-x-auto px-3 pb-3 [scrollbar-width:none]">
        <div className="flex snap-x snap-mandatory gap-3">
          {exercises.map((item, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative aspect-[4/5] w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-foreground/10 md:w-64"
                >
                  <Image
                    alt={`${courseTitle} - نمونه ${index + 1}`}
                    src={item.url}
                    fill
                    sizes="256px"
                    draggable={false}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>
              </DialogTrigger>
              <DialogContent className="flex w-fit max-w-4xl flex-col items-center gap-2 border-none bg-card p-1.5 pb-2">
                <Image
                  alt={courseTitle}
                  src={item.url}
                  width={900}
                  height={900}
                  draggable={false}
                  className="rounded-lg"
                />
                <DialogTitle className="text-sm font-medium text-muted-foreground">
                  نمونه‌ای از تمرین‌های این دوره
                </DialogTitle>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </DetailSection>
  );
};

export default CourseExercise;

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@igraph/ui/components/ui/dialog";
import { ScrollArea } from "@igraph/ui/components/ui/scroll-area";
import Image from "next/image";
import DetailSection from "./DetailSection";

interface Props {
  courseTitle: string;
  exercises:
    | {
        title: string;
        url: string;
      }[]
    | undefined;
}

const CourseExercise = ({ exercises, courseTitle }: Props) => {
  return (
    exercises && (
      <DetailSection title="تمرین‌ها و نمونه‌کارهای دوره">

        <ScrollArea className="rounded-md h-96 lg:h-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-2 px-4">
            {exercises.map((item, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <Image
                    key={index}
                    alt={courseTitle}
                    src={item.url}
                    width={300}
                    height={300}
                    draggable={false}
                    className="aspect-square cursor-pointer rounded-2xl object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </DialogTrigger>

                <DialogContent className="max-w-4xl w-fit gap-2 p-1.5 border-none pb-2 bg-slate-700 flex flex-col items-center">
                  <Image
                    key={index}
                    alt={courseTitle}
                    src={item.url}
                    width={900}
                    height={900}
                    draggable={false}
                    className="rounded-lg bg-muted-foreground"
                  />
                  <DialogTitle className="text-muted-foreground text-sm font-medium">
                    نمونه ای از تمرینات یا بخشی از این دوره
                  </DialogTitle>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </ScrollArea>
      </DetailSection>
    )
  );
};

export default CourseExercise;

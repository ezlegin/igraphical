import CurriculumPlay from "@igraph/ui/components/CurriculumPlay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@igraph/ui/components/ui/accordion";
import { Badge } from "@igraph/ui/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@igraph/ui/components/ui/dialog";
import { Curriculum, Lesson } from "@igraph/database";
import { Download, File, Lock, Video } from "lucide-react";
import DetailSection from "./DetailSection";

interface CurriculumType extends Curriculum {
  lessons: Lesson[];
}

export interface CurriculumsProps {
  curriculums: CurriculumType[];
}

const CourseCurriculum = ({ curriculums }: CurriculumsProps) => {
  return (
    <DetailSection id="curriculum" title="سرفصل‌های دوره">
      <Accordion
        type="single"
        collapsible
        defaultValue={curriculums[0]?.id.toString()}
        className="w-full space-y-3"
      >
        {curriculums.map((curriculum, index) => (
          <AccordionItem
            key={index}
            value={curriculum.id.toString()}
            className="rounded-2xl border border-foreground/10 bg-card/50 px-5 py-1 transition-colors data-[state=open]:border-primary/40 data-[state=open]:bg-card"
          >
            <AccordionTrigger className="font-semibold flex items-center justify-between">
              <span className="flex items-center gap-3 text-sm">
                <span className="en-digits flex size-8 items-center justify-center rounded-lg bg-primary/15 text-xs text-primary">
                  {index + 1}
                </span>
                {curriculum.sectionTitle}
              </span>
              <div className="flex gap-4 mr-auto ml-4">
                <span className="text-xs font-normal text-muted-foreground">
                  {curriculum.lessons.length} درس
                </span>
                <span className="text-xs font-normal space-x-3 text-muted-foreground">
                  {curriculum.lessons.reduce(
                    (acc, curr) => acc + (curr.duration || 0),
                    0,
                  )}{" "}
                  دقیقه
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-muted-foreground">
                {curriculum.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/5">
                    <span className="flex gap-2 items-center">
                      {lesson.type === "VIDEO" ? (
                        <Video size={15} />
                      ) : lesson.type === "ASSET" ? (
                        <Download size={15} />
                      ) : (
                        <File size={15} />
                      )}
                      {lesson.title}
                    </span>
                    {lesson.isFree ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Badge className="cursor-pointer rounded-full bg-lime px-3 text-black hover:bg-lime/90">
                            پیش‌نمایش رایگان
                          </Badge>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none max-w-[900px] aspect-video rounded-sm">
                          <DialogTitle className="sr-only" />
                          <CurriculumPlay url={lesson.url} />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Lock className="text-muted-foreground" size={16} />
                    )}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </DetailSection>
  );
};

export default CourseCurriculum;

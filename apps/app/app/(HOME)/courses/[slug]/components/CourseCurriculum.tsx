import CurriculumPlay from "@igraph/ui/components/CurriculumPlay";
import { signMediaUrl } from "@/lib/media-url";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@igraph/ui/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@igraph/ui/components/ui/dialog";
import { Curriculum, Lesson } from "@igraph/database";
import { Download, File, Lock, Play } from "lucide-react";
import DetailSection from "./DetailSection";

interface CurriculumType extends Curriculum {
  lessons: Lesson[];
}

export interface CurriculumsProps {
  curriculums: CurriculumType[];
}

const minutes = (lessons: Lesson[]) =>
  lessons.reduce((acc, l) => acc + (l.duration || 0), 0);

// Seasons as a vertical timeline; each one opens to its lessons.
const CourseCurriculum = async ({ curriculums }: CurriculumsProps) => {
  // only free-preview lessons get a (short-lived) link on the public page
  const previewUrls = new Map<number, string>();
  for (const section of curriculums)
    for (const lesson of section.lessons)
      if (lesson.isFree)
        previewUrls.set(lesson.id, await signMediaUrl(lesson.url));

  const totalLessons = curriculums.reduce((a, c) => a + c.lessons.length, 0);
  const totalMinutes = curriculums.reduce((a, c) => a + minutes(c.lessons), 0);

  return (
    <DetailSection
      id="curriculum"
      index="03"
      eyebrow={`${curriculums.length} فصل · ${totalLessons} درس${totalMinutes ? ` · ${Math.round(totalMinutes / 60)} ساعت` : ""}`}
      title="مسیر دوره، فصل به فصل"
    >
      <Accordion
        type="single"
        collapsible
        defaultValue={curriculums[0]?.id.toString()}
        className="relative"
      >
        {/* the timeline rail */}
        <span className="absolute bottom-6 right-[19px] top-6 w-px bg-gradient-to-b from-primary via-foreground/15 to-transparent" />

        {curriculums.map((curriculum, index) => (
          <AccordionItem
            key={curriculum.id}
            value={curriculum.id.toString()}
            className="group/season relative border-none pb-2 pr-14"
          >
            <span className="en-digits absolute right-0 top-3 flex size-10 items-center justify-center rounded-full border border-foreground/15 bg-background text-sm font-bold text-muted-foreground transition-colors group-data-[state=open]/season:border-primary group-data-[state=open]/season:bg-primary group-data-[state=open]/season:text-primary-foreground">
              {index + 1}
            </span>

            <AccordionTrigger className="rounded-2xl px-4 py-4 text-start hover:bg-foreground/[0.03] hover:no-underline">
              <span className="flex flex-1 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-[15px] font-bold">
                  {curriculum.sectionTitle}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {curriculum.lessons.length} درس
                  {minutes(curriculum.lessons) > 0 &&
                    ` · ${minutes(curriculum.lessons)} دقیقه`}
                </span>
              </span>
            </AccordionTrigger>

            <AccordionContent>
              <ul className="mx-4 divide-y divide-foreground/5 rounded-2xl border border-foreground/10">
                {curriculum.lessons.map((lesson, i) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-3 text-foreground/85">
                      <span className="en-digits w-5 shrink-0 text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      {lesson.type === "ASSET" ? (
                        <Download
                          size={15}
                          className="shrink-0 text-muted-foreground"
                        />
                      ) : lesson.type === "FILE" ? (
                        <File
                          size={15}
                          className="shrink-0 text-muted-foreground"
                        />
                      ) : null}
                      <span className="truncate">{lesson.title}</span>
                    </span>

                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      {lesson.duration ? (
                        <span>{lesson.duration} دقیقه</span>
                      ) : null}
                      {lesson.isFree && previewUrls.get(lesson.id) ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 font-semibold text-black transition-opacity hover:opacity-90"
                            >
                              <Play size={11} className="fill-current" />
                              پیش‌نمایش
                            </button>
                          </DialogTrigger>
                          <DialogContent className="aspect-video max-w-[900px] rounded-sm border-none p-0">
                            <DialogTitle className="sr-only">
                              {lesson.title}
                            </DialogTitle>
                            <CurriculumPlay url={previewUrls.get(lesson.id)!} />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Lock size={14} />
                      )}
                    </span>
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

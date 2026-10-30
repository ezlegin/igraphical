import { tutorPlaceholder } from "@/public";
import { Image as ImageType, Tutor } from "@igraph/database";
import { ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DetailSection from "./DetailSection";

interface Props {
  tutor: Tutor & { image: ImageType | null };
}

const CourseTutor = ({ tutor }: Props) => {
  if (!tutor) return null;

  return (
    <DetailSection id="tutor" title="مدرس دوره">
      <div className="studio-card studio-noise relative flex flex-col gap-6 overflow-hidden p-6 md:flex-row md:items-center md:p-8">
        <div className="absolute -left-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
        <Image
          alt={tutor.displayName}
          src={tutor.image?.url || tutorPlaceholder}
          width={320}
          height={320}
          className="relative size-32 shrink-0 rounded-[1.75rem] object-cover ring-4 ring-primary/20 md:size-40"
        />
        <div className="relative space-y-3">
          <h3 className="text-2xl font-black">{tutor.displayName}</h3>
          <p className="whitespace-pre-line text-sm text-primary">{tutor.titles}</p>
          <p className="text-sm leading-7 text-muted-foreground">{tutor.bio}</p>
          <Link
            href={`/tutors/${tutor.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
          >
            مشاهده پروفایل و دوره‌ها
            <ArrowUpLeft size={15} />
          </Link>
        </div>
      </div>
    </DetailSection>
  );
};

export default CourseTutor;

"use client";

import ReadOnlyEditor from "@igraph/editor/ReadOnlyEditor";
import React from "react";
import CourseAudienceItems from "./CourseAudience";
import DetailSection from "./DetailSection";

interface CourseDescriptionProps {
  content: string; // stored Lexical JSON
  courseDescriptionItems: {
    audience: string;
    needs: string;
    bazaar: string;
  };
  prerequisites?: React.ReactNode;
}

const CourseDescription: React.FC<CourseDescriptionProps> = ({
  content,
  courseDescriptionItems,
  prerequisites,
}) => {
  return (
    <DetailSection
      id="about"
      index="02"
      eyebrow="داستان دوره"
      title="درباره این دوره"
    >
      <div className="max-w-3xl text-[15px] leading-8 text-foreground/85">
        <ReadOnlyEditor content={content} />
      </div>
      <CourseAudienceItems courseContentItems={courseDescriptionItems} />
      {prerequisites}
    </DetailSection>
  );
};

export default CourseDescription;

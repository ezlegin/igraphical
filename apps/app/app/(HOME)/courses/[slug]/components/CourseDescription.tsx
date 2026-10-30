"use client";

import ReadOnlyEditor from "@igraph/editor/ReadOnlyEditor";
import React from "react";
import CourseAudienceItems from "./CourseAudience";
import DetailSection from "./DetailSection";

interface CourseDescriptionProps {
  content: string; // Your stored Lexical JSON string
  courseDescriptionItems: {
    audience: string;
    needs: string;
    bazaar: string;
  };
}

const CourseDescription: React.FC<CourseDescriptionProps> = ({ content, courseDescriptionItems }) => {
  return (
    <DetailSection id="about" title="درباره این دوره">
      <div className="studio-card p-6 leading-8 md:p-8">
        <ReadOnlyEditor content={content} />
      </div>
      <CourseAudienceItems courseContentItems={courseDescriptionItems} />
    </DetailSection>
  );
};

export default CourseDescription;

"use client";

import React from "react";
import ReviewCard from "./ReviewCard";
import Masonry from "react-masonry-css";
import { Button } from "@igraph/ui/components/ui/button";
import { Image, Review, User } from "@igraph/database";
import { useSearchParams, useRouter } from "next/navigation";
import DetailSection from "./DetailSection";

export interface ReviewType extends Review {
  user: User & { image: Image | null };
}
interface Props {
  reviews: ReviewType[];
}

const CourseReviews = ({ reviews }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reviewInitialCount = 8;
  const currentReviews =
    Number(searchParams.get("reviews")) || reviewInitialCount;

  const handleLoadMore = () => {
    const newReviewsCount = currentReviews + 10;
    const params = new URLSearchParams(searchParams.toString());

    params.set("reviews", newReviewsCount.toString());

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    reviews.length > 0 && (
      <DetailSection id="reviews" title="نظرات دانشجوها">

        <Masonry
          breakpointCols={{ default: 2, 1024: 1 }}
          className="flex gap-3"
          columnClassName="masonry-column"
        >
          {reviews.slice(0, currentReviews).map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </Masonry>

        {reviews.length > reviewInitialCount && (
          <div className="flex justify-center mt-10">
            <Button
              disabled={reviews.length < currentReviews}
              variant="outline"
              className="rounded-full border-foreground/15 px-6"
              onClick={handleLoadMore}
            >
              مشاهده بیشتر
            </Button>
          </div>
        )}
      </DetailSection>
    )
  );
};

export default CourseReviews;

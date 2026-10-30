import { avatar } from "@/public";
import Avatar from "@igraph/ui/components/Avatar";
import { formatJalaliDate } from "@igraph/utils";
import { Star } from "lucide-react";
import { ReviewType } from "./CourseReviews";

interface Props {
  review: ReviewType;
}

const ReviewCard = ({ review }: Props) => {
  return (
    <div className="studio-card mb-3 h-min space-y-4 p-5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.rate ? "fill-[#ffc928] text-[#ffc928]" : "text-foreground/15"}
          />
        ))}
      </div>
      <p className="text-sm leading-7 text-foreground/85">{review.content}</p>
      <div className="flex items-center gap-3">
        <Avatar src={review.user.image?.url || avatar} />
        <div>
          <p className="text-sm font-semibold">{review.user.fullName}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatJalaliDate(review.createdAt, { useMonthName: false })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;

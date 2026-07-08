import { ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAllReviews, type DbReview } from "@/lib/commerce";

function chunkIntoRows(reviews: DbReview[], rowCount: number): DbReview[][] {
  const rows: DbReview[][] = Array.from({ length: rowCount }, () => []);
  reviews.forEach((r, i) => rows[i % rowCount].push(r));
  return rows.filter((r) => r.length > 0);
}

const STATIC_REVIEWS: DbReview[] = [
  {
    id: "static-1",
    userName: "Honourable Governor Acharya Devvrat",
    rating: 5,
    comment: "Very Good Startups are becoming in India.",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    verified: true,
    helpfulVotes: 12
  },
  {
    id: "static-2",
    userName: "Nilesh Desai (ISRO Ahmedabad Director)",
    rating: 5,
    comment: "Very Good Innovation & He invited Our Startup TeleARGlass at ISRO Facility.",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    verified: true,
    helpfulVotes: 18
  }
];

/**
 * Multi-row auto-scrolling wall of reviews, alternating scroll direction per
 * row. Sourced entirely from the reviews table + injected guest comments.
 * Hides itself if there's nothing to show yet.
 */
export function TestimonialMarquee() {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAllReviews(48).then((dbReviews) => {
      if (active) {
        // Merge the two guest comments at the front of reviews list
        setReviews([...STATIC_REVIEWS, ...dbReviews]);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 overflow-hidden">
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-36 w-80 shrink-0 animate-pulse rounded-3xl bg-surface" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) return null;

  // Below or equal to 5: Static row without scrolling movement
  if (reviews.length <= 5) {
    return (
      <div className="flex flex-wrap justify-center gap-6 py-6 px-4">
        {reviews.map((r) => (
          <TestimonialCard key={r.id} review={r} totalCount={reviews.length} />
        ))}
      </div>
    );
  }

  // More than 5: Scrolling marquee
  const rowCount = reviews.length >= 9 ? 3 : reviews.length >= 6 ? 2 : 1;
  const rows = chunkIntoRows(reviews, rowCount);

  return (
    <div className="space-y-4">
      {rows.map((row, i) => {
        const items = [...row, ...row];
        return (
          <div key={i} className="overflow-hidden">
            <div
              className={`flex w-max gap-4 ${i % 2 === 0 ? "animate-marquee" : "animate-marquee-reverse"} hover:[animation-play-state:paused]`}
            >
              {items.map((r, j) => (
                <TestimonialCard key={`${r.id}-${j}`} review={r} totalCount={reviews.length} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TestimonialCard({ review, totalCount }: { review: DbReview; totalCount: number }) {
  // Determine width based on totalCount when static (totalCount <= 5)
  let cardWidth = "w-80";
  let textClass = "text-sm";
  let nameClass = "text-sm";
  let avatarSize = "h-10 w-10 text-sm";
  let paddingClass = "p-6";

  if (totalCount <= 5) {
    if (totalCount === 2) {
      cardWidth = "w-full max-w-[32rem]";
      textClass = "text-base md:text-lg font-medium";
      nameClass = "text-base md:text-lg";
      avatarSize = "h-12 w-12 text-base";
      paddingClass = "p-8";
    } else if (totalCount === 3) {
      cardWidth = "w-full max-w-[24rem]";
      textClass = "text-sm md:text-base";
      nameClass = "text-sm md:text-base";
      avatarSize = "h-11 w-11 text-sm";
      paddingClass = "p-7";
    } else if (totalCount === 4) {
      cardWidth = "w-full max-w-[21rem]";
    } else {
      cardWidth = "w-full max-w-[18rem]";
    }
  }

  return (
    <div className={`${cardWidth} shrink-0 rounded-3xl border border-border-light bg-background ${paddingClass} shadow-card transition-all duration-300 hover:scale-[1.01] hover:border-primary/20`}>
      <div className="flex items-center gap-3">
        <div className={`grid ${avatarSize} shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white`}>
          {review.userName?.[0]?.toUpperCase() ?? "T"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`truncate font-semibold text-foreground ${nameClass}`}>{review.userName}</span>
            {review.verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-3 w-3 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
            ))}
          </div>
        </div>
      </div>
      <p className={`mt-3 leading-relaxed text-text-secondary ${textClass}`}>"{review.comment}"</p>
    </div>
  );
}

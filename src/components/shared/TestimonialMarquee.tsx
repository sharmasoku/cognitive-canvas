import { ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAllReviews, type DbReview } from "@/lib/commerce";

function chunkIntoRows(reviews: DbReview[], rowCount: number): DbReview[][] {
  const rows: DbReview[][] = Array.from({ length: rowCount }, () => []);
  reviews.forEach((r, i) => rows[i % rowCount].push(r));
  return rows.filter((r) => r.length > 0);
}

/**
 * Multi-row auto-scrolling wall of reviews, alternating scroll direction per
 * row. Sourced entirely from the reviews table (fetchAllReviews never falls
 * back to static content) — hides itself if there's nothing to show yet.
 */
export function TestimonialMarquee() {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAllReviews(48).then((r) => {
      if (active) { setReviews(r); setLoading(false); }
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

  const rowCount = reviews.length >= 9 ? 3 : reviews.length >= 4 ? 2 : 1;
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
                <TestimonialCard key={`${r.id}-${j}`} review={r} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TestimonialCard({ review }: { review: DbReview }) {
  return (
    <div className="w-80 shrink-0 rounded-3xl border border-border-light bg-background p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
          {review.userName?.[0]?.toUpperCase() ?? "T"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{review.userName}</span>
            {review.verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-3 w-3 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-text-secondary">"{review.comment}"</p>
    </div>
  );
}

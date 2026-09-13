import { useState } from "react";
import { Trash2, Flag } from "lucide-react";
import type { Review } from "../../types";
import { Avatar } from "../common/Primitives";
import { RatingStars } from "../common/RatingStars";
import { timeAgo } from "../../utils/format";

export default function ReviewCard({
  review,
  isOwn,
  onDelete,
  onReport,
}: {
  review: Review;
  isOwn: boolean;
  onDelete?: () => void;
  onReport?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar src={review.authorAvatar} name={review.authorName} size={32} />
          <div>
            <p className="text-sm font-semibold text-ink">{review.authorName}</p>
            <p className="text-xs text-ink/40">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingStars value={review.rating} size={13} />
          {isOwn ? (
            confirming ? (
              <div className="flex items-center gap-1">
                <button onClick={onDelete} className="text-xs font-semibold text-red-500 hover:underline">
                  Confirm
                </button>
                <button onClick={() => setConfirming(false)} className="text-xs text-ink/40 hover:underline">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                aria-label="Delete review"
                className="rounded-lg p-1.5 text-ink/30 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )
          ) : (
            onReport && (
              <button onClick={onReport} aria-label="Report review" className="rounded-lg p-1.5 text-ink/25 hover:bg-ink/5 hover:text-ink/60">
                <Flag size={14} />
              </button>
            )
          )}
        </div>
      </div>
      {review.text && <p className="mt-3 text-sm leading-relaxed text-ink/70">{review.text}</p>}
    </div>
  );
}

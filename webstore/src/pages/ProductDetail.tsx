import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ExternalLink,
  Code2,
  Share2,
  Bookmark,
  BookmarkCheck,
  Flag,
  Calendar,
  Loader2,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";
import { getProductBySlug, recordProductView, recordWebsiteClick, listPublishedProducts } from "../services/productService";
import { listReviewsForProduct, submitReview, deleteReview, getUserReviewForProduct } from "../services/reviewService";
import { getUserRatingForProduct, rateProduct, isBookmarked, toggleBookmark, submitReport } from "../services/interactionService";
import { useAuth } from "../context/AuthContext";
import type { Product, Review } from "../types";
import { Avatar, Badge, TechBadge, EmptyState, ErrorState, Modal } from "../components/common/Primitives";
import { RatingStars, RatingPicker } from "../components/common/RatingStars";
import ScreenshotCarousel from "../components/product/ScreenshotCarousel";
import RatingDistribution from "../components/product/RatingDistribution";
import ReviewCard from "../components/product/ReviewCard";
import ProductCard from "../components/product/ProductCard";
import Button from "../components/common/Button";
import { Textarea, Select } from "../components/common/FormControls";
import { safeExternalHref, hostnameOf } from "../utils/url";
import { formatDate } from "../utils/format";
import { REPORT_REASONS } from "../constants";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "product" | "review"; id: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const p = await getProductBySlug(slug);
      if (!p || p.status !== "published") {
        if (p && user && p.ownerId === user.uid) {
          setProduct(p);
        } else {
          setNotFound(true);
          setLoading(false);
          return;
        }
      } else {
        setProduct(p);
        recordProductView(p.id);
      }
      const target = p!;
      const [revs, all] = await Promise.all([listReviewsForProduct(target.id), listPublishedProducts(30)]);
      setReviews(revs);
      setRelated(all.filter((r) => r.id !== target.id && r.category === target.category).slice(0, 3));

      if (user) {
        const [rating, review, bookmarked] = await Promise.all([
          getUserRatingForProduct(target.id, user.uid),
          getUserReviewForProduct(target.id, user.uid),
          isBookmarked(target.id, user.uid),
        ]);
        if (rating) setMyRating(rating);
        if (review) {
          setMyReview(review);
          setReviewText(review.text);
        }
        setSaved(bookmarked);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleVisit() {
    if (!product) return;
    recordWebsiteClick(product.id);
    const href = safeExternalHref(product.websiteUrl);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  async function handleRate(value: number) {
    if (!user) {
      toast.error("Log in to rate this product.");
      navigate("/login");
      return;
    }
    if (!product) return;
    setMyRating(value);
    try {
      await rateProduct(product.id, user.uid, value);
      const fresh = await getProductBySlug(product.slug);
      if (fresh) setProduct(fresh);
      toast.success("Thanks for rating!");
    } catch {
      toast.error("Couldn't save your rating.");
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile || !product) return;
    if (myRating === 0) {
      toast.error("Please add a star rating first.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(product.id, user.uid, profile.name, profile.photoURL, myRating, reviewText.trim());
      toast.success(myReview ? "Review updated" : "Review posted");
      await load();
    } catch {
      toast.error("Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    if (!product || !myReview) return;
    try {
      await deleteReview(myReview.id, product.id);
      setMyReview(null);
      setReviewText("");
      toast.success("Review deleted");
      await load();
    } catch {
      toast.error("Couldn't delete review.");
    }
  }

  async function handleToggleSave() {
    if (!user) {
      toast.error("Log in to save products.");
      navigate("/login");
      return;
    }
    if (!product) return;
    const next = await toggleBookmark(product.id, user.uid);
    setSaved(next);
    toast.success(next ? "Saved to your collection" : "Removed from saved");
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product?.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function openReport(type: "product" | "review", id: string) {
    if (!user) {
      toast.error("Log in to report content.");
      navigate("/login");
      return;
    }
    setReportTarget({ type, id });
    setReportOpen(true);
  }

  async function handleReportSubmit() {
    if (!user || !reportTarget) return;
    try {
      await submitReport(reportTarget.type, reportTarget.id, user.uid, reportReason);
      toast.success("Thanks — we'll take a look.");
      setReportOpen(false);
    } catch {
      toast.error("Couldn't submit report.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-purple" size={28} />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <ErrorState
          title="This product isn't available."
          subtitle="It may have been unpublished, archived, or the link is incorrect."
          action={
            <Link to="/discover">
              <Button variant="outline">Explore Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isOwner = user?.uid === product.ownerId;
  const websiteHost = hostnameOf(product.websiteUrl);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {product.status !== "published" && (
        <div className="mb-6 rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-2.5 text-sm font-medium text-brand-orange">
          This product is a {product.status} — only you can see it.
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {product.logoUrl ? (
              <img src={product.logoUrl} alt={product.name} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-line" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-grad-primary text-2xl font-bold text-white">
                {product.name[0]}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{product.name}</h1>
                {product.featured && <Badge tone="featured">Featured</Badge>}
                {isOwner && (
                  <Link to={`/product/${product.slug}/edit`} className="ml-1 inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink/60 hover:border-ink/30">
                    <Pencil size={12} /> Edit
                  </Link>
                )}
              </div>
              <p className="mt-1 text-ink/60">{product.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink/50">
                <Link to={`/developer/${product.ownerUsername}`} className="flex items-center gap-1.5 font-medium text-ink/70 hover:text-brand-purple">
                  <Avatar src={product.ownerAvatar} name={product.ownerName} size={20} /> {product.ownerName}
                </Link>
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {formatDate(product.launchDate)}
                </span>
                <RatingStars value={product.ratingAvg} count={product.ratingCount} size={14} showValue />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={handleVisit} size="lg">
              Visit Website <ExternalLink size={15} />
            </Button>
            {product.githubUrl && safeExternalHref(product.githubUrl) && (
              <a href={safeExternalHref(product.githubUrl)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  <Code2 size={16} /> GitHub
                </Button>
              </a>
            )}
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 size={15} /> {copied ? "Copied!" : "Share"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleToggleSave}>
              {saved ? <BookmarkCheck size={15} className="text-brand-purple" /> : <Bookmark size={15} />}
              {saved ? "Saved" : "Save"}
            </Button>
            {!isOwner && (
              <button onClick={() => openReport("product", product.id)} className="ml-auto flex items-center gap-1 text-xs text-ink/35 hover:text-ink/60" aria-label="Report product">
                <Flag size={13} /> Report
              </button>
            )}
          </div>

          {/* Screenshots */}
          <ScreenshotCarousel screenshots={product.screenshots || []} />

          {/* Description */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">About {product.name}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink/65">{product.description}</p>
          </section>

          {product.features?.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-ink">Key Features</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl border border-line bg-white p-3 text-sm text-ink/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-purple" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">Technology Stack</h2>
            <div className="flex flex-wrap gap-2">
              {product.technologies.map((t) => (
                <Link key={t} to={`/technology/${encodeURIComponent(t)}`}>
                  <TechBadge label={t} />
                </Link>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Reviews ({product.reviewCount})</h2>
            </div>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="mb-6 space-y-3 rounded-xl border border-line bg-white p-4">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-ink">Your rating</p>
                  <RatingPicker value={myRating} onChange={handleRate} />
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts on this product..."
                  maxLength={500}
                />
                <Button type="submit" size="sm" loading={submitting}>
                  {myReview ? "Update Review" : "Post Review"}
                </Button>
              </form>
            ) : (
              <div className="mb-6 rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink/50">
                <Link to="/login" className="font-semibold text-brand-purple hover:underline">
                  Log in
                </Link>{" "}
                to rate and review this product.
              </div>
            )}

            {reviews.length === 0 ? (
              <EmptyState emoji="💬" title="Be the first to review this product." />
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    isOwn={user?.uid === r.authorId}
                    onDelete={handleDeleteReview}
                    onReport={() => openReport("review", r.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-ink">Rating breakdown</p>
            <RatingDistribution product={product} />
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-ink">Product info</p>
            <dl className="space-y-2.5 text-sm">
              <Row label="Category" value={product.category} />
              <Row label="Pricing" value={product.pricingType} />
              {product.targetAudience && <Row label="Audience" value={product.targetAudience} />}
              {product.version && <Row label="Version" value={product.version} />}
              <Row label="Website" value={websiteHost} icon={<LinkIcon size={12} />} />
              <Row label="Views" value={product.views.toLocaleString()} />
              <Row label="Website clicks" value={product.clicks.toLocaleString()} />
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-ink">Developer</p>
            <Link to={`/developer/${product.ownerUsername}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink/5">
              <Avatar src={product.ownerAvatar} name={product.ownerName} size={40} />
              <div>
                <p className="text-sm font-semibold text-ink">{product.ownerName}</p>
                <p className="text-xs text-ink/45">@{product.ownerUsername}</p>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-ink">Similar Products</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report content">
        <div className="space-y-4">
          <Select label="Reason" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Button fullWidth onClick={handleReportSubmit}>
            Submit report
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/45">{label}</dt>
      <dd className="flex items-center gap-1 font-medium text-ink">
        {icon} {value}
      </dd>
    </div>
  );
}

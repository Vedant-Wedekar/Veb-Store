import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, MousePointerClick, Star, MessageSquare, Rocket, Pencil, BarChart3, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { listProductsByOwner, deleteProduct, setProductStatus } from "../services/productService";
import { profileCompleteness } from "../services/userService";
import type { Product } from "../types";
import { StatCard, TopProductsChart } from "../components/dashboard/DashboardWidgets";
import { EmptyState, Badge, Modal } from "../components/common/Primitives";
import { RatingStars } from "../components/common/RatingStars";
import Button from "../components/common/Button";
import { SkeletonGrid } from "../components/common/Primitives";
import { formatNumber } from "../utils/format";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) return;
    listProductsByOwner(user.uid)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [user]);

  const totals = products.reduce(
    (acc, p) => ({
      views: acc.views + p.views,
      clicks: acc.clicks + p.clicks,
      reviews: acc.reviews + p.reviewCount,
      ratingSum: acc.ratingSum + p.ratingAvg * p.ratingCount,
      ratingCount: acc.ratingCount + p.ratingCount,
    }),
    { views: 0, clicks: 0, reviews: 0, ratingSum: 0, ratingCount: 0 }
  );
  const avgRating = totals.ratingCount > 0 ? totals.ratingSum / totals.ratingCount : 0;
  const completeness = profile ? profileCompleteness(profile) : { percent: 0, missing: [] };

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete.id);
      setProducts((p) => p.filter((x) => x.id !== toDelete.id));
      toast.success("Product deleted");
    } catch {
      toast.error("Couldn't delete product.");
    } finally {
      setToDelete(null);
    }
  }

  async function handleArchiveToggle(p: Product) {
    const next = p.status === "archived" ? "published" : "archived";
    try {
      await setProductStatus(p.id, next);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
      toast.success(next === "archived" ? "Product archived" : "Product restored");
    } catch {
      toast.error("Couldn't update product.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/50">Your control center for products and analytics.</p>
        </div>
        <Link to="/product/new">
          <Button>
            <Rocket size={15} /> Launch Product
          </Button>
        </Link>
      </div>

      {profile && completeness.percent < 100 && (
        <div className="mb-8 rounded-xl border border-brand-purple/20 bg-brand-purple/5 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Profile {completeness.percent}% complete</span>
            <Link to={`/developer/${profile.username}`} className="text-xs font-semibold text-brand-purple hover:underline">
              Complete profile
            </Link>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/5">
            <div className="h-full rounded-full bg-grad-primary transition-all" style={{ width: `${completeness.percent}%` }} />
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total products" value={products.length} icon={<Rocket size={16} />} gradient="from-brand-blue to-brand-purple" />
        <StatCard label="Total views" value={totals.views} icon={<Eye size={16} />} gradient="from-brand-purple to-brand-pink" />
        <StatCard label="Website clicks" value={totals.clicks} icon={<MousePointerClick size={16} />} gradient="from-brand-cyan to-brand-blue" />
        <StatCard label="Avg rating" value={avgRating ? avgRating.toFixed(1) : "—"} icon={<Star size={16} />} gradient="from-brand-orange to-brand-pink" />
      </div>

      <div className="mb-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-ink">Views &amp; clicks by product</h2>
        {loading ? <div className="h-64 animate-pulse rounded-xl bg-ink/5" /> : <TopProductsChart products={products} />}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-ink">My Products</h2>
        {loading ? (
          <SkeletonGrid />
        ) : products.length === 0 ? (
          <EmptyState
            emoji="🚀"
            title="Nothing launched yet. Be the first."
            subtitle="Publish your first product to start tracking analytics."
            action={
              <Link to="/product/new">
                <Button>Launch Product</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-grad-primary text-sm font-bold text-white">{p.name[0]}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/product/${p.slug}`} className="text-sm font-semibold text-ink hover:text-brand-purple">
                        {p.name}
                      </Link>
                      <Badge tone={p.status === "published" ? "new" : p.status === "draft" ? "default" : "student"}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/45">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {formatNumber(p.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick size={12} /> {formatNumber(p.clicks)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} /> {p.reviewCount}
                      </span>
                      <RatingStars value={p.ratingAvg} size={11} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/product/${p.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Pencil size={13} /> Edit
                    </Button>
                  </Link>
                  <Link to={`/product/${p.slug}`}>
                    <Button size="sm" variant="outline">
                      <BarChart3 size={13} /> View
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => handleArchiveToggle(p)}>
                    {p.status === "archived" ? "Restore" : "Archive"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setToDelete(p)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete product?">
        <p className="text-sm text-ink/60">This will permanently remove "{toDelete?.name}" and cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" fullWidth onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

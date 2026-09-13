import type { Product } from "../../types";
import ProductCard from "./ProductCard";
import { EmptyState, SkeletonGrid } from "../common/Primitives";

export default function ProductGrid({
  products,
  loading,
  emptyTitle = "Nothing launched yet. Be the first.",
  emptySubtitle = "Products will appear here once they're published.",
}: {
  products: Product[];
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}) {
  if (loading) return <SkeletonGrid />;
  if (products.length === 0) return <EmptyState emoji="🧭" title={emptyTitle} subtitle={emptySubtitle} />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

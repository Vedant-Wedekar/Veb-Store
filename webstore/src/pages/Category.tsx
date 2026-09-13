import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, gradientForSeed } from "../constants";
import { listProductsByCategory } from "../services/productService";
import type { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";
import FilterBar, { type Filters } from "../components/product/FilterBar";
import { useSortedProducts, type SortKey } from "../hooks/useProductSort";

export function CategoriesIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-ink/50">Browse products by what they do.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            to={`/category/${encodeURIComponent(c.toLowerCase())}`}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientForSeed(c)} p-5 text-white shadow-soft transition-transform hover:-translate-y-1`}
          >
            <p className="text-base font-bold">{c}</p>
            <ArrowRight size={16} className="mt-3 opacity-70 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CategoryDetail() {
  const { name } = useParams<{ name: string }>();
  const category = CATEGORIES.find((c) => c.toLowerCase() === (name || "").toLowerCase()) || name || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ category: "", pricing: "", sort: "newest" });

  useEffect(() => {
    setLoading(true);
    listProductsByCategory(category, 60)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = products.filter((p) => !filters.pricing || p.pricingType === filters.pricing);
  const sorted = useSortedProducts(filtered, filters.sort as SortKey);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className={`mb-6 rounded-2xl bg-gradient-to-br ${gradientForSeed(category)} px-6 py-8 text-white`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Category</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{category}</h1>
      </div>
      <FilterBar
        filters={{ ...filters, category: "" }}
        onChange={(f) => setFilters(f)}
        resultCount={loading ? undefined : sorted.length}
      />
      <ProductGrid
        products={sorted}
        loading={loading}
        emptyTitle={`No ${category} products yet.`}
        emptySubtitle="Be the first to launch one in this category."
      />
    </div>
  );
}

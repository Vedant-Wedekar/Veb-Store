import { useEffect, useState } from "react";
import { listPublishedProducts } from "../services/productService";
import type { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";
import FilterBar, { type Filters } from "../components/product/FilterBar";
import { useSortedProducts, type SortKey } from "../hooks/useProductSort";

export default function Discover() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ category: "", pricing: "", sort: "newest" });

  useEffect(() => {
    listPublishedProducts(100)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) => (!filters.category || p.category === filters.category) && (!filters.pricing || p.pricingType === filters.pricing)
  );
  const sorted = useSortedProducts(filtered, filters.sort as SortKey);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Discover Products</h1>
      <p className="mt-1 text-sm text-ink/50">Explore everything the community has launched.</p>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} resultCount={loading ? undefined : sorted.length} />
        <ProductGrid products={sorted} loading={loading} />
      </div>
    </div>
  );
}

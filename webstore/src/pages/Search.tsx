import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { listPublishedProducts, searchProducts } from "../services/productService";
import type { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";
import FilterBar, { type Filters } from "../components/product/FilterBar";
import { useSortedProducts, type SortKey } from "../hooks/useProductSort";
import { EmptyState } from "../components/common/Primitives";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ category: "", pricing: "", sort: "relevance" });

  useEffect(() => {
    listPublishedProducts(150)
      .then(setAllProducts)
      .finally(() => setLoading(false));
  }, []);

  const matched = searchProducts(allProducts, q).filter(
    (p) => (!filters.category || p.category === filters.category) && (!filters.pricing || p.pricingType === filters.pricing)
  );
  const sorted = useSortedProducts(matched, filters.sort as SortKey);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-ink/50">
        <SearchIcon size={15} />
        <span>Search results for</span>
      </div>
      <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">"{q}"</h1>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} resultCount={loading ? undefined : sorted.length} />
        {!loading && sorted.length === 0 ? (
          <EmptyState emoji="🔍" title="We couldn't find anything matching your search." subtitle="Try different keywords, or browse categories instead." />
        ) : (
          <ProductGrid products={sorted} loading={loading} />
        )}
      </div>
    </div>
  );
}

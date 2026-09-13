import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { listPublishedProducts } from "../services/productService";
import type { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";
import { sortByTrending } from "../utils/trending";

export default function Trending() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublishedProducts(100)
      .then((p) => setProducts(sortByTrending(p)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-brand-orange" />
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Trending</h1>
      </div>
      <p className="mt-1 text-sm text-ink/50">Ranked by recent views, clicks, ratings and reviews.</p>

      <div className="mt-6">
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}

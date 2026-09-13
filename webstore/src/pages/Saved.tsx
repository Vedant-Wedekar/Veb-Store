import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listBookmarkedProductIds } from "../services/interactionService";
import { getProductById } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";
import { EmptyState } from "../components/common/Primitives";
import Button from "../components/common/Button";

export default function Saved() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const ids = await listBookmarkedProductIds(user.uid);
      const items = await Promise.all(ids.map((id) => getProductById(id)));
      setProducts(items.filter(Boolean) as Product[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Saved Products</h1>
      <p className="mt-1 text-sm text-ink/50">Your personal collection.</p>

      <div className="mt-6">
        {!loading && products.length === 0 ? (
          <EmptyState
            emoji="🔖"
            title="Your collection is waiting for something awesome."
            subtitle="Save products you love to find them again later."
            action={
              <Link to="/discover">
                <Button variant="outline">Explore Products</Button>
              </Link>
            }
          />
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Code2 } from "lucide-react";
import { TECHNOLOGIES } from "../constants";
import { listProductsByTechnology, listPublishedProducts } from "../services/productService";
import type { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";

export function TechnologyIndex() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    listPublishedProducts(150).then(setProducts);
  }, []);

  const counts = TECHNOLOGIES.map((t) => ({
    tech: t,
    count: products.filter((p) => p.technologies.includes(t)).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Technology Explorer</h1>
      <p className="mt-1 text-sm text-ink/50">Discover products by the stack they're built with.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {counts.map(({ tech, count }) => (
          <Link
            key={tech}
            to={`/technology/${encodeURIComponent(tech)}`}
            className="group flex items-center justify-between rounded-xl border border-line bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-purple/30"
          >
            <div className="flex items-center gap-2.5">
              <Code2 size={16} className="text-brand-purple" />
              <span className="text-sm font-semibold text-ink">{tech}</span>
            </div>
            <span className="text-xs text-ink/40">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TechnologyDetail() {
  const { name } = useParams<{ name: string }>();
  const tech = name || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listProductsByTechnology(tech, 60)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [tech]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-grad-cool text-white">
          <Code2 size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Technology</p>
          <h1 className="text-2xl font-extrabold text-ink">{tech}</h1>
        </div>
      </div>
      <ProductGrid
        products={products}
        loading={loading}
        emptyTitle={`No products built with ${tech} yet.`}
        emptySubtitle="Products using this technology will show up here."
      />
    </div>
  );
}

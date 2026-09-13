import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Rocket, Sparkles } from "lucide-react";
import { listPublishedProducts } from "../services/productService";
import { listDevelopers } from "../services/userService";
import type { Product, UserProfile } from "../types";
import ProductCard from "../components/product/ProductCard";
import DeveloperCard from "../components/developer/DeveloperCard";
import { SkeletonGrid } from "../components/common/Primitives";
import { CATEGORIES, gradientForSeed } from "../constants";
import { sortByTrending } from "../utils/trending";
import { formatNumber } from "../utils/format";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [developers, setDevelopers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [p, d] = await Promise.all([listPublishedProducts(48), listDevelopers(8)]);
        setProducts(p);
        setDevelopers(d);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trending = sortByTrending(products).slice(0, 6);
  const newest = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  const highlyRated = [...products].filter((p) => p.ratingCount > 0).sort((a, b) => b.ratingAvg - a.ratingAvg).slice(0, 6);

  const stats = {
    products: products.length,
    developers: developers.length,
    reviews: products.reduce((s, p) => s + p.reviewCount, 0),
    visits: products.reduce((s, p) => s + p.clicks, 0),
  };

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grad-mesh">
        <div className="pointer-events-none absolute left-10 top-10 h-72 w-72 animate-blob rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-24 h-72 w-72 animate-blob rounded-full bg-brand-pink/10 blur-3xl" style={{ animationDelay: "2s" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-brand-cyan/10 blur-3xl" style={{ animationDelay: "4s" }} />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink/60 shadow-soft"
          >
            <Sparkles size={13} className="text-brand-purple" /> Discover. Build. Launch. Get Discovered.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl"
          >
            Discover what <span className="text-gradient">developers</span> are building.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-base text-ink/55 sm:text-lg"
          >
            Explore websites, apps, tools and experiments built by developers from around the world.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={submitSearch}
            className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-card"
          >
            <Search size={18} className="ml-2 shrink-0 text-ink/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, developers, technologies..."
              className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-ink/35"
            />
            <button type="submit" className="shrink-0 rounded-xl bg-grad-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
              Search
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/discover" className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink/20">
              Explore Products <ArrowRight size={15} />
            </Link>
            <Link to="/product/new" className="inline-flex items-center gap-1.5 rounded-xl bg-grad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
              <Rocket size={15} /> Launch Your Product
            </Link>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["Products launched", stats.products],
              ["Developers", stats.developers],
              ["Reviews", stats.reviews],
              ["Website visits", stats.visits],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-2xl font-extrabold text-ink">{formatNumber(value as number)}</p>
                <p className="mt-0.5 text-xs text-ink/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        <Rail title="Trending Products" subtitle="Momentum right now" to="/trending" loading={loading} products={trending} />
        <Rail title="Recently Launched" subtitle="Fresh off the press" to="/discover" loading={loading} products={newest} />
        <Rail title="Highly Rated" subtitle="Loved by the community" to="/discover" loading={loading} products={highlyRated} />

        {/* Categories */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Categories</h2>
              <p className="mt-1 text-sm text-ink/50">Browse by what you're into.</p>
            </div>
            <Link to="/categories" className="text-sm font-semibold text-brand-purple hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                key={c}
                to={`/category/${encodeURIComponent(c.toLowerCase())}`}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientForSeed(c)} p-4 text-white shadow-soft transition-transform hover:-translate-y-0.5`}
              >
                <p className="text-sm font-bold">{c}</p>
                <ArrowRight size={14} className="mt-2 opacity-70 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Featured developers */}
        {developers.length > 0 && (
          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Popular Developers</h2>
                <p className="mt-1 text-sm text-ink/50">Builders shaping the community.</p>
              </div>
              <Link to="/developers" className="text-sm font-semibold text-brand-purple hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {developers.slice(0, 4).map((d, i) => (
                <DeveloperCard key={d.uid} dev={d} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-grad-primary px-6 py-14 text-center text-white sm:px-14">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Built something? Show it off.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
            Publish your product in minutes and get discovered by developers and visitors worldwide.
          </p>
          <Link
            to="/product/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink shadow-lift hover:bg-white/90"
          >
            <Rocket size={16} /> Launch Your Product
          </Link>
        </section>
      </div>
    </div>
  );
}

function Rail({
  title,
  subtitle,
  to,
  products,
  loading,
}: {
  title: string;
  subtitle: string;
  to: string;
  products: Product[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-ink/50">{subtitle}</p>
        </div>
        <Link to={to} className="text-sm font-semibold text-brand-purple hover:underline">
          View all
        </Link>
      </div>
      {loading ? (
        <SkeletonGrid count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

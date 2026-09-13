import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listDevelopers } from "../services/userService";
import type { UserProfile } from "../types";
import DeveloperCard from "../components/developer/DeveloperCard";
import { EmptyState, SkeletonGrid } from "../components/common/Primitives";
import { Select } from "../components/common/FormControls";

type SortKey = "products" | "rating" | "newest";

export default function Developers() {
  const [developers, setDevelopers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("products");

  useEffect(() => {
    listDevelopers(100)
      .then(setDevelopers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = developers;
    if (t) {
      list = list.filter((d) =>
        [d.name, d.username, d.headline, ...(d.skills || [])].join(" ").toLowerCase().includes(t)
      );
    }
    const sorted = [...list];
    if (sort === "products") sorted.sort((a, b) => b.productCount - a.productCount);
    if (sort === "rating") sorted.sort((a, b) => b.avgRating - a.avgRating);
    if (sort === "newest") sorted.sort((a, b) => b.createdAt - a.createdAt);
    return sorted;
  }, [developers, q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Developers</h1>
      <p className="mt-1 text-sm text-ink/50">Discover the builders behind WebStore products.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5">
          <Search size={16} className="text-ink/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search developers or skills..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="!w-auto">
          <option value="products">Most Products</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </Select>
      </div>

      <div className="mt-8">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState emoji="👩‍💻" title="No developers found." subtitle="Try a different search term." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((d, i) => (
              <DeveloperCard key={d.uid} dev={d} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

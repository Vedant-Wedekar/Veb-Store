import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "../../types";
import { Avatar, Badge, TechBadge } from "../common/Primitives";
import { RatingStars } from "../common/RatingStars";
import { gradientForSeed } from "../../constants";
import { formatNumber } from "../../utils/format";

function isNew(launchDate: number) {
  return Date.now() - launchDate < 1000 * 60 * 60 * 24 * 14;
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const gradient = gradientForSeed(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-glow"
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {product.logoUrl ? (
              <img
                src={product.logoUrl}
                alt={product.name}
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-line transition-transform group-hover:scale-105"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg font-bold text-white`}>
                {product.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-ink">{product.name}</h3>
              <p className="truncate text-xs text-ink/45">{product.category}</p>
            </div>
          </div>
          <ArrowUpRight size={16} className="mt-1 shrink-0 text-ink/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-purple" />
        </div>

        <p className="mb-3 line-clamp-2 flex-1 text-sm text-ink/60">{product.tagline}</p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {isNew(product.launchDate) && <Badge tone="new">New</Badge>}
          {product.featured && <Badge tone="featured">Featured</Badge>}
          {product.pricingType === "Open Source" && <Badge tone="opensource">Open Source</Badge>}
          {product.pricingType === "Free" && <Badge tone="free">Free</Badge>}
          {product.technologies.slice(0, 2).map((t) => (
            <TechBadge key={t} label={t} />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
          <div className="flex items-center gap-1.5">
            <Avatar src={product.ownerAvatar} name={product.ownerName} size={20} />
            <span className="truncate text-xs font-medium text-ink/55">{product.ownerName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink/40">
            {product.ratingCount > 0 ? (
              <RatingStars value={product.ratingAvg} size={12} />
            ) : (
              <span>No ratings</span>
            )}
            <span>{formatNumber(product.views)} views</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

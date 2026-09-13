import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { UserProfile } from "../../types";
import { Avatar, TechBadge } from "../common/Primitives";
import { RatingStars } from "../common/RatingStars";

export default function DeveloperCard({ dev, index = 0 }: { dev: UserProfile; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/developer/${dev.username}`}
        className="group flex h-full flex-col items-center rounded-2xl border border-line bg-white p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
      >
        <Avatar src={dev.photoURL} name={dev.name} size={64} />
        <h3 className="mt-3 text-[15px] font-bold text-ink">{dev.name}</h3>
        <p className="text-xs text-ink/40">@{dev.username}</p>
        {dev.headline && <p className="mt-2 line-clamp-2 text-xs text-ink/55">{dev.headline}</p>}

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {(dev.skills || []).slice(0, 3).map((s) => (
            <TechBadge key={s} label={s} />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 border-t border-line pt-3 text-xs text-ink/50">
          <span>{dev.productCount} products</span>
          {dev.avgRating > 0 && <RatingStars value={dev.avgRating} size={12} />}
        </div>
      </Link>
    </motion.div>
  );
}

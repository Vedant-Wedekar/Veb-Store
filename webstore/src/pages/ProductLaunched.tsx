import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Share2, Copy, LayoutDashboard, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { getProductBySlug } from "../services/productService";
import type { Product } from "../types";
import Button from "../components/common/Button";
import { Loader2 } from "lucide-react";

export default function ProductLaunched() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug).then(setProduct);
  }, [slug]);

  const url = product ? `${window.location.origin}/product/${product.slug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-purple" size={28} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 animate-blob rounded-full bg-brand-green/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-blob rounded-full bg-brand-purple/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-card"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-grad-primary text-white"
        >
          <Rocket size={28} />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-ink">Your product is live! 🚀</h1>
        <p className="mt-2 text-sm text-ink/55">{product.name} is now discoverable on WebStore.</p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-ink/[0.02] p-3">
          {product.logoUrl ? (
            <img src={product.logoUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-grad-primary text-sm font-bold text-white">
              {product.name[0]}
            </div>
          )}
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
            <p className="truncate text-xs text-ink/40">{url}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={copyLink}>
            <Copy size={14} /> {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="outline" onClick={() => navigator.share?.({ title: product.name, url })}>
            <Share2 size={14} /> Share
          </Button>
          <Link to={`/product/${product.slug}`}>
            <Button variant="outline" fullWidth>
              <ExternalLink size={14} /> View Product
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button fullWidth>
              <LayoutDashboard size={14} /> Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

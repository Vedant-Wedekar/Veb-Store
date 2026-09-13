import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, Link2, Globe, MapPin, Pencil, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getUserByUsername, updateUserProfile, profileCompleteness } from "../services/userService";
import { listProductsByOwner } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import type { UserProfile, Product } from "../types";
import { Avatar, TechBadge, EmptyState, ErrorState, Modal } from "../components/common/Primitives";
import ProductGrid from "../components/product/ProductGrid";
import Button from "../components/common/Button";
import { Input, Textarea } from "../components/common/FormControls";
import TagInput from "../components/forms/TagInput";
import { ImageUrlField } from "../components/forms/MediaFields";
import { TECHNOLOGIES } from "../constants";
import { formatDate, formatNumber } from "../utils/format";
import { safeExternalHref } from "../utils/url";

export default function DeveloperProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, refreshProfile } = useAuth();
  const [dev, setDev] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    getUserByUsername(username)
      .then(async (d) => {
        if (!d) {
          setNotFound(true);
          return;
        }
        setDev(d);
        const prods = await listProductsByOwner(d.uid);
        setProducts(prods.filter((p) => p.status === "published"));
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-purple" size={28} />
      </div>
    );
  }

  if (notFound || !dev) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <ErrorState title="Developer not found." subtitle="This profile may not exist or the link is incorrect." />
      </div>
    );
  }

  const isOwner = user?.uid === dev.uid;
  const { percent, missing } = profileCompleteness(dev);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar src={dev.photoURL} name={dev.name} size={88} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink">{dev.name}</h1>
              {isOwner && (
                <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink/60 hover:border-ink/30">
                  <Pencil size={12} /> Edit profile
                </button>
              )}
            </div>
            <p className="text-sm text-ink/40">@{dev.username}</p>
            {dev.headline && <p className="mt-2 text-sm font-medium text-ink/70">{dev.headline}</p>}
            {dev.bio && <p className="mt-2 max-w-xl text-sm text-ink/55">{dev.bio}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink/45">
              {dev.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {dev.location}
                </span>
              )}
              <span>Joined {formatDate(dev.createdAt)}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {safeExternalHref(dev.website) && (
                <a href={dev.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-brand-purple">
                  <Globe size={13} /> Website
                </a>
              )}
              {safeExternalHref(dev.github) && (
                <a href={dev.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-brand-purple">
                  <Code2 size={13} /> GitHub
                </a>
              )}
              {safeExternalHref(dev.linkedin) && (
                <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-brand-purple">
                  <Link2 size={13} /> LinkedIn
                </a>
              )}
            </div>

            {dev.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {dev.skills.map((s) => (
                  <TechBadge key={s} label={s} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
          <Stat label="Products" value={dev.productCount} />
          <Stat label="Total views" value={dev.totalViews} />
          <Stat label="Total visits" value={dev.totalClicks} />
          <Stat label="Avg rating" value={dev.avgRating ? dev.avgRating.toFixed(1) : "—"} />
        </div>

        {isOwner && percent < 100 && (
          <div className="mt-5 rounded-xl border border-brand-purple/20 bg-brand-purple/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">Profile {percent}% complete</span>
              <button onClick={() => setEditOpen(true)} className="text-xs font-semibold text-brand-purple hover:underline">
                Complete it
              </button>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/5">
              <div className="h-full rounded-full bg-grad-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink/45">Missing: {missing.join(", ")}</p>
          </div>
        )}
      </motion.div>

      <section className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-ink">Products by {dev.name}</h2>
        {products.length === 0 ? (
          <EmptyState emoji="📦" title="No published products yet." />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>

      {isOwner && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={dev}
          onSaved={async (updated) => {
            setDev(updated);
            await refreshProfile();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xl font-extrabold text-ink">{typeof value === "number" ? formatNumber(value) : value}</p>
      <p className="text-xs text-ink/45">{label}</p>
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  profile,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaved: (p: UserProfile) => void;
}) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, form);
      toast.success("Profile updated");
      onSaved(form);
      onClose();
    } catch {
      toast.error("Couldn't save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <ImageUrlField label="Profile image URL" value={form.photoURL || ""} onChange={(v) => set("photoURL", v)} />
        <Input label="Headline" value={form.headline || ""} onChange={(e) => set("headline", e.target.value)} placeholder="Full-stack developer" />
        <Textarea label="Bio" value={form.bio || ""} onChange={(e) => set("bio", e.target.value)} maxLength={400} />
        <Input label="Location" value={form.location || ""} onChange={(e) => set("location", e.target.value)} />
        <Input label="Website" value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        <Input label="GitHub" value={form.github || ""} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/you" />
        <Input label="LinkedIn" value={form.linkedin || ""} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/you" />
        <Input label="Education" value={form.education || ""} onChange={(e) => set("education", e.target.value)} />
        <Input label="Experience" value={form.experience || ""} onChange={(e) => set("experience", e.target.value)} />
        <TagInput label="Skills" values={form.skills || []} onChange={(v) => set("skills", v)} suggestions={TECHNOLOGIES} />
      </div>
      <Button fullWidth className="mt-5" onClick={save} loading={saving}>
        Save changes
      </Button>
    </Modal>
  );
}

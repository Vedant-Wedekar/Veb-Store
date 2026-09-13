import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, Rocket, Save, Eye, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  generateUniqueSlug,
  getProductById,
} from "../services/productService";
import type { Product, PricingType } from "../types";
import { CATEGORIES, TECHNOLOGIES, PRICING_TYPES } from "../constants";
import { Input, Textarea, Select } from "../components/common/FormControls";
import TagInput from "../components/forms/TagInput";
import { ImageUrlField, ScreenshotListField } from "../components/forms/MediaFields";
import Button from "../components/common/Button";
import { Modal } from "../components/common/Primitives";
import { isValidHttpsUrl } from "../utils/url";
import ProductCard from "../components/product/ProductCard";

const emptyForm = {
  name: "",
  tagline: "",
  description: "",
  problemSolved: "",
  category: CATEGORIES[0] as string,
  subcategory: "",
  tags: [] as string[],
  features: [] as string[],
  logoUrl: "",
  screenshots: [] as string[],
  promoImageUrl: "",
  demoVideoUrl: "",
  websiteUrl: "",
  githubUrl: "",
  docsUrl: "",
  technologies: [] as string[],
  pricingType: "Free" as PricingType,
  targetAudience: "",
  version: "",
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [featureDraft, setFeatureDraft] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      const p = await getProductById(id);
      if (!p) {
        toast.error("Product not found");
        navigate("/dashboard");
        return;
      }
      if (user && p.ownerId !== user.uid) {
        toast.error("You don't have access to edit this product");
        navigate("/dashboard");
        return;
      }
      setExistingProduct(p);
      setForm({
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        problemSolved: p.problemSolved || "",
        category: p.category,
        subcategory: p.subcategory || "",
        tags: p.tags || [],
        features: p.features || [],
        logoUrl: p.logoUrl || "",
        screenshots: p.screenshots || [],
        promoImageUrl: p.promoImageUrl || "",
        demoVideoUrl: p.demoVideoUrl || "",
        websiteUrl: p.websiteUrl,
        githubUrl: p.githubUrl || "",
        docsUrl: p.docsUrl || "",
        technologies: p.technologies || [],
        pricingType: p.pricingType,
        targetAudience: p.targetAudience || "",
        version: p.version || "",
      });
      setLoading(false);
    })();
  }, [id, isEdit, user, navigate]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addFeature() {
    if (!featureDraft.trim()) return;
    set("features", [...form.features, featureDraft.trim()]);
    setFeatureDraft("");
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.tagline.trim()) e.tagline = "Tagline is required.";
    if (form.tagline.length > 100) e.tagline = "Keep the tagline under 100 characters.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.websiteUrl.trim() || !isValidHttpsUrl(form.websiteUrl)) e.websiteUrl = "Enter a valid https:// website URL.";
    if (form.githubUrl && !isValidHttpsUrl(form.githubUrl)) e.githubUrl = "Enter a valid https:// GitHub URL.";
    if (form.technologies.length === 0) e.technologies = "Add at least one technology.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(status: "draft" | "published") {
    if (!user || !profile) return;
    if (status === "published" && !validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && existingProduct) {
        await updateProduct(existingProduct.id, { ...form, status } as Partial<Product>);
        toast.success(status === "published" ? "Product published!" : "Draft saved");
        navigate(`/product/${existingProduct.slug}`);
      } else {
        const slug = await generateUniqueSlug(form.name);
        const newId = await createProduct({
          ...form,
          ownerId: user.uid,
          ownerName: profile.name,
          ownerUsername: profile.username,
          ownerAvatar: profile.photoURL,
          slug,
          status,
          launchDate: Date.now(),
        } as any);
        if (status === "published") {
          navigate(`/product/${slug}/launched?id=${newId}`);
        } else {
          toast.success("Draft saved");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong saving your product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingProduct) return;
    try {
      await deleteProduct(existingProduct.id);
      toast.success("Product deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Couldn't delete product.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-purple" size={28} />
      </div>
    );
  }

  const previewProduct: Product = {
    id: "preview",
    ownerId: user?.uid || "",
    ownerName: profile?.name || "You",
    ownerUsername: profile?.username || "you",
    ownerAvatar: profile?.photoURL,
    slug: "preview",
    status: "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    launchDate: existingProduct?.launchDate || Date.now(),
    views: existingProduct?.views || 0,
    clicks: existingProduct?.clicks || 0,
    ratingAvg: existingProduct?.ratingAvg || 0,
    ratingCount: existingProduct?.ratingCount || 0,
    reviewCount: existingProduct?.reviewCount || 0,
    ...form,
  } as Product;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{isEdit ? "Edit Product" : "Launch a Product"}</h1>
        <p className="mt-1 text-sm text-ink/50">
          {isEdit ? "Update your product details." : "Share what you've built with the community."}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <FormSection title="Basic Information">
          <Input label="Product name" required value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} placeholder="My Awesome App" />
          <Input
            label="Tagline"
            required
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            error={errors.tagline}
            placeholder="A one-line hook (max 100 chars)"
            maxLength={100}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input label="Subcategory (optional)" value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} />
          </div>
          <TagInput label="Tags" values={form.tags} onChange={(v) => set("tags", v)} placeholder="productivity, ai, tool..." />
        </FormSection>

        <FormSection title="Description">
          <Textarea
            label="Full description"
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            error={errors.description}
            placeholder="What does your product do?"
            maxLength={2000}
          />
          <Textarea
            label="Problem solved (optional)"
            value={form.problemSolved}
            onChange={(e) => set("problemSolved", e.target.value)}
            placeholder="What problem does this solve for users?"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Key features</label>
            <div className="flex gap-2">
              <input
                value={featureDraft}
                onChange={(e) => setFeatureDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Add a feature and press Enter"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple/50"
              />
              <button type="button" onClick={addFeature} className="shrink-0 rounded-xl border border-line px-4 text-sm font-semibold hover:border-ink/20">
                Add
              </button>
            </div>
            {form.features.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {form.features.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-ink/[0.03] px-3 py-1.5 text-sm text-ink/70">
                    {f}
                    <button type="button" onClick={() => set("features", form.features.filter((_, idx) => idx !== i))} className="text-ink/30 hover:text-red-500">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FormSection>

        <FormSection title="Media" hint="Upload media to Cloudinary and paste the resulting URLs here — WebStore doesn't host files directly.">
          <ImageUrlField label="Logo URL" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} />
          <ScreenshotListField values={form.screenshots} onChange={(v) => set("screenshots", v)} />
          <ImageUrlField label="Promotional image (optional)" value={form.promoImageUrl} onChange={(v) => set("promoImageUrl", v)} />
          <Input label="Demo video URL (optional)" value={form.demoVideoUrl} onChange={(e) => set("demoVideoUrl", e.target.value)} placeholder="https://..." />
        </FormSection>

        <FormSection title="Links">
          <Input label="Website URL" required value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} error={errors.websiteUrl} placeholder="https://yourproduct.com" />
          <Input label="GitHub URL (optional)" value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} error={errors.githubUrl} placeholder="https://github.com/you/repo" />
          <Input label="Documentation URL (optional)" value={form.docsUrl} onChange={(e) => set("docsUrl", e.target.value)} placeholder="https://docs.yourproduct.com" />
        </FormSection>

        <FormSection title="Technical Details">
          <TagInput
            label="Technologies"
            values={form.technologies}
            onChange={(v) => set("technologies", v)}
            suggestions={TECHNOLOGIES}
            placeholder="React, Firebase, Node.js..."
          />
          {errors.technologies && <p className="text-xs text-red-500">{errors.technologies}</p>}
        </FormSection>

        <FormSection title="Additional Details">
          <Select label="Pricing model" value={form.pricingType} onChange={(e) => set("pricingType", e.target.value as PricingType)}>
            {PRICING_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Input label="Target audience (optional)" value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} placeholder="Students, indie hackers, designers..." />
          <Input label="Version (optional)" value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="1.0.0" />
        </FormSection>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button variant="outline" onClick={() => setPreview(true)} type="button">
            <Eye size={15} /> Preview
          </Button>
          <Button variant="outline" onClick={() => handleSave("draft")} loading={saving} type="button">
            <Save size={15} /> Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} loading={saving} type="button">
            <Rocket size={15} /> {isEdit ? "Publish Changes" : "Publish Product"}
          </Button>
          {isEdit && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="ml-auto flex items-center gap-1.5 text-sm font-medium text-red-500 hover:underline"
            >
              <Trash2 size={14} /> Delete product
            </button>
          )}
        </div>
      </motion.div>

      <Modal open={preview} onClose={() => setPreview(false)} title="Preview">
        <div className="max-w-full">
          <ProductCard product={previewProduct} />
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete product?">
        <p className="text-sm text-ink/60">This will permanently remove "{existingProduct?.name}" and cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" fullWidth onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

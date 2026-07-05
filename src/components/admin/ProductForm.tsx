import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Plus, Trash2, Loader2, ImageIcon } from "lucide-react";
import {
  createProduct,
  updateProduct,
  uploadAdminImage,
  type AdminProduct,
  type FaqEntry,
  type ProductInput,
} from "@/hooks/useAdminData";
import { resolveProductImage } from "@/data/products";
import { toast } from "sonner";

const CATEGORIES = ["Smart Glasses", "Home Automation", "Gaming", "Enterprise"];
const TECHNOLOGIES = ["BCI + AR", "AR", "BCI", "Standard"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

interface ProductFormProps {
  product: AdminProduct | null; // null = create
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]);
  const [technology, setTechnology] = useState(product?.technology ?? TECHNOLOGIES[0]);
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [technologyStory, setTechnologyStory] = useState(product?.technology_story ?? "");
  const [warranty, setWarranty] = useState(product?.warranty ?? "");
  const [price, setPrice] = useState(product ? String(product.price_inr) : "");
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price_inr != null ? String(product.original_price_inr) : "",
  );
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(product ? String(product.stock) : "100");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState(
    product?.featured_order != null ? String(product.featured_order) : "",
  );
  const [partPaymentEnabled, setPartPaymentEnabled] = useState(product?.advance_type != null);
  const [advanceType, setAdvanceType] = useState<"percent" | "fixed">(product?.advance_type ?? "percent");
  const [advanceValue, setAdvanceValue] = useState(product?.advance_value != null ? String(product.advance_value) : "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [gallery, setGallery] = useState<string[]>(product?.gallery ?? []);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    product ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : [],
  );
  const [faqs, setFaqs] = useState<FaqEntry[]>(product?.faqs ?? []);

  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadAdminImage(file);
    setUploading(false);
    if (url) setImageUrl(url);
    else toast.error(error || "Upload failed");
  };

  const handleGalleryUpload = async (file: File | undefined) => {
    if (!file) return;
    setGalleryUploading(true);
    const { url, error } = await uploadAdminImage(file);
    setGalleryUploading(false);
    if (url) setGallery((g) => [...g, url]);
    else toast.error(error || "Upload failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { toast.error("Name and slug are required"); return; }
    const priceNum = parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum < 0) { toast.error("Enter a valid price"); return; }
    const stockNum = parseInt(stock, 10);

    const specObject: Record<string, string> = {};
    for (const s of specs) if (s.key.trim()) specObject[s.key.trim()] = s.value;
    const cleanFaqs = faqs.filter((f) => f.question.trim());
    const featuredOrderNum = featuredOrder.trim() ? parseInt(featuredOrder, 10) : null;
    const advanceValueNum = parseInt(advanceValue, 10);
    if (partPaymentEnabled && (Number.isNaN(advanceValueNum) || advanceValueNum < 0)) {
      toast.error("Enter a valid advance amount"); return;
    }
    if (partPaymentEnabled && advanceType === "percent" && advanceValueNum > 100) {
      toast.error("Advance percentage can't exceed 100"); return;
    }

    const payload: ProductInput = {
      slug: slug.trim(),
      name: name.trim(),
      tagline: tagline.trim() || null,
      category,
      technology,
      short_description: shortDescription.trim() || null,
      technology_story: technologyStory.trim() || null,
      warranty: warranty.trim() || null,
      price_inr: priceNum,
      original_price_inr: originalPrice.trim() ? parseInt(originalPrice, 10) : null,
      sku: sku.trim() || null,
      stock: Number.isNaN(stockNum) ? 0 : stockNum,
      is_active: isActive,
      is_featured: isFeatured,
      featured_order: featuredOrderNum != null && !Number.isNaN(featuredOrderNum) ? featuredOrderNum : null,
      advance_type: partPaymentEnabled ? advanceType : null,
      advance_value: partPaymentEnabled ? advanceValueNum : null,
      image_url: imageUrl || null,
      gallery,
      specifications: specObject,
      faqs: cleanFaqs,
    };

    setSaving(true);
    const res = isEdit ? await updateProduct(product!.id, payload) : await createProduct(payload);
    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? "Product updated" : "Product created");
      onSaved();
    } else {
      toast.error(res.error || "Save failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="h-full w-full max-w-2xl overflow-y-auto bg-[#f8f9fc] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic info */}
          <Section title="Basic Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrap label="Product Name *">
                <input value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} placeholder="TeleARGlass Legacy" />
              </FieldWrap>
              <FieldWrap label="Slug (URL) *">
                <input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                  className={`${inputCls} font-mono`}
                  placeholder="telearglass-legacy"
                />
              </FieldWrap>
            </div>
            <FieldWrap label="Tagline">
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} placeholder="Short tagline…" />
            </FieldWrap>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrap label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FieldWrap>
              <FieldWrap label="Technology">
                <select value={technology} onChange={(e) => setTechnology(e.target.value)} className={inputCls}>
                  {TECHNOLOGIES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FieldWrap>
            </div>
            <FieldWrap label="Short Description">
              <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} className={inputCls} placeholder="One-line summary shown on cards…" />
            </FieldWrap>
            <FieldWrap label="Technology Story">
              <textarea value={technologyStory} onChange={(e) => setTechnologyStory(e.target.value)} rows={3} className={inputCls} placeholder="Longer narrative for the product page…" />
            </FieldWrap>
            <FieldWrap label="Warranty">
              <input value={warranty} onChange={(e) => setWarranty(e.target.value)} className={inputCls} placeholder="2-year limited warranty." />
            </FieldWrap>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Active (visible on store)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                Show on homepage
              </label>
              {isFeatured && (
                <input
                  type="number"
                  value={featuredOrder}
                  onChange={(e) => setFeaturedOrder(e.target.value)}
                  placeholder="Order (lower shows first)"
                  className={`${inputCls} w-56`}
                />
              )}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing & Stock">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FieldWrap label="Selling Price (₹) *">
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="58999" />
              </FieldWrap>
              <FieldWrap label="Compare Price (₹)">
                <input type="number" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className={inputCls} placeholder="64999" />
              </FieldWrap>
              <FieldWrap label="SKU">
                <input value={sku} onChange={(e) => setSku(e.target.value)} className={`${inputCls} font-mono`} placeholder="TAG-LEGACY" />
              </FieldWrap>
              <FieldWrap label="Stock">
                <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} placeholder="100" />
              </FieldWrap>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={partPaymentEnabled} onChange={(e) => setPartPaymentEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Allow part payment (pay advance now, rest before delivery)
            </label>
            {partPaymentEnabled && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldWrap label="Advance type">
                  <select value={advanceType} onChange={(e) => setAdvanceType(e.target.value as "percent" | "fixed")} className={inputCls}>
                    <option value="percent">Percentage of price</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                </FieldWrap>
                <FieldWrap label={advanceType === "percent" ? "Advance percentage (%)" : "Advance amount (₹)"}>
                  <input type="number" min="0" max={advanceType === "percent" ? 100 : undefined} value={advanceValue} onChange={(e) => setAdvanceValue(e.target.value)} className={inputCls} placeholder={advanceType === "percent" ? "20" : "5000"} />
                </FieldWrap>
              </div>
            )}
          </Section>

          {/* Images */}
          <Section title="Product Image">
            <div className="flex items-start gap-4">
              <img src={resolveProductImage(imageUrl)} alt="" className="h-24 w-24 rounded-xl border border-gray-200 bg-white object-cover" />
              <div className="flex-1">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500 transition hover:border-primary hover:text-primary">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : "Drag & drop image, or browse"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                </label>
                <p className="mt-1 text-[11px] text-gray-400">Supports JPEG, PNG, WEBP, and GIF (max 5MB). Uploaded to the public admin-assets bucket.</p>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="mb-2 text-xs font-medium text-gray-500">Gallery</div>
              <div className="flex flex-wrap gap-2">
                {gallery.map((g, i) => (
                  <div key={i} className="group relative">
                    <img src={resolveProductImage(g)} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border border-dashed border-gray-300 text-gray-400 transition hover:border-primary hover:text-primary">
                  {galleryUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </Section>

          {/* Specifications */}
          <Section title="Specifications">
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s.key}
                    onChange={(e) => setSpecs((prev) => prev.map((x, idx) => (idx === i ? { ...x, key: e.target.value } : x)))}
                    className={`${inputCls} flex-1`}
                    placeholder="Display"
                  />
                  <input
                    value={s.value}
                    onChange={(e) => setSpecs((prev) => prev.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    className={`${inputCls} flex-[2]`}
                    placeholder="Dual full-color waveguide, 2400 nits"
                  />
                  <button type="button" onClick={() => setSpecs((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])} className={addBtnCls}>
                <Plus className="h-3.5 w-3.5" /> Add specification
              </button>
            </div>
          </Section>

          {/* FAQs */}
          <Section title="FAQs">
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex gap-2">
                    <input
                      value={f.question}
                      onChange={(e) => setFaqs((prev) => prev.map((x, idx) => (idx === i ? { ...x, question: e.target.value } : x)))}
                      className={`${inputCls} flex-1`}
                      placeholder="Question"
                    />
                    <button type="button" onClick={() => setFaqs((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={f.answer}
                    onChange={(e) => setFaqs((prev) => prev.map((x, idx) => (idx === i ? { ...x, answer: e.target.value } : x)))}
                    rows={2}
                    className={`${inputCls} mt-2`}
                    placeholder="Answer"
                  />
                </div>
              ))}
              <button type="button" onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])} className={addBtnCls}>
                <Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>
          </Section>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-gray-400";
const addBtnCls =
  "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/5";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FieldWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}

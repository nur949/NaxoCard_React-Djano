import { Heart, Loader2, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api, { mediaUrl, productImage } from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import ProductCarousel from "../components/common/ProductCarousel.jsx";
import ProductSeoContent from "../components/common/ProductSeoContent.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { useCart } from "../context/CartContext.jsx";

function buildDefaultVariants(item) {
  const defaults = {};
  item?.variants?.forEach((variant) => {
    if (defaults[variant.name] || variant.stock < 1) return;
    defaults[variant.name] = variant.value;
  });
  return defaults;
}

function isColorVariant(name) {
  return String(name || "").trim().toLowerCase() === "color";
}

function colorSwatch(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const palette = {
    black: "#111827",
    white: "#ffffff",
    brown: "#8b5e3c",
    red: "#dc2626",
    blue: "#2563eb",
    green: "#16a34a",
    yellow: "#eab308",
    pink: "#ec4899",
    gray: "#9ca3af",
    grey: "#9ca3af",
    navy: "#1e3a8a",
    beige: "#d6c1a3",
    cream: "#f5f1e8",
    orange: "#f97316",
    purple: "#7c3aed",
    silver: "#cbd5e1",
    gold: "#d4af37",
  };
  return palette[normalized] || value;
}

function variantGallery(variant) {
  return Array.isArray(variant?.gallery) ? variant.gallery.map(mediaUrl).filter(Boolean) : [];
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariants, setSelectedVariants] = useState({});
  const [review, setReview] = useState({ rating: 5, title: "", comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([api.get(`/products/${slug}/`), api.get(`/products/${slug}/related/`)])
      .then(([productResponse, relatedResponse]) => {
        const item = productResponse.data;
        const gallery = Array.isArray(item.gallery) ? item.gallery.map(mediaUrl) : [];
        setProduct(item);
        setRelated(relatedResponse.data);
        setSelectedImage(productImage(item, gallery[0] || ""));
        setSelectedVariants(buildDefaultVariants(item));
        setQuantity(1);
        setActiveTab("description");
        setZoomActive(false);
        setZoomPosition({ x: 50, y: 50 });
      })
      .catch(() => setError("Product not found."));
  }, [slug]);

  const images = useMemo(() => {
    if (!product) return [];
    const gallery = Array.isArray(product.gallery) ? product.gallery.map(mediaUrl) : [];
    return [mediaUrl(product.image), ...gallery].filter(Boolean);
  }, [product]);

  const variantGroups = useMemo(() => {
    const groups = {};
    product?.variants?.forEach((variant) => {
      groups[variant.name] = [...(groups[variant.name] || []), variant];
    });
    return groups;
  }, [product]);

  const activeColorVariant = useMemo(() => {
    const colorName = Object.keys(variantGroups).find(isColorVariant);
    if (!colorName) return null;
    return (variantGroups[colorName] || []).find((variant) => selectedVariants[colorName] === variant.value) || null;
  }, [selectedVariants, variantGroups]);

  const displayedImages = useMemo(() => {
    const colorImages = variantGallery(activeColorVariant);
    return colorImages.length ? colorImages : images;
  }, [activeColorVariant, images]);

  useEffect(() => {
    if (!displayedImages.length) return;
    setSelectedImage((current) => (displayedImages.includes(current) ? current : displayedImages[0]));
  }, [displayedImages]);

  if (error) return <section className="section py-8"><ErrorBox message={error} /></section>;
  if (!product) return <section className="section py-8"><Skeleton lines={12} /></section>;

  const heroImage = selectedImage || displayedImages[0] || mediaUrl("/static/demo-products/sneaker-black.svg");
  const inStock = product.stock > 0;
  const requiredVariantNames = Object.keys(variantGroups);
  const variantsSelected = requiredVariantNames.every((name) => selectedVariants[name]);
  const subtotal = (Number(product.price || 0) * quantity).toFixed(2);
  const productCode = product.slug || `MS-${product.id}`;

  function changeQuantity(nextQuantity) {
    const next = Math.max(1, Math.min(product.stock || 1, Number(nextQuantity) || 1));
    setQuantity(next);
  }

  function handleImageZoom(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  async function submitReview(event) {
    event.preventDefault();
    setReviewLoading(true);
    setReviewMessage("");
    try {
      const { data } = await api.post(`/products/${slug}/review/`, review);
      setProduct({ ...product, reviews: [data, ...(product.reviews || [])], review_count: (product.review_count || 0) + 1 });
      setReview({ rating: 5, title: "", comment: "" });
      setReviewMessage("Review submitted.");
    } catch {
      setReviewMessage("Login is required to review this product.");
    } finally {
      setReviewLoading(false);
    }
  }

  const tabContent = {
    description: (
      <div className="space-y-4 leading-7 text-muted-foreground">
        <p>{product.description}</p>
        <ul className="grid gap-2 text-sm">
          <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" /> Premium comfort construction for regular wear.</li>
          <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" /> Product availability depends on live stock and selected variants.</li>
          <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" /> Please check the product in front of the delivery person.</li>
        </ul>
      </div>
    ),
    terms: (
      <div className="space-y-4 leading-7 text-muted-foreground">
        <p>Orders are processed after confirmation and shipped to the selected delivery address. Paid orders cannot be cancelled after dispatch.</p>
        <p>For size exchange or delivery issues, contact customer care within 7 days of delivery with your order information.</p>
      </div>
    ),
    size: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="border p-3">Type</th><th className="border p-3">Small</th><th className="border p-3">Medium</th><th className="border p-3">Large</th></tr>
          </thead>
          <tbody>
            <tr><td className="border p-3 font-bold">Men</td><td className="border p-3">39-40</td><td className="border p-3">41-42</td><td className="border p-3">43-44</td></tr>
            <tr><td className="border p-3 font-bold">Women</td><td className="border p-3">35-36</td><td className="border p-3">37-38</td><td className="border p-3">39-40</td></tr>
            <tr><td className="border p-3 font-bold">Kids</td><td className="border p-3">28-30</td><td className="border p-3">31-33</td><td className="border p-3">34-36</td></tr>
          </tbody>
        </table>
      </div>
    ),
  };

  return (
    <>
      <section className="border-b bg-muted/35">
        <div className="section flex items-center gap-2 py-4 text-sm font-semibold text-muted-foreground">
          <span>Home</span><span>/</span><span>{product.category?.name || "Products"}</span><span>/</span><span className="truncate text-foreground">{product.name}</span>
        </div>
      </section>

      <section className="section grid gap-10 py-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="grid gap-4 lg:grid-cols-[92px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:grid lg:content-start">
              {(displayedImages.length ? displayedImages : [heroImage]).map((image) => (
                <button key={image} className={`h-20 w-20 shrink-0 overflow-hidden bg-white shadow-sm transition-all ${selectedImage === image ? "ring-2 ring-primary/40" : "hover:shadow-md"}`} onClick={() => setSelectedImage(image)} aria-label="View product image">
                  <img src={image} alt="" className="h-full w-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
            <div
              className={`order-1 overflow-hidden bg-white shadow-sm lg:order-2 ${zoomActive ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => {
                setZoomActive(false);
                setZoomPosition({ x: 50, y: 50 });
              }}
              onMouseMove={handleImageZoom}
            >
              <img
                className="h-[440px] w-full object-contain transition-transform duration-200 ease-out sm:h-[560px]"
                src={heroImage}
                alt={product.name}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: zoomActive ? "scale(2.35)" : "scale(1)",
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">Roll over or click image to zoom in</p>
        </div>

        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="border-b pb-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.discount_percent > 0 && <Badge variant="default">Sale</Badge>}
              <Badge variant={inStock ? "outline" : "destructive"}>{inStock ? "In stock" : "Sold out"}</Badge>
            </div>
            <h1 className="text-3xl font-black uppercase leading-tight tracking-normal sm:text-4xl">{product.name}</h1>
            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <p><span className="font-bold text-foreground">Brand:</span> {product.category?.name || "NaxoCard"}</p>
              <p><span className="font-bold text-foreground">Product Code:</span> {productCode}</p>
              <p><span className="font-bold text-foreground">Availability:</span> {inStock ? "In stock" : "Out of stock"}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-accent">
              <Star size={18} fill="currentColor" />
              <span className="font-bold">{Number(product.rating || 0).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.review_count || 0} reviews)</span>
            </div>
          </div>

          <div className="border-b py-5">
            <div className="flex flex-wrap items-end gap-3">
              {product.compare_at_price && <span className="text-2xl font-bold text-muted-foreground line-through">Tk {product.compare_at_price}</span>}
              <span className="text-3xl font-black text-primary">Tk {product.price}</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> PLEASE CHECK THE PRODUCT INFRONT OF DELIVERY MAN</span>
              <span className="flex items-center gap-2"><Truck size={16} className="text-primary" /> FREE SHIPPING</span>
              <span className="flex items-center gap-2"><RotateCcw size={16} className="text-primary" /> Size exchange available within 7 days</span>
            </div>
          </div>

          {Object.entries(variantGroups).map(([name, values]) => (
            <div className="border-b py-5" key={name}>
              <p className="mb-3 text-sm font-black uppercase">{name} *</p>
              <div className="flex flex-wrap gap-2">
                {values.map((variant) => (
                  isColorVariant(name) ? (
                    <button
                      key={variant.id}
                      type="button"
                      className={`flex min-w-[110px] items-center gap-3 border px-3 py-2 text-sm font-bold transition-all ${selectedVariants[name] === variant.value ? "border-foreground bg-foreground text-background shadow-sm" : "border-border bg-background hover:border-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}
                      onClick={() => setSelectedVariants({ ...selectedVariants, [name]: variant.value })}
                      disabled={variant.stock < 1}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border border-slate-300"
                        style={{ backgroundColor: colorSwatch(variant.value) }}
                        aria-hidden="true"
                      />
                      <span>{variant.value}</span>
                    </button>
                  ) : (
                    <button
                      key={variant.id}
                      type="button"
                      className={`min-w-14 border px-4 py-2 text-sm font-bold transition-colors ${selectedVariants[name] === variant.value ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}
                      onClick={() => setSelectedVariants({ ...selectedVariants, [name]: variant.value })}
                      disabled={variant.stock < 1}
                    >
                      {variant.value}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}

          <div className="py-5">
            <p className="mb-3 text-sm font-black uppercase">Quantity:</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 overflow-hidden border">
                <button className="grid w-12 place-items-center border-r hover:bg-muted" onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity"><Minus size={16} /></button>
                <input className="w-16 border-0 bg-background text-center text-sm font-black outline-none" type="number" min="1" max={product.stock} value={quantity} onChange={(event) => changeQuantity(event.target.value)} />
                <button className="grid w-12 place-items-center border-l hover:bg-muted" onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Subtotal: <span className="text-lg font-black text-foreground">Tk {subtotal}</span></p>
            </div>
            {!variantsSelected && requiredVariantNames.length > 0 && <p className="mt-3 text-sm font-semibold text-primary">Select {requiredVariantNames.join(" and ")} before adding to cart.</p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button className="flex h-14 items-center justify-center gap-2 bg-black px-8 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/40" onClick={() => add(product.id, quantity, product)} disabled={!inStock || !variantsSelected}>
                <ShoppingCart size={18} /> Add to cart
              </button>
              <Button variant="outline" className="h-14 px-5" onClick={() => api.post(`/products/${slug}/wishlist/`).then(() => setProduct({ ...product, is_wishlisted: !product.is_wishlisted }))}>
                <Heart size={18} fill={product.is_wishlisted ? "currentColor" : "none"} /> Add to Wish List
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section py-8">
        <div className="border bg-card">
          <div className="flex flex-wrap border-b">
            {[
              ["description", "Description"],
              ["terms", "Terms and Conditions"],
              ["size", "Size Chart"],
            ].map(([id, label]) => (
              <button key={id} className={`border-r px-5 py-4 text-sm font-black uppercase ${activeTab === id ? "bg-foreground text-background" : "hover:bg-muted"}`} onClick={() => setActiveTab(id)}>{label}</button>
            ))}
          </div>
          <div className="p-6">{tabContent[activeTab]}</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="border bg-card p-6">
            <h2 className="text-2xl">Reviews</h2>
            <div className="mt-4 grid gap-4">
              {(product.reviews || []).slice(0, 4).map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 text-accent"><Star size={15} fill="currentColor" /> {item.rating}</div>
                  <p className="mt-1 font-semibold">{item.title || "Customer review"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.comment || "No written comment."}</p>
                </div>
              ))}
              {(!product.reviews || product.reviews.length === 0) && <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>}
            </div>
          </div>

          <form className="border bg-card p-6" onSubmit={submitReview}>
            <h3 className="text-lg">Write a review</h3>
            {reviewMessage && <p className="mt-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">{reviewMessage}</p>}
            <div className="mt-4 grid gap-3">
              <select className="input" value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
              </select>
              <input className="input" placeholder="Review title" value={review.title} onChange={(event) => setReview({ ...review, title: event.target.value })} />
              <textarea className="input min-h-24" placeholder="Share your experience" value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} />
              <Button disabled={reviewLoading}>{reviewLoading && <Loader2 className="animate-spin" size={16} />} Submit review</Button>
            </div>
          </form>
        </div>
      </section>

      <ProductSeoContent product={product} />

      <div className="pb-24 lg:pb-0">
        <ProductCarousel title="Related products" subtitle="More items from the same collection." products={related} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card p-3 shadow-premium lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{product.name}</p>
            <p className="font-black text-primary">Tk {product.price}</p>
          </div>
          <Button onClick={() => add(product.id, quantity, product)} disabled={!inStock || !variantsSelected}>
            <ShoppingCart size={17} /> Add
          </Button>
        </div>
      </div>
    </>
  );
}

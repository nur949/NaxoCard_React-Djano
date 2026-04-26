import { ChevronLeft, ChevronRight, Heart, Loader2, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Star, Truck, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerZoom, setViewerZoom] = useState(1);
  const [viewerOffset, setViewerOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const touchStateRef = useRef(null);

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
        setViewerOpen(false);
        setViewerZoom(1);
        setViewerOffset({ x: 0, y: 0 });
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

  useEffect(() => {
    setViewerZoom(1);
    setViewerOffset({ x: 0, y: 0 });
  }, [selectedImage]);

  useEffect(() => {
    if (!viewerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [viewerOpen]);

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

  function openViewer(image) {
    setSelectedImage(image);
    setViewerOpen(true);
    setViewerZoom(1);
    setViewerOffset({ x: 0, y: 0 });
  }

  function closeViewer() {
    setViewerOpen(false);
    setViewerZoom(1);
    setViewerOffset({ x: 0, y: 0 });
  }

  function changeViewerImage(direction) {
    if (!displayedImages.length) return;
    const currentIndex = displayedImages.indexOf(selectedImage);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + displayedImages.length) % displayedImages.length;
    setSelectedImage(displayedImages[nextIndex]);
  }

  function adjustViewerZoom(direction) {
    setViewerZoom((current) => {
      const next = Math.max(1, Math.min(3, Number((current + direction).toFixed(2))));
      if (next === 1) {
        setViewerOffset({ x: 0, y: 0 });
      }
      return next;
    });
  }

  function onViewerTouchStart(event) {
    if (viewerZoom <= 1) return;
    const touch = event.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      originX: viewerOffset.x,
      originY: viewerOffset.y,
    };
  }

  function onViewerTouchMove(event) {
    if (viewerZoom <= 1 || !touchStateRef.current) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;
    setViewerOffset({
      x: touchStateRef.current.originX + deltaX,
      y: touchStateRef.current.originY + deltaY,
    });
  }

  function onViewerTouchEnd() {
    touchStateRef.current = null;
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
        <div className="section flex flex-wrap items-center gap-2 py-4 text-xs font-semibold text-muted-foreground sm:text-sm">
          <span>Home</span><span>/</span><span>{product.category?.name || "Products"}</span><span>/</span><span className="truncate text-foreground">{product.name}</span>
        </div>
      </section>

      <section className="section grid gap-6 py-5 sm:gap-10 sm:py-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-3 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-4">
            <div className="grid gap-4 lg:grid-cols-[92px_1fr]">
            <div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:grid lg:content-start">
              {(displayedImages.length ? displayedImages : [heroImage]).map((image) => (
                <button key={image} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm transition-all sm:h-20 sm:w-20 ${selectedImage === image ? "ring-2 ring-primary/40" : "hover:shadow-md"}`} onClick={() => setSelectedImage(image)} aria-label="View product image">
                  <img src={image} alt="" className="h-full w-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
            <div
              className={`order-1 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),rgba(240,247,255,0.9))] shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:order-2 ${zoomActive ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => {
                setZoomActive(false);
                setZoomPosition({ x: 50, y: 50 });
              }}
              onMouseMove={handleImageZoom}
              onClick={() => openViewer(heroImage)}
            >
              <img
                className="h-[230px] w-full object-contain p-3 transition-transform duration-200 ease-out sm:h-[420px] md:h-[520px] lg:h-[560px]"
                src={heroImage}
                alt={product.name}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: zoomActive ? "scale(2.35)" : "scale(1)",
                }}
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/70 bg-white/88 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur sm:text-xs">
                <span>Tap for full screen</span>
                <span>{displayedImages.indexOf(heroImage) + 1}/{displayedImages.length || 1}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground sm:text-xs">Tap image on mobile for fullscreen zoom, or hover on desktop to inspect detail.</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="border-b pb-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.discount_percent > 0 && <Badge variant="default">Sale</Badge>}
              <Badge variant={inStock ? "outline" : "destructive"}>{inStock ? "In stock" : "Sold out"}</Badge>
            </div>
            <h1 className="text-[1.45rem] font-black uppercase leading-tight tracking-normal sm:text-4xl">{product.name}</h1>
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
                      className={`flex min-w-[96px] items-center gap-2 border px-3 py-2 text-sm font-bold transition-all sm:min-w-[110px] sm:gap-3 ${selectedVariants[name] === variant.value ? "border-foreground bg-foreground text-background shadow-sm" : "border-border bg-background hover:border-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}
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
                      className={`min-w-12 border px-3 py-2 text-sm font-bold transition-colors sm:min-w-14 sm:px-4 ${selectedVariants[name] === variant.value ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}
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
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex h-12 overflow-hidden border">
                <button className="grid w-12 place-items-center border-r hover:bg-muted" onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity"><Minus size={16} /></button>
                <input className="w-16 border-0 bg-background text-center text-sm font-black outline-none" type="number" min="1" max={product.stock} value={quantity} onChange={(event) => changeQuantity(event.target.value)} />
                <button className="grid w-12 place-items-center border-l hover:bg-muted" onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Subtotal: <span className="text-lg font-black text-foreground">Tk {subtotal}</span></p>
            </div>
            {!variantsSelected && requiredVariantNames.length > 0 && <p className="mt-3 text-sm font-semibold text-primary">Select {requiredVariantNames.join(" and ")} before adding to cart.</p>}
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
              <button className="flex h-13 min-h-[3.25rem] items-center justify-center gap-2 bg-black px-6 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/40 sm:h-14 sm:px-8" onClick={() => add(product.id, quantity, product)} disabled={!inStock || !variantsSelected}>
                <ShoppingCart size={18} /> Add to cart
              </button>
              <Button variant="outline" className="h-13 min-h-[3.25rem] px-5 sm:h-14" onClick={() => api.post(`/products/${slug}/wishlist/`).then(() => setProduct({ ...product, is_wishlisted: !product.is_wishlisted }))}>
                <Heart size={18} fill={product.is_wishlisted ? "currentColor" : "none"} /> Add to Wish List
              </Button>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="section py-8">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex overflow-x-auto border-b">
            {[
              ["description", "Description"],
              ["terms", "Terms and Conditions"],
              ["size", "Size Chart"],
            ].map(([id, label]) => (
              <button key={id} className={`shrink-0 border-r px-4 py-4 text-xs font-black uppercase sm:px-5 sm:text-sm ${activeTab === id ? "bg-foreground text-background" : "hover:bg-muted"}`} onClick={() => setActiveTab(id)}>{label}</button>
            ))}
          </div>
          <div className="p-4 sm:p-6">{tabContent[activeTab]}</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-2xl border bg-card p-4 sm:p-6">
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

          <form className="rounded-2xl border bg-card p-4 sm:p-6" onSubmit={submitReview}>
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
      {viewerOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/96 lg:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-4 text-white">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8"
                onClick={closeViewer}
                aria-label="Close image viewer"
              >
                <X size={20} />
              </button>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/65">Image viewer</p>
                <p className="text-sm font-semibold text-white/92">{displayedImages.indexOf(selectedImage) + 1} / {displayedImages.length || 1}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8"
                  onClick={() => adjustViewerZoom(-0.5)}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8"
                  onClick={() => adjustViewerZoom(0.5)}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {displayedImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-900/55 text-white backdrop-blur"
                    onClick={() => changeViewerImage(-1)}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-900/55 text-white backdrop-blur"
                    onClick={() => changeViewerImage(1)}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              ) : null}

              <div
                className="flex h-full items-center justify-center px-6"
                onTouchStart={onViewerTouchStart}
                onTouchMove={onViewerTouchMove}
                onTouchEnd={onViewerTouchEnd}
                onClick={() => {
                  if (viewerZoom > 1) {
                    setViewerZoom(1);
                    setViewerOffset({ x: 0, y: 0 });
                    return;
                  }
                  setViewerZoom(2);
                }}
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="max-h-full w-full object-contain transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate3d(${viewerOffset.x}px, ${viewerOffset.y}px, 0) scale(${viewerZoom})`,
                  }}
                />
              </div>
            </div>

            <div className="border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-white/72">
                <span>Tap image to toggle zoom</span>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-white/90"
                  onClick={() => {
                    setViewerZoom(1);
                    setViewerOffset({ x: 0, y: 0 });
                  }}
                >
                  Reset
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayedImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${selectedImage === image ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.22)]" : "border-white/12 opacity-80"}`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain bg-white/95 p-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

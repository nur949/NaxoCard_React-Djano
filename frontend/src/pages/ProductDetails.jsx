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
      <section className="bg-muted/30 border-b border-border">
        <div className="section py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-primary transition-colors">{product.category?.name || "Products"}</Link>
            <ChevronRight size={14} />
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="section py-8 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Side: Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden bg-gradient-to-b from-muted/50 to-muted/20 border border-border shadow-soft group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={heroImage}
                  src={heroImage}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="h-full w-full object-contain p-12 transition-transform duration-700 group-hover:scale-105"
                />
              </AnimatePresence>
              
              <button 
                onClick={() => setViewerOpen(true)}
                className="absolute bottom-8 right-8 h-12 w-12 rounded-full surface-glass flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all shadow-premium"
              >
                <ZoomIn size={24} />
              </button>

              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {product.discount_percent > 0 && (
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-neon">
                    {product.discount_percent}% OFF
                  </span>
                )}
                <span className={cn(
                  "px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg",
                  inStock ? "bg-emerald-500 text-white" : "bg-destructive text-white"
                )}>
                  {inStock ? "In Stock" : "Sold Out"}
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-5 gap-4">
              {displayedImages.map((image, i) => (
                <motion.button
                  key={image}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    "aspect-square rounded-2xl overflow-hidden bg-muted border-2 transition-all",
                    selectedImage === image ? "border-primary scale-105 shadow-neon" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={image} alt="" className="h-full w-full object-contain p-2" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Side: Product Info (Sticky) */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tighter mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-black">{Number(product.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  {product.review_count || 0} REVIEWS
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  SKU: {productCode}
                </span>
              </div>
            </motion.div>

            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <span className="text-5xl font-black text-foreground tracking-tighter">Tk {product.price}</span>
                {product.compare_at_price && (
                  <span className="text-2xl font-bold text-muted-foreground line-through mb-1 opacity-50">
                    Tk {product.compare_at_price}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg max-w-lg">
                {product.description}
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(variantGroups).map(([name, values]) => (
                <div key={name} className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Select {name}</p>
                  <div className="flex flex-wrap gap-3">
                    {values.map((variant) => (
                      <button
                        key={variant.id}
                        disabled={variant.stock < 1}
                        onClick={() => setSelectedVariants({ ...selectedVariants, [name]: variant.value })}
                        className={cn(
                          "min-w-[60px] h-12 px-4 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-2",
                          selectedVariants[name] === variant.value 
                            ? "border-primary bg-primary text-primary-foreground shadow-neon" 
                            : "border-border bg-background hover:border-primary/50",
                          variant.stock < 1 && "opacity-30 cursor-not-allowed"
                        )}
                      >
                        {isColorVariant(name) && (
                          <span 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ backgroundColor: colorSwatch(variant.value) }}
                          />
                        )}
                        {variant.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
              <div className="flex items-center gap-6">
                <div className="flex h-14 rounded-2xl border-2 border-border overflow-hidden bg-muted/20">
                  <button 
                    onClick={() => changeQuantity(quantity - 1)}
                    className="w-14 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => changeQuantity(e.target.value)}
                    className="w-16 bg-transparent text-center font-black text-lg outline-none"
                  />
                  <button 
                    onClick={() => changeQuantity(quantity + 1)}
                    className="w-14 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Price</span>
                  <span className="text-2xl font-black">Tk {subtotal}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={!inStock || !variantsSelected}
                  onClick={() => add(product.id, quantity, product)}
                  className="flex-1 h-16 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-neon hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => api.post(`/products/${slug}/wishlist/`).then(() => setProduct({ ...product, is_wishlisted: !product.is_wishlisted }))}
                  className={cn(
                    "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all",
                    product.is_wishlisted ? "bg-primary border-primary text-white shadow-neon" : "border-border text-foreground hover:border-primary"
                  )}
                >
                  <Heart size={24} className={cn(product.is_wishlisted && "fill-current")} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <Truck className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">Free Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <RotateCcw className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">7 Day Return</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs & Content */}
      <section className="section py-16">
        <div className="border-t border-border pt-16">
          <div className="flex gap-12 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            {[
              ["description", "Product Details"],
              ["terms", "Returns & Policy"],
              ["size", "Size Guide"],
            ].map(([id, label]) => (
              <button 
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "text-xl md:text-2xl font-black uppercase tracking-tighter whitespace-nowrap transition-all",
                  activeTab === id ? "text-primary scale-110" : "text-muted-foreground opacity-50 hover:opacity-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            {tabContent[activeTab]}
          </motion.div>
        </div>
      </section>

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

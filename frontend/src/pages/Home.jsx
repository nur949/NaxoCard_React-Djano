import { ShieldCheck, Truck, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "../api/client.js";
import CategoryGrid from "../components/common/CategoryGrid.jsx";
import HeroSection from "../components/common/HeroSection.jsx";
import HomeCategoryTiles from "../components/common/HomeCategoryTiles.jsx";
import ProductCarousel from "../components/common/ProductCarousel.jsx";
import PromoBanners from "../components/common/PromoBanners.jsx";
import Testimonials from "../components/common/Testimonials.jsx";
import Skeleton from "../components/Skeleton.jsx";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHome = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    Promise.all([
      api.get("/products/featured/"),
      api.get("/products/?ordering=-sales_count"),
      api.get("/categories/"),
    ]).then(([featuredResponse, trendingResponse, categoryResponse]) => {
      setFeatured(featuredResponse.data);
      setTrending(trendingResponse.data.results || trendingResponse.data);
      setCategories((categoryResponse.data.results || categoryResponse.data).slice(0, 4));
    }).finally(() => setLoading(false));
  }, [loadHome]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  useEffect(() => {
    const refresh = () => loadHome(false);
    const onMutation = (event) => {
      const url = event.detail?.url || "";
      if (url.startsWith("/products") || url.startsWith("/categories")) refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("myshop:api-mutated", onMutation);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("myshop:api-mutated", onMutation);
    };
  }, []);

  return (
    <>
      <HeroSection />
      <HomeCategoryTiles />
      <section className="section grid gap-4 py-10 sm:grid-cols-3">
        {[[Truck, "Tracked orders"], [WalletCards, "Stripe checkout"], [ShieldCheck, "JWT protected"]].map(([Icon, text]) => (
          <div className="panel flex items-center gap-3 p-5" key={text}><Icon className="text-primary" /><span className="font-bold">{text}</span></div>
        ))}
      </section>
      <PromoBanners />
      {loading ? <section className="section py-12"><Skeleton lines={8} /></section> : (
        <>
          <ProductCarousel title="Best Seller" subtitle="Popular products shoppers are buying now." products={featured.length ? featured : trending.slice(0, 8)} />
          <section className="section py-12">
            <div className="mb-6">
              <h2>Shop by category</h2>
              <p className="mt-2 text-muted-foreground">Visual discovery for the fastest path to the right product.</p>
            </div>
            <CategoryGrid categories={categories} />
          </section>
          <ProductCarousel title="Popular Products" subtitle="Explore footwear and accessories by everyday demand." products={trending} />
        </>
      )}
      <Testimonials />
    </>
  );
}

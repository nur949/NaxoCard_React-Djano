import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/client.js";
import HeroSection from "../components/common/HeroSection.jsx";
import HomeCategoryTiles from "../components/common/HomeCategoryTiles.jsx";
import HomeProductShowcase from "../components/common/HomeProductShowcase.jsx";
import PromoBanners from "../components/common/PromoBanners.jsx";
import SeoContentSection from "../components/common/SeoContentSection.jsx";
import Testimonials from "../components/common/Testimonials.jsx";
import Skeleton from "../components/Skeleton.jsx";

export default function Home() {
  const heroRef = useRef(null);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHome = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    Promise.all([
      api.get("/products/featured/"),
      api.get("/products/?ordering=-sales_count"),
    ]).then(([featuredResponse, trendingResponse]) => {
      setFeatured(Array.isArray(featuredResponse.data) ? featuredResponse.data : (featuredResponse.data?.results || []));
      setTrending(Array.isArray(trendingResponse.data) ? trendingResponse.data : (trendingResponse.data?.results || []));
    }).catch(() => {
      setFeatured([]);
      setTrending([]);
    }).finally(() => setLoading(false));
  }, []);

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
  }, [loadHome]);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return undefined;

    const notifyVisibility = (isVisible) => {
      window.dispatchEvent(new CustomEvent("myshop:hero-visibility", { detail: { isVisible } }));
    };

    const observer = new IntersectionObserver(
      ([entry]) => notifyVisibility(entry.isIntersecting),
      { threshold: 0.08 }
    );

    observer.observe(heroElement);
    notifyVisibility(true);

    return () => {
      observer.disconnect();
      notifyVisibility(true);
    };
  }, []);

  return (
    <>
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <HomeCategoryTiles />
      <PromoBanners />
      {loading ? <section className="section py-12"><Skeleton lines={8} /></section> : (
        <>
          <HomeProductShowcase
            title="Featured Products"
            subtitle="Featured shoes with cleaner PNG visuals and faster checkout."
            products={featured.length ? featured : trending.slice(0, 10)}
          />
          <HomeProductShowcase
            title="Popular Shoes"
            subtitle="Explore the most in-demand sneakers, sandals, and loafers right now."
            products={trending}
          />
          <SeoContentSection />
        </>
      )}
      <Testimonials />
    </>
  );
}

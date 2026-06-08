import { Filter, Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";

const initialFilters = { search: "", category: "", min_price: "", max_price: "", min_rating: "", in_stock: "", featured: "", on_sale: "", ordering: "" };
const priceRanges = [
  ["", "", "All prices"],
  ["0", "1000", "Under Tk.1000"],
  ["1001", "1500", "Tk.1001 - Tk.1500"],
  ["1501", "3000", "Tk.1501 - Tk.3000"],
  ["3001", "5000", "Tk.3001 - Tk.5000"],
  ["5001", "", "Above Tk.5000"],
];
const filterLabels = {
  search: "Search",
  category: "Category",
  min_price: "Min price",
  max_price: "Max price",
  min_rating: "Rating",
  in_stock: "In stock",
  featured: "Featured",
  on_sale: "On sale",
};

function FilterPanel({ categories, filters, setFilters, apply, reset }) {
  return (
    <aside className="grid gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide">Search</label>
        <input className="input" placeholder="Search product" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide">Category</label>
        <div className="grid gap-1">
          <button className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${!filters.category ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilters({ ...filters, category: "" })}>All Products</button>
          {categories.map((category) => (
            <button key={category.id} className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${filters.category === category.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilters({ ...filters, category: category.slug })}>{category.name}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide">Quick filters</label>
        <div className="grid gap-2">
          <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold">
            <span>In stock</span>
            <input type="checkbox" checked={filters.in_stock === "true"} onChange={(e) => setFilters({ ...filters, in_stock: e.target.checked ? "true" : "" })} />
          </label>
          <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold">
            <span>Featured</span>
            <input type="checkbox" checked={filters.featured === "true"} onChange={(e) => setFilters({ ...filters, featured: e.target.checked ? "true" : "" })} />
          </label>
          <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold">
            <span>On sale</span>
            <input type="checkbox" checked={filters.on_sale === "true"} onChange={(e) => setFilters({ ...filters, on_sale: e.target.checked ? "true" : "" })} />
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide">By Price</label>
        <div className="grid gap-1">
          {priceRanges.map(([min, max, label]) => (
            <button key={label} className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${filters.min_price === min && filters.max_price === max ? "bg-muted" : "hover:bg-muted"}`} onClick={() => setFilters({ ...filters, min_price: min, max_price: max })}>{label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide">Rating</label>
        <select className="input" value={filters.min_rating} onChange={(e) => setFilters({ ...filters, min_rating: e.target.value })}>
          <option value="">Any rating</option>
          <option value="4">4 stars & up</option>
          <option value="3">3 stars & up</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={apply}><SlidersHorizontal size={16} /> Apply</Button>
        <Button type="button" variant="outline" onClick={reset}>Reset</Button>
      </div>
    </aside>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);

  const activeFilters = useMemo(() => Object.entries(filters).filter(([key, value]) => value && key !== "ordering"), [filters]);
  const headerLine = useMemo(() => {
    const parts = [];

    if (filters.category) {
      const currentCategory = categories.find((category) => category.slug === filters.category);
      parts.push(currentCategory?.name || filters.category);
    }

    if (filters.search) {
      parts.push(filters.search);
    }

    return parts.length ? parts.join(" / ") : "All products";
  }, [categories, filters.category, filters.search]);

  function syncFromParams() {
    setFilters({
      search: params.get("search") || "",
      category: params.get("category") || "",
      min_price: params.get("min_price") || "",
      max_price: params.get("max_price") || "",
      min_rating: params.get("min_rating") || "",
      in_stock: params.get("in_stock") || "",
      featured: params.get("featured") || "",
      on_sale: params.get("on_sale") || "",
      ordering: params.get("ordering") || "",
    });
  }

  const load = useCallback(async (url = "/products/", append = false, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(debouncedFilters)
            .filter(([, v]) => v)
            .map(([key, value]) => [key === "search" ? "q" : key, value])
        )
      );
      const endpoint = url.includes("?") ? url.replace(api.defaults.baseURL, "") : `${url}?${query.toString()}`;
      const { data } = await api.get(endpoint);
      setProducts((current) => append ? [...current, ...data.results] : data.results);
      setCount(data.count || data.results?.length || 0);
      setNext(data.next);
    } catch (e) {
      setError(e.response?.data?.detail || "Products could not be loaded.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [debouncedFilters]);

  const loadWishlist = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get("/products/wishlist_items/");
      setProducts(data.results || data);
      setCount(data.count || data.results?.length || data.length || 0);
      setNext(data.next || null);
    } catch {
      setError("Login is required to view wishlist.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(() => {
    api.get("/categories/").then(({ data }) => setCategories(data.results || data));
  }, []);

  function apply() {
    const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setParams(query);
    setDebouncedFilters(filters);
    setFiltersOpen(false);
  }

  function reset() {
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
    setParams({});
    setFiltersOpen(false);
  }

  function removeFilter(key) {
    const nextFilters = { ...filters, [key]: "" };
    if (key === "min_price") nextFilters.max_price = "";
    if (key === "max_price") nextFilters.min_price = "";
    setFilters(nextFilters);
  }

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { syncFromParams(); }, [params]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters(filters);
      if (!params.get("wishlist")) {
        const nextQuery = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
        if (nextQuery.toString() !== params.toString()) {
          setParams(nextQuery, { replace: true });
        }
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.search, filters.category, filters.min_price, filters.max_price, filters.min_rating, filters.in_stock, filters.featured, filters.on_sale, filters.ordering]);
  useEffect(() => { params.get("wishlist") ? loadWishlist() : load(); }, [debouncedFilters, params, load, loadWishlist]);

  useEffect(() => {
    const refresh = () => {
      loadCategories();
      params.get("wishlist") ? loadWishlist(false) : load("/products/", false, false);
    };
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
  }, [load, loadCategories, loadWishlist, params]);

  return (
    <section className="bg-background min-h-screen">
      <div className="bg-muted/30 border-b border-border">
        <div className="section py-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Explore Collection</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{headerLine}</h1>
          </div>
        </div>
      </div>

      <div className="section py-12">
        <div className="grid gap-12 xl:grid-cols-[280px_1fr]">
          
          {/* Desktop Filter Panel */}
          <aside className="hidden xl:block">
            <div className="panel sticky top-32 p-6 space-y-8 bg-card/50 backdrop-blur-xl">
              <h2 className="text-xl font-black tracking-tight border-b border-border pb-4">Filter Products</h2>
              <FilterPanel categories={categories} filters={filters} setFilters={setFilters} apply={apply} reset={reset} />
            </div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="mb-8 flex flex-col gap-6 p-6 rounded-[2rem] bg-card border border-border shadow-soft lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3">
                <p className="font-black text-lg tracking-tight">{count} <span className="text-muted-foreground font-bold">Products Found</span></p>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-2 border-border bg-muted/50 text-[10px] font-black uppercase tracking-wider">
                      {filterLabels[key] || key}: {value === "true" ? "Yes" : value}
                      <button 
                        onClick={() => removeFilter(key)} 
                        className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button variant="outline" className="xl:hidden rounded-2xl h-12 px-6" onClick={() => setFiltersOpen(true)}>
                  <Filter size={18} className="mr-2" /> 
                  Filters
                </Button>
                
                <div className="relative flex-1 lg:flex-none">
                  <select 
                    className="w-full lg:w-56 h-12 pl-4 pr-10 rounded-2xl border-2 border-border bg-background font-black text-sm appearance-none focus:border-primary outline-none transition-all" 
                    value={filters.ordering} 
                    onChange={(e) => setFilters({ ...filters, ordering: e.target.value })}
                  >
                    <option value="">Featured</option>
                    <option value="-created_at">Newest Arrivals</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-rating">Top Rated</option>
                  </select>
                  <SlidersHorizontal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl border border-border">
                  <button 
                    onClick={() => setView("grid")}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      view === "grid" ? "bg-white text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid2X2 size={20} />
                  </button>
                  <button 
                    onClick={() => setView("list")}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      view === "list" ? "bg-white text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            <ErrorBox message={error} />

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton lines={12} />
              </div>
            ) : products.length > 0 ? (
              <div className={cn(
                "grid gap-8 transition-all duration-500",
                view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} view={view} onChanged={() => load()} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center rounded-[3rem] border-2 border-dashed border-border">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                  <Search size={32} className="text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">No products found</h2>
                <p className="text-muted-foreground text-lg mb-8">Try adjusting your filters or search keywords.</p>
                <button 
                  onClick={reset}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-neon hover:scale-105 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {next && (
              <div className="mt-16 text-center">
                <button 
                  onClick={() => load(next, true)}
                  className="px-12 py-4 rounded-2xl border-2 border-primary text-primary font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all shadow-premium"
                >
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm xl:hidden">
          <div className="ml-auto h-full w-full max-w-md overflow-y-auto bg-card p-5 shadow-premium sm:w-[82vw]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(false)}><X size={18} /></Button>
            </div>
            <FilterPanel categories={categories} filters={filters} setFilters={setFilters} apply={apply} reset={reset} />
          </div>
        </div>
      )}
    </section>
  );
}

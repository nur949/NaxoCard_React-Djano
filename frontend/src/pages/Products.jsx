import { Filter, Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";

const initialFilters = { search: "", category: "", min_price: "", max_price: "", min_rating: "", ordering: "" };
const quickTerms = ["Power", "Northstar", "Loafer", "Sandal", "Heel", "Casual shoe"];
const priceRanges = [
  ["", "", "All prices"],
  ["0", "1000", "Under Tk.1000"],
  ["1001", "1500", "Tk.1001 - Tk.1500"],
  ["1501", "3000", "Tk.1501 - Tk.3000"],
  ["3001", "5000", "Tk.3001 - Tk.5000"],
  ["5001", "", "Above Tk.5000"],
];

function FilterPanel({ categories, filters, setFilters, apply, reset }) {
  return (
    <aside className="grid gap-5">
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wide">Search</label>
        <input className="input" placeholder="Search product" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wide">Category</label>
        <div className="grid gap-1">
          <button className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${!filters.category ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilters({ ...filters, category: "" })}>All Products</button>
          {categories.map((category) => (
            <button key={category.id} className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${filters.category === category.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilters({ ...filters, category: category.slug })}>{category.name}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wide">By Price</label>
        <div className="grid gap-1">
          {priceRanges.map(([min, max, label]) => (
            <button key={label} className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${filters.min_price === min && filters.max_price === max ? "bg-muted" : "hover:bg-muted"}`} onClick={() => setFilters({ ...filters, min_price: min, max_price: max })}>{label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wide">Rating</label>
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
  const [mobileFilters, setMobileFilters] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);

  const activeFilters = useMemo(() => Object.entries(filters).filter(([key, value]) => value && key !== "ordering"), [filters]);

  function syncFromParams() {
    setFilters({
      search: params.get("search") || "",
      category: params.get("category") || "",
      min_price: params.get("min_price") || "",
      max_price: params.get("max_price") || "",
      min_rating: params.get("min_rating") || "",
      ordering: params.get("ordering") || "",
    });
  }

  const load = useCallback(async (url = "/products/", append = false, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(Object.fromEntries(Object.entries(debouncedFilters).filter(([, v]) => v)));
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
    setMobileFilters(false);
  }

  function reset() {
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
    setParams({});
    setMobileFilters(false);
  }

  function removeFilter(key) {
    const nextFilters = { ...filters, [key]: "" };
    if (key === "min_price") nextFilters.max_price = "";
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
  }, [filters.search, filters.category, filters.min_price, filters.max_price, filters.min_rating, filters.ordering]);
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
    <section>
      <div className="border-b bg-muted/50">
        <div className="section py-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Popular Products</p>
              <h1 className="mt-2 text-4xl font-black">Shop footwear and accessories</h1>
              <p className="mt-2 text-muted-foreground">Find best sellers, new arrivals, and everyday essentials faster.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickTerms.map((term) => <Button key={term} variant="outline" size="sm" onClick={() => setFilters({ ...filters, search: term })}>{term}</Button>)}
            </div>
          </div>
        </div>
      </div>

      <div className="section py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <div className="panel sticky top-44 p-5">
              <FilterPanel categories={categories} filters={filters} setFilters={setFilters} apply={apply} reset={reset} />
            </div>
          </div>

          <div>
            <div className="mb-5 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{count} products</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeFilters.map(([key, value]) => (
                    <Badge key={key} variant="outline" className="gap-1">
                      {key.replace("_", " ")}: {value}
                      <button onClick={() => removeFilter(key)} aria-label={`Remove ${key}`}><X size={12} /></button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}><Filter size={16} /> Filters</Button>
                <select className="input w-44" value={filters.ordering} onChange={(e) => setFilters({ ...filters, ordering: e.target.value })}>
                  <option value="">Featured</option>
                  <option value="-created_at">Newest</option>
                  <option value="price">Price low to high</option>
                  <option value="-price">Price high to low</option>
                  <option value="-rating">Top rated</option>
                </select>
                <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={18} /></Button>
                <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")} aria-label="List view"><List size={18} /></Button>
              </div>
            </div>

            <ErrorBox message={error} />
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"><Skeleton lines={12} /></div>
            ) : products.length > 0 ? (
              <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-5"}>
                {products.map((product) => <ProductCard key={product.id} product={product} view={view} onChanged={() => load()} />)}
              </div>
            ) : (
              <div className="panel p-10 text-center">
                <h2 className="text-2xl">No products found</h2>
                <p className="mt-2 text-muted-foreground">Try another category, keyword, or price range.</p>
                <Button className="mt-5" onClick={reset}>Clear filters</Button>
              </div>
            )}
            {next && <div className="mt-8 text-center"><Button variant="outline" onClick={() => load(next, true)}>Load more</Button></div>}
          </div>
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-foreground/40 lg:hidden">
          <div className="ml-auto h-full w-[88vw] max-w-sm overflow-y-auto bg-card p-5 shadow-premium">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFilters(false)}><X size={18} /></Button>
            </div>
            <FilterPanel categories={categories} filters={filters} setFilters={setFilters} apply={apply} reset={reset} />
          </div>
        </div>
      )}
    </section>
  );
}

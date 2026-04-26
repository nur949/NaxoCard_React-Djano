import { Clock3, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { mediaUrl } from "../../api/client.js";
import { Button } from "../ui/button.jsx";

export default function SearchBox({ compact = false, autoFocus = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem("recentSearches") || "[]"));
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const closeTimer = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const trimmedQuery = query.trim();
  const showRecent = focused && trimmedQuery.length === 0 && recent.length > 0;
  const showSuggestions = focused && trimmedQuery.length >= 2;
  const visibleItems = useMemo(() => {
    if (showSuggestions) return suggestions;
    if (showRecent) return recent.map((term) => ({ name: term, slug: "", recent: true }));
    return [];
  }, [showSuggestions, showRecent, suggestions, recent]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (trimmedQuery.length < 2) {
        setSuggestions([]);
        setLoading(false);
        setError("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/products/suggest/?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal });
        setSuggestions(data);
        setActive(-1);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setSuggestions([]);
          setError("Search suggestions unavailable.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  function openSearch() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setFocused(true);
  }

  function closeSearch() {
    closeTimer.current = window.setTimeout(() => {
      setFocused(false);
      setActive(-1);
    }, 120);
  }

  function submit(term = query) {
    const value = term.trim();
    if (!value) return;
    const nextRecent = [value, ...recent.filter((item) => item !== value)].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(nextRecent));
    setRecent(nextRecent);
    setQuery("");
    setFocused(false);
    navigate(`/products?search=${encodeURIComponent(value)}`);
  }

  function openProduct(item) {
    if (!item?.slug) {
      submit(item?.name || query);
      return;
    }
    const nextRecent = [item.name, ...recent.filter((term) => term !== item.name)].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(nextRecent));
    setRecent(nextRecent);
    setQuery("");
    setFocused(false);
    navigate(`/products/${item.slug}`);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      setFocused(false);
      setActive(-1);
      return;
    }
    if (!visibleItems.length && event.key !== "Enter") return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, visibleItems.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = visibleItems[active];
      item ? openProduct(item) : submit(query);
    }
  }

  return (
    <div className={compact ? "relative w-full" : "relative w-80"}>
      <form className="relative" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          ref={inputRef}
          className="input h-10 pl-9 pr-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={openSearch}
          onBlur={closeSearch}
          onKeyDown={onKeyDown}
          placeholder="Search products"
          aria-label="Search products"
          role="combobox"
          aria-expanded={focused && (visibleItems.length > 0 || loading || Boolean(error))}
          aria-controls="product-search-results"
          autoComplete="off"
        />
        {query && <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onMouseDown={(event) => event.preventDefault()} onClick={() => { setQuery(""); setSuggestions([]); setError(""); }} aria-label="Clear search"><X size={14} /></Button>}
      </form>
      {focused && (visibleItems.length > 0 || loading || error || (showSuggestions && !loading)) && (
        <div id="product-search-results" role="listbox" className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-premium">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{showSuggestions ? "Product suggestions" : "Recent searches"}</span>
            {loading && <Loader2 className="animate-spin text-muted-foreground" size={15} />}
          </div>
          {error && <div className="px-3 py-3 text-sm font-medium text-destructive">{error}</div>}
          {!error && showSuggestions && !loading && suggestions.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground">No products found for "{trimmedQuery}".</div>
          )}
          {!error && visibleItems.map((item, index) => (
            item.slug ? (
              <Link
                key={item.slug}
                to={`/products/${item.slug}`}
                role="option"
                aria-selected={active === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openProduct(item)}
                className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 px-3 py-3 text-sm transition-colors hover:bg-muted ${active === index ? "bg-muted" : ""}`}
              >
                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                  <img src={mediaUrl(item.image)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.category || "Product"}</p>
                </div>
                <span className="text-sm font-black text-primary">Tk {item.price}</span>
              </Link>
            ) : (
              <button
                key={item.name}
                type="button"
                role="option"
                aria-selected={active === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submit(item.name)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold hover:bg-muted ${active === index ? "bg-muted" : ""}`}
              >
                <Clock3 size={14} className="text-muted-foreground" />
                {item.name}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

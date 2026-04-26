import { ChevronRight, Footprints, Heart, Home, LayoutDashboard, Menu, Package, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Footer from "./common/Footer.jsx";
import MegaNav from "./common/MegaNav.jsx";
import MiniCartDrawer from "./common/MiniCartDrawer.jsx";
import SearchBox from "./common/SearchBox.jsx";
import UserMenu from "./common/UserMenu.jsx";
import WhatsAppButton from "./common/WhatsAppButton.jsx";
import { Button } from "./ui/button.jsx";

const primaryNav = [
  ["Home", "/"],
  ["About Us", "/products?search=about"],
  ["Shop", "/products"],
  ["Contact", "/contact"],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { count, setDrawerOpen } = useCart();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const heroMode = isHome && !scrolled;
  const showSecondaryNav = scrolled;
  const hidePrimaryHeader = showSecondaryNav;

  useEffect(() => {
    function onScroll() {
      setScrolled((current) => {
        const nextY = window.scrollY;
        return current ? nextY > 24 : nextY > 60;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open || searchOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open, searchOpen]);

  const navTone = useMemo(
    () =>
      heroMode
        ? {
            header: "bg-background/82 text-foreground shadow-none backdrop-blur-xl border-b border-slate-200/70",
            link: "text-foreground/80 hover:text-primary",
            iconButton: "border-slate-200 bg-white/92 text-foreground hover:bg-slate-50",
            mobile: "border-slate-800/90 bg-[linear-gradient(180deg,rgba(8,15,29,0.99),rgba(15,23,42,0.98))] text-slate-50",
            logo: "text-primary",
          }
        : {
            header: "bg-background/92 text-foreground shadow-sm backdrop-blur-xl border-b border-border/60",
            link: "text-foreground/80 hover:text-primary",
            iconButton: "border-border bg-background text-foreground hover:bg-muted",
            mobile: "border-slate-800/90 bg-[linear-gradient(180deg,rgba(8,15,29,0.99),rgba(15,23,42,0.98))] text-slate-50",
            logo: "text-primary",
          },
    [heroMode]
  );

  const mobileChrome = {
    shell: "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,252,0.96))] text-slate-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)]",
    tile: "border-slate-200/90 bg-white/95 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:bg-slate-50 hover:text-slate-950",
    search: "border-slate-200/90 bg-white text-slate-500 hover:bg-slate-50",
    bottomShell: "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.95))] shadow-[0_18px_46px_rgba(15,23,42,0.16)]",
    bottomItem: "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
    bottomItemActive: "bg-sky-50 text-sky-700",
    homeActive: "bg-[linear-gradient(180deg,#2563eb,#1d4ed8)] text-white shadow-[0_12px_30px_rgba(37,99,235,0.32)]",
    homeIdle: "bg-[linear-gradient(180deg,#0f172a,#1e293b)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] hover:bg-[linear-gradient(180deg,#2563eb,#1d4ed8)]",
  };

  const mobileBottomNav = [
    { label: "Shop", to: "/products", icon: ShoppingBag },
    { label: "Home", to: "/", icon: Home, center: true },
  ];

  return (
    <div className="min-h-screen">
      <header className={`fixed inset-x-0 top-0 z-40 transition-[transform,opacity,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${hidePrimaryHeader ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"} ${navTone.header}`}>
        <div className="section flex min-h-[4.5rem] items-center justify-between gap-3 py-3 sm:min-h-24 sm:gap-4 sm:py-4">
          <Link to="/" className={`flex min-w-0 items-center gap-2 text-2xl font-black tracking-tight sm:gap-3 sm:text-3xl ${navTone.logo}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/12 backdrop-blur hero-safe-icon sm:h-11 sm:w-11">
              <Footprints size={20} />
            </span>
            <span className="truncate text-[1.35rem] leading-none sm:text-[2rem]">NaxoCard</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {primaryNav.map(([label, to]) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-black uppercase tracking-[0.12em] transition-colors ${navTone.link} ${isActive && !heroMode ? "text-primary" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="icon" className={navTone.iconButton} title="Search">
              <Search size={18} />
            </Button>
            <Button asChild variant="outline" size="icon" className={navTone.iconButton} title="Wishlist">
              <Link to="/products?wishlist=1"><Heart size={18} /></Link>
            </Button>
            <Button variant="outline" size="icon" className={`${navTone.iconButton} relative`} title="Cart" onClick={() => setDrawerOpen(true)}>
              <ShoppingCart size={18} />
              {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{count}</span>}
            </Button>
            {user ? (
              <UserMenu>
                <Button variant="outline" size="icon" className={navTone.iconButton} title="Profile">
                  <User size={18} />
                </Button>
              </UserMenu>
            ) : (
              <Link className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-bold transition ${heroMode ? "bg-white/14 text-white hover:bg-white/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`} to="/auth">
                Login
              </Link>
            )}
          </div>

          <button className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border md:hidden ${navTone.iconButton}`} onClick={() => setOpen((current) => !current)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </header>

      <div className={`fixed inset-x-0 top-0 z-40 border-b px-3 py-2.5 backdrop-blur-xl transition-all duration-300 md:hidden ${mobileChrome.shell}`}>
        <div className="mx-auto flex max-w-[1380px] items-center gap-2.5">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2 text-primary">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/8">
              <Footprints size={18} />
            </span>
            <span className="text-[1.05rem] font-black leading-none text-primary">NaxoCard</span>
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={`flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full border px-3 text-left text-sm font-semibold transition ${mobileChrome.search}`}
            aria-label="Open search"
          >
            <Search size={16} />
            <span className="truncate">Search products</span>
          </button>
          <button
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${mobileChrome.tile}`}
            onClick={() => {
              setSearchOpen(false);
              setOpen(true);
            }}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/78 backdrop-blur-md"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />

          <aside className={`absolute inset-y-0 right-0 flex w-full max-w-[22rem] flex-col overflow-hidden border-l shadow-[0_24px_80px_rgba(2,6,23,0.52)] ${navTone.mobile}`}>
            <div className="relative overflow-hidden border-b border-white/10 px-4 py-3">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95)),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)]" />
              <div className="relative flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-3 text-white" onClick={() => setOpen(false)}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/16 bg-white/10 backdrop-blur">
                    <Footprints size={20} />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Navigation</p>
                    <p className="text-2xl font-black leading-none text-white">NaxoCard</p>
                  </div>
                </Link>

                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/14 bg-white/8 text-white transition hover:bg-white/14"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Quick action</p>
                <div className="mt-3 flex flex-col items-start gap-3">
                  <div>
                    <p className="text-lg font-black text-white">Shop new arrivals</p>
                    <p className="mt-1 text-sm text-slate-300">Jump straight into the latest drop.</p>
                  </div>
                  <Link
                    to="/products"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950"
                  >
                    Buy now
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Main menu</p>
                <div className="mt-3 grid gap-2">
                  {primaryNav.map(([label, to]) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/7 px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-slate-100 transition hover:bg-white/12"
                    >
                      <span>{label}</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Shopping</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link
                    to="/products?wishlist=1"
                    onClick={() => setOpen(false)}
                    className="rounded-[1rem] border border-white/10 bg-white/7 p-3 transition hover:bg-white/12"
                  >
                    <Heart size={16} className="text-white" />
                    <p className="mt-2.5 text-xs font-black uppercase tracking-[0.1em] text-slate-100">Wishlist</p>
                  </Link>
                  <button
                    className="rounded-[1rem] border border-white/10 bg-white/7 p-3 text-left transition hover:bg-white/12"
                    onClick={() => {
                      setOpen(false);
                      setDrawerOpen(true);
                    }}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <ShoppingCart size={16} className="text-white" />
                      {count > 0 ? <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-black text-accent-foreground">{count}</span> : null}
                    </div>
                    <p className="mt-2.5 text-xs font-black uppercase tracking-[0.1em] text-slate-100">Cart</p>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Account</p>
                <div className="mt-3 grid gap-2">
                  <Link
                    to={user ? "/profile" : "/auth"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/7 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-slate-100 transition hover:bg-white/12"
                  >
                    <span className="flex items-center gap-3"><User size={16} /> {user ? "Profile" : "Login"}</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>

                  {user ? (
                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/7 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-slate-100 transition hover:bg-white/12"
                    >
                      <span className="flex items-center gap-3"><Package size={16} /> Orders</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </Link>
                  ) : null}

                  {user?.is_staff ? (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/7 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-slate-100 transition hover:bg-white/12"
                    >
                      <span className="flex items-center gap-3"><LayoutDashboard size={16} /> Admin panel</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/78 backdrop-blur-md"
            aria-label="Close search overlay"
            onClick={() => setSearchOpen(false)}
          />
          <div className={`absolute inset-x-0 top-0 rounded-b-[2rem] border-b px-4 pb-4 pt-3 backdrop-blur-xl ${mobileChrome.shell}`}>
            <div className="mx-auto max-w-[1380px]">
              <div className="flex items-center gap-3">
                <button
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] border transition ${mobileChrome.tile}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setOpen(true);
                  }}
                  aria-label="Open menu"
                  type="button"
                >
                  <Menu size={20} />
                </button>
                <div className="min-w-0 flex-1">
                  <SearchBox compact autoFocus />
                </div>
                <button
                  className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] border transition ${mobileChrome.tile}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setDrawerOpen(true);
                  }}
                  aria-label="Open cart"
                  type="button"
                >
                  <ShoppingCart size={18} />
                  {count > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-black text-accent-foreground">{count}</span> : null}
                </button>
                <button
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] border transition ${mobileChrome.tile}`}
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`pointer-events-none fixed inset-x-0 top-0 z-30 hidden transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${showSecondaryNav ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}>
        <div className="pointer-events-auto">
          <MegaNav />
        </div>
      </div>
      {showSecondaryNav ? <div className="hidden h-12 lg:block" /> : null}
      <main className={`${isHome ? "pt-[4.5rem]" : "pt-[4.5rem] sm:pt-24"} pb-20 md:pb-0`}>
        <Outlet />
      </main>

      <div className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-all duration-300 md:hidden ${scrolled && !open && !searchOpen ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}>
        <div className={`mx-auto flex max-w-sm items-center justify-between rounded-[1.45rem] border px-2 py-2 backdrop-blur-xl ${mobileChrome.bottomShell}`}>
          {mobileBottomNav.map(({ label, to, icon: Icon, center }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                  center
                    ? isActive
                      ? `-mt-5 rounded-[1.1rem] px-3 py-2.5 ${mobileChrome.homeActive}`
                      : `-mt-5 rounded-[1.1rem] px-3 py-2.5 ${mobileChrome.homeIdle}`
                    : isActive
                      ? `rounded-[1.05rem] ${mobileChrome.bottomItemActive}`
                      : `rounded-[1.05rem] ${mobileChrome.bottomItem}`
                }`
              }
            >
              <Icon size={center ? 18 : 18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`relative flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-[1.05rem] px-2 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${mobileChrome.bottomItem}`}
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {count > 0 ? <span className="absolute right-3 top-2 rounded-full bg-accent px-1.5 text-[10px] font-black text-accent-foreground">{count}</span> : null}
          </button>
        </div>
      </div>
      <MiniCartDrawer />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

import { ChevronRight, Footprints, Heart, LayoutDashboard, Menu, Package, Search, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Footer from "./common/Footer.jsx";
import MegaNav from "./common/MegaNav.jsx";
import MiniCartDrawer from "./common/MiniCartDrawer.jsx";
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
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  const navTone = useMemo(
    () =>
      heroMode
        ? {
            header: "bg-transparent text-white shadow-none",
            link: "text-white/90 hover:text-white",
            iconButton: "border-white/20 bg-white/8 text-white hover:bg-white/14",
            mobile: "bg-slate-950/92 text-white border-white/10",
            logo: "text-white",
          }
        : {
            header: "bg-background/92 text-foreground shadow-sm backdrop-blur-xl border-b border-border/60",
            link: "text-foreground/80 hover:text-primary",
            iconButton: "border-border bg-background text-foreground hover:bg-muted",
            mobile: "border-white/10 bg-slate-950/92 text-white",
            logo: "text-primary",
          },
    [heroMode]
  );

  return (
    <div className="min-h-screen">
      <header className={`fixed inset-x-0 top-0 z-40 transition-[transform,opacity,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${hidePrimaryHeader ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"} ${navTone.header}`}>
        <div className="section flex min-h-[5rem] items-center justify-between gap-3 py-3 sm:min-h-24 sm:gap-4 sm:py-4">
          <Link to="/" className={`flex min-w-0 items-center gap-2.5 text-2xl font-black tracking-tight sm:gap-3 sm:text-3xl ${navTone.logo}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/12 backdrop-blur hero-safe-icon sm:h-11 sm:w-11">
              <Footprints size={20} />
            </span>
            <span className="truncate text-[1.6rem] leading-none sm:text-[2rem]">NaxoCard</span>
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

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/58 backdrop-blur-sm"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />

          <aside className={`absolute inset-y-0 right-0 flex w-full max-w-[24rem] flex-col overflow-hidden border-l shadow-[0_24px_80px_rgba(2,6,23,0.4)] ${navTone.mobile}`}>
            <div className="relative overflow-hidden border-b border-white/10 px-4 py-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%)]" />
              <div className="relative flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-3 text-white" onClick={() => setOpen(false)}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                    <Footprints size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">Navigation</p>
                    <p className="text-3xl font-black leading-none">NaxoCard</p>
                  </div>
                </Link>

                <button
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/16"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  type="button"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">Quick action</p>
                <div className="mt-3 flex flex-col items-start gap-3">
                  <div>
                    <p className="text-xl font-black">Shop new arrivals</p>
                    <p className="mt-1 text-sm text-white/65">Jump straight into the latest drop.</p>
                  </div>
                  <Link
                    to="/products"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950"
                  >
                    Buy now
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-xs font-black uppercase tracking-[0.24em] text-white/45">Main menu</p>
                <div className="mt-3 grid gap-2">
                  {primaryNav.map(([label, to]) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                    >
                      <span>{label}</span>
                      <ChevronRight size={18} className="text-white/55" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-xs font-black uppercase tracking-[0.24em] text-white/45">Shopping</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link
                    to="/products?wishlist=1"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/6 p-4 transition hover:bg-white/12"
                  >
                    <Heart size={18} className="text-white" />
                    <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-white">Wishlist</p>
                  </Link>
                  <button
                    className="rounded-2xl border border-white/10 bg-white/6 p-4 text-left transition hover:bg-white/12"
                    onClick={() => {
                      setOpen(false);
                      setDrawerOpen(true);
                    }}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <ShoppingCart size={18} className="text-white" />
                      {count > 0 ? <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-black text-accent-foreground">{count}</span> : null}
                    </div>
                    <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-white">Cart</p>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-xs font-black uppercase tracking-[0.24em] text-white/45">Account</p>
                <div className="mt-3 grid gap-2">
                  <Link
                    to={user ? "/profile" : "/auth"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                  >
                    <span className="flex items-center gap-3"><User size={17} /> {user ? "Profile" : "Login"}</span>
                    <ChevronRight size={18} className="text-white/55" />
                  </Link>

                  {user ? (
                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                    >
                      <span className="flex items-center gap-3"><Package size={17} /> Orders</span>
                      <ChevronRight size={18} className="text-white/55" />
                    </Link>
                  ) : null}

                  {user?.is_staff ? (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                    >
                      <span className="flex items-center gap-3"><LayoutDashboard size={17} /> Admin panel</span>
                      <ChevronRight size={18} className="text-white/55" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className={`pointer-events-none fixed inset-x-0 top-0 z-30 hidden transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${showSecondaryNav ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}>
        <div className="pointer-events-auto">
          <MegaNav />
        </div>
      </div>
      {showSecondaryNav ? <div className="hidden h-12 lg:block" /> : null}
      <main className={isHome ? "" : "pt-24"}>
        <Outlet />
      </main>
      <MiniCartDrawer />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

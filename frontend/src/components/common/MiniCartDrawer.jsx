import { ArrowRight, Minus, Plus, ShoppingBag, ShieldCheck, Sparkles, Trash2, Truck, X } from "lucide-react";
import { Link } from "react-router-dom";
import { productImage } from "../../api/client.js";
import { useCart } from "../../context/CartContext.jsx";
import { Button } from "../ui/button.jsx";

export default function MiniCartDrawer() {
  const { cart, count, drawerOpen, setDrawerOpen, update, remove, clear } = useCart();
  const freeShippingThreshold = 5000;
  const cartTotal = Number(cart.total || 0);
  const progress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  const amountLeft = Math.max(0, freeShippingThreshold - cartTotal).toFixed(2);

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-sm transition-opacity ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-[71] flex h-dvh w-full max-w-[352px] flex-col bg-card shadow-premium transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Mini cart"
      >
        <div className="border-b bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Mini Cart</h2>
              <p className="text-sm text-muted-foreground">{count} item{count === 1 ? "" : "s"} ready</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close cart">
              <X size={18} />
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <Truck size={15} className="text-primary" /> Free shipping progress
              </span>
              <span className="font-bold text-slate-900">Tk {cart.total}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {cartTotal >= freeShippingThreshold
                ? "You unlocked free shipping on this order."
                : `Add Tk ${amountLeft} more to reach free shipping.`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Cart Items</span>
          {cart.items.length > 0 ? (
            <button
              type="button"
              className="text-[11px] font-bold tracking-[0.18em] text-destructive transition hover:opacity-80"
              onClick={clear}
            >
              Clear All
            </button>
          ) : (
            <span>Quick Edit</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cart.items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div className="max-w-[240px]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                  <ShoppingBag size={30} />
                </div>
                <p className="mt-4 text-lg font-bold">Your cart is empty.</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Add your favorite shoes or accessories and they will appear here instantly.
                </p>
                <Button asChild className="mt-5 rounded-full px-5">
                  <Link to="/products" onClick={() => setDrawerOpen(false)}>
                    Start shopping
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-start gap-3">
                    <img
                      className="h-16 w-16 rounded-xl bg-slate-50 object-contain"
                      src={productImage(item.product, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80")}
                      alt={item.product.name}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.product.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="line-clamp-2 text-sm font-bold leading-6 hover:text-primary"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">Unit price: Tk {item.product.price}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => update(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity">
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => update(item.id, Math.min(item.product.stock, item.quantity + 1))} aria-label="Increase quantity">
                            <Plus size={14} />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => remove(item.id)} aria-label="Remove item">
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                    <strong className="text-sm font-black text-slate-900">Tk {item.subtotal}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <ShieldCheck size={15} className="text-primary" /> Secure checkout
              </span>
              <span className="font-bold text-slate-900">COD available</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-black">
              <span>Total</span>
              <span className="text-primary">Tk {cart.total}</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs leading-6 text-muted-foreground">
              <Sparkles size={14} className="text-primary" /> Review cart items, then continue to checkout when ready.
            </p>
          </div>

          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" className="h-11 rounded-full" onClick={() => setDrawerOpen(false)}>
              <Link to="/cart">View cart</Link>
            </Button>
            <Button asChild className="h-11 rounded-full" onClick={() => setDrawerOpen(false)}>
              <Link to="/checkout">
                Checkout <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { productImage } from "../../api/client.js";
import { useCart } from "../../context/CartContext.jsx";
import { Button } from "../ui/button.jsx";

export default function MiniCartDrawer() {
  const { cart, count, drawerOpen, setDrawerOpen, update, remove } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-sm transition-opacity ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`fixed right-0 top-0 z-[71] flex h-dvh w-full max-w-md flex-col bg-card shadow-premium transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`} aria-label="Mini cart">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-black">Shopping Cart</h2>
            <p className="text-sm text-muted-foreground">{count} item{count === 1 ? "" : "s"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close cart"><X size={18} /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto text-primary" size={42} />
                <p className="mt-4 font-bold">Your cart is empty.</p>
                <p className="mt-1 text-sm text-muted-foreground">Add something you like and it appears here instantly.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <div key={item.id} className="animate-fade-in rounded-lg border p-3">
                  <div className="flex gap-3">
                    <img className="h-20 w-20 rounded-md bg-white object-contain" src={productImage(item.product, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80")} alt={item.product.name} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/products/${item.product.slug}`} onClick={() => setDrawerOpen(false)} className="line-clamp-1 font-bold hover:text-primary">{item.product.name}</Link>
                      <p className="text-sm text-muted-foreground">Tk {item.product.price}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex h-9 items-center rounded-md border">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => update(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity"><Minus size={14} /></Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => update(item.id, Math.min(item.product.stock, item.quantity + 1))} aria-label="Increase quantity"><Plus size={14} /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(item.id)} aria-label="Remove item"><Trash2 size={15} /></Button>
                      </div>
                    </div>
                    <strong>Tk {item.subtotal}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="mb-4 flex items-center justify-between text-lg font-black">
            <span>Total</span>
            <span className="text-primary">Tk {cart.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" onClick={() => setDrawerOpen(false)}><Link to="/cart">View Cart</Link></Button>
            <Button asChild onClick={() => setDrawerOpen(false)}><Link to="/checkout">Checkout</Link></Button>
          </div>
        </div>
      </aside>
    </>
  );
}

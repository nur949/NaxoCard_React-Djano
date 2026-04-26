import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { productImage } from "../api/client.js";
import CartSummary from "../components/common/CartSummary.jsx";
import CheckoutSteps from "../components/common/CheckoutSteps.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { cart, update, remove } = useCart();
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="section py-8">
      <CheckoutSteps active={1} />
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Shopping Cart</p>
          <h1 className="mt-2 text-[2.1rem] font-black sm:text-4xl">Review your bag</h1>
          <p className="mt-2 text-muted-foreground">{itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout.</p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/products"><ShoppingBag size={17} /> Continue shopping</Link></Button>
      </div>

      {cart.items.length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center gap-4 p-12 text-center">
            <ShoppingBag className="text-primary" size={42} />
            <div>
              <h2 className="text-2xl">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground">Add best sellers or new arrivals before checkout.</p>
            </div>
            <Button asChild><Link to="/products">Shop now</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="grid gap-4 p-4 md:grid-cols-[110px_1fr] xl:grid-cols-[120px_1fr_auto] md:items-center">
                  <Link to={`/products/${item.product.slug}`} className="overflow-hidden rounded-md bg-muted">
                    <img className="h-32 w-full bg-white object-contain transition-transform duration-300 hover:scale-[1.02] sm:h-28" src={productImage(item.product, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80")} alt={item.product.name} />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{item.product.category?.name || "MyShop"}</p>
                    <Link to={`/products/${item.product.slug}`} className="mt-1 block text-lg font-bold hover:text-primary">{item.product.name}</Link>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.product.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex h-10 items-center rounded-md border">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => update(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity"><Minus size={15} /></Button>
                        <input className="h-9 w-12 bg-transparent text-center text-sm font-bold outline-none" type="number" min="1" max={item.product.stock} value={item.quantity} onChange={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next) && next >= 1) update(item.id, Math.min(item.product.stock, next));
                        }} />
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => update(item.id, Math.min(item.product.stock, item.quantity + 1))} aria-label="Increase quantity"><Plus size={15} /></Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => remove(item.id)}><Trash2 size={16} /> Remove</Button>
                    </div>
                    <div className="mt-4 md:hidden">
                      <p className="text-sm text-muted-foreground">Tk {item.product.price} each</p>
                      <strong className="text-xl text-primary">Tk {item.subtotal}</strong>
                    </div>
                  </div>
                  <div className="hidden text-right xl:block">
                    <p className="text-sm text-muted-foreground">Tk {item.product.price} each</p>
                    <strong className="text-xl text-primary">Tk {item.subtotal}</strong>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <CartSummary total={cart.total} itemCount={itemCount} disabled={cart.items.length === 0} />
        </div>
      )}
    </section>
  );
}

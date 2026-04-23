import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { Button } from "../ui/button.jsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu.jsx";

export default function CartPreview({ children }) {
  const { cart } = useCart();
  const items = cart.items.slice(0, 4);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <div className="mb-3 flex items-center justify-between">
          <strong>Cart preview</strong>
          <span className="text-sm text-muted-foreground">Tk {cart.total}</span>
        </div>
        <div className="grid gap-2">
          {items.length === 0 && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 rounded-md p-2 hover:bg-muted">
              <div>
                <p className="line-clamp-1 text-sm font-semibold">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-bold">Tk {item.subtotal}</span>
            </div>
          ))}
        </div>
        <Button asChild className="mt-3 w-full"><Link to="/cart">View cart</Link></Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

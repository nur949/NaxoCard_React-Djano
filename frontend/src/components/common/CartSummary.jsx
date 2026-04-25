import { Link } from "react-router-dom";
import { ShieldCheck, Truck } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";

export default function CartSummary({ total = "0.00", itemCount = 0, disabled = false }) {
  const subtotal = Number(total || 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const estimatedTotal = (subtotal + shipping).toFixed(2);

  return (
    <Card className="h-fit lg:sticky lg:top-44">
      <CardHeader>
        <CardTitle className="text-lg">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{itemCount}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Tk {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `Tk ${shipping.toFixed(2)}`}</span></div>
        </div>
        <div className="flex justify-between border-t pt-4 text-lg font-black">
          <span>Total</span>
          <span className="text-primary">Tk {estimatedTotal}</span>
        </div>
        <Button asChild className="w-full" aria-disabled={disabled}>
          <Link to={disabled ? "/cart" : "/checkout"}>Proceed to checkout</Link>
        </Button>
        <div className="grid gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><Truck size={15} /> Free delivery estimate at checkout</span>
          <span className="flex items-center gap-2"><ShieldCheck size={15} /> Guest checkout and cash on delivery available</span>
        </div>
      </CardContent>
    </Card>
  );
}

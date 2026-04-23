import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrderConfirmation() {
  return (
    <section className="section flex min-h-[60vh] items-center justify-center py-10">
      <div className="panel max-w-xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-primary" size={56} />
        <h1 className="mt-5 text-3xl font-black">Order confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Your order has been placed successfully. You can track the latest status from your orders page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" to="/orders">View orders</Link>
          <Link className="btn-ghost" to="/products">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}

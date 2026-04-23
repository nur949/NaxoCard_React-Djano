import { useCallback, useEffect, useState } from "react";
import api from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import Skeleton from "../components/Skeleton.jsx";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    api.get("/orders/")
      .then(({ data }) => setOrders(data.results || data))
      .catch(() => setError("Orders could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    const refresh = () => loadOrders(false);
    const onMutation = (event) => {
      const url = event.detail?.url || "";
      if (url.startsWith("/orders") || url.startsWith("/checkout")) refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("myshop:api-mutated", onMutation);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("myshop:api-mutated", onMutation);
    };
  }, [loadOrders]);

  return (
    <section className="section py-8">
      <h1 className="mb-6 text-3xl font-black">Order history</h1>
      <ErrorBox message={error} />
      {loading ? <Skeleton lines={8} /> : <div className="grid gap-4">{orders.map((o) => <article className="panel p-5" key={o.id}><div className="flex flex-wrap justify-between gap-3"><h2 className="font-black">Order #{o.id}</h2><span className="rounded-full bg-muted px-3 py-1 text-sm font-bold capitalize">{o.status}</span><strong>Tk {o.total}</strong></div><div className="mt-4 grid gap-2">{o.items.map((i) => <div className="flex justify-between text-sm" key={i.id}><span>{i.product_name} x {i.quantity}</span><span>Tk {i.subtotal}</span></div>)}</div></article>)}</div>}
    </section>
  );
}

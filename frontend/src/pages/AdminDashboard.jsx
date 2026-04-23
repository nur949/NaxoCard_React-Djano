import { Award, Edit, Plus, RotateCcw, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";

const emptyProduct = { name: "", slug: "", category_id: "", price: "", stock: 0, description: "", rating: "0.00", is_active: true, image_file: null };

export default function AdminDashboard() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [trash, setTrash] = useState({ products: [], orders: [], categories: [] });
  const [userSearch, setUserSearch] = useState("");
  const [pointAdjust, setPointAdjust] = useState({ userId: "", points: "", description: "" });
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  async function load() {
    const [p, c, o, u, tp, to, tc] = await Promise.all([
      api.get("/products/"),
      api.get("/categories/"),
      api.get("/orders/"),
      api.get("/admin/users/"),
      api.get("/products/trash/"),
      api.get("/orders/trash/"),
      api.get("/categories/trash/"),
    ]);
    setProducts(p.data.results || p.data); setCategories(c.data.results || c.data); setOrders(o.data.results || o.data); setUsers(u.data.results || u.data);
    setTrash({ products: tp.data.results || tp.data, orders: to.data.results || to.data, categories: tc.data.results || tc.data });
  }
  useEffect(() => { load().catch(() => setError("Admin data could not be loaded.")); }, []);
  async function saveProduct(e) {
    e.preventDefault(); setError("");
    try {
      const payload = new FormData();
      ["name", "slug", "price", "stock", "description", "rating", "is_active"].forEach((key) => payload.append(key, form[key]));
      if (form.category_id) payload.append("category_id", form.category_id);
      if (form.image_file) payload.append("image", form.image_file);
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editing) await api.patch(`/products/${editing}/`, payload, config);
      else await api.post("/products/", payload, config);
      setForm(emptyProduct); setEditing(null); await load();
    } catch (e) { setError("Product save failed. Check slug uniqueness and required fields."); }
  }
  async function removeProduct(slug) { await api.delete(`/products/${slug}/`); await load(); }
  async function updateOrder(id, status) { await api.patch(`/orders/${id}/`, { status }); await load(); }
  async function removeOrder(id) { await api.delete(`/orders/${id}/`); await load(); }
  async function restoreProduct(slug) { await api.post(`/products/${slug}/restore/`); await load(); }
  async function restoreOrder(id) { await api.post(`/orders/${id}/restore/`); await load(); }
  async function restoreCategory(slug) { await api.post(`/categories/${slug}/restore/`); await load(); }
  async function cleanTrash(type) { await api.delete(`/${type}/clean_trash/`); await load(); }
  async function updateUser(id, payload) { await api.patch(`/admin/users/${id}/`, payload); await load(); }
  async function adjustPoints(e) {
    e.preventDefault(); setError("");
    try {
      await api.post(`/admin/users/${pointAdjust.userId}/adjust_points/`, { points: Number(pointAdjust.points), description: pointAdjust.description });
      setPointAdjust({ userId: "", points: "", description: "" });
      await load();
    } catch {
      setError("Point adjustment failed.");
    }
  }
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0).toFixed(2);
  const lowStock = products.filter((product) => product.stock <= 5);
  const paidOrders = orders.filter((order) => ["paid", "processing", "shipped", "delivered"].includes(order.status)).length;
  const filteredUsers = users.filter((item) => `${item.username} ${item.email} ${item.phone || ""}`.toLowerCase().includes(userSearch.toLowerCase()));
  return (
    <section className="section py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Admin dashboard</h1><div className="flex flex-wrap gap-2">{["products", "orders", "users", "loyalty", "trash"].map((t) => <button key={t} className={tab === t ? "btn-primary" : "btn-ghost"} onClick={() => setTab(t)}>{t}</button>)}</div></div>
      <ErrorBox message={error} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Products", products.length], ["Orders", orders.length], ["Customers", users.length], ["Revenue", `$${revenue}`]].map(([label, value]) => (
          <Card key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></CardContent></Card>
        ))}
      </div>
      {lowStock.length > 0 && <div className="mb-6 rounded-md border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">Low stock: {lowStock.slice(0, 5).map((product) => product.name).join(", ")}</div>}
      {tab === "products" && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form className="panel h-fit p-5" onSubmit={saveProduct}>
            <h2 className="mb-4 flex items-center gap-2 font-black"><Plus size={18} /> {editing ? "Edit product" : "Add product"}</h2>
            <div className="grid gap-3">
              {["name", "slug", "price", "stock", "rating"].map((f) => <input key={f} className="input" placeholder={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required />)}
              <select className="input" value={form.category_id || ""} onChange={(e) => setForm({ ...form, category_id: e.target.value })}><option value="">No category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, image_file: e.target.files?.[0] || null })} />
              <textarea className="input min-h-28" placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <button className="btn-primary">Save product</button>
            </div>
          </form>
          <div className="grid gap-3">{products.map((p) => <div className="panel flex flex-wrap items-center justify-between gap-3 p-4" key={p.id}><div><strong>{p.name}</strong><p className="text-sm text-muted-foreground">${p.price} - stock {p.stock}</p></div><div className="flex gap-2"><button className="btn-ghost px-3" onClick={() => { setEditing(p.slug); setForm({ name: p.name, slug: p.slug, category_id: p.category?.id || "", price: p.price, stock: p.stock, description: p.description, rating: p.rating, is_active: p.is_active, image_file: null }); }}><Edit size={17} /></button><button className="btn-ghost px-3" onClick={() => removeProduct(p.slug)}><Trash2 size={17} /></button></div></div>)}</div>
        </div>
      )}
      {tab === "orders" && <div className="grid gap-3">{orders.map((o) => <div className="panel flex flex-wrap items-center justify-between gap-3 p-4" key={o.id}><div><strong>Order #{o.id}</strong><p className="text-sm text-muted-foreground">${o.total}</p></div><div className="flex gap-2"><select className="input w-44" value={o.status} onChange={(e) => updateOrder(o.id, e.target.value)}>{["pending", "paid", "processing", "shipped", "delivered", "canceled"].map((s) => <option key={s}>{s}</option>)}</select><button className="btn-ghost px-3" onClick={() => removeOrder(o.id)}><Trash2 size={17} /></button></div></div>)}</div>}
      {tab === "users" && (
        <div className="grid gap-4">
          <div className="panel flex items-center gap-3 p-4">
            <Search size={18} className="text-muted-foreground" />
            <input className="input border-0 focus-visible:ring-0" placeholder="Search customers by username, email, phone" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>
          <div className="grid gap-3">
            {filteredUsers.map((item) => (
              <div className="panel grid gap-3 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center" key={item.id}>
                <div>
                  <div className="flex items-center gap-2"><Users size={17} className="text-primary" /><strong>{item.username}</strong><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{item.loyalty_tier}</span></div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.email} {item.phone ? `- ${item.phone}` : ""}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Points: {item.loyalty_points} available / {item.lifetime_points} lifetime</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.is_active} onChange={(e) => updateUser(item.id, { is_active: e.target.checked })} /> Active</label>
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.is_staff} onChange={(e) => updateUser(item.id, { is_staff: e.target.checked })} /> Staff</label>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "loyalty" && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form className="panel h-fit p-5" onSubmit={adjustPoints}>
            <h2 className="mb-4 flex items-center gap-2 font-black"><Award size={18} /> Adjust loyalty points</h2>
            <div className="grid gap-3">
              <select className="input" value={pointAdjust.userId} onChange={(e) => setPointAdjust({ ...pointAdjust, userId: e.target.value })} required>
                <option value="">Select customer</option>
                {users.map((item) => <option key={item.id} value={item.id}>{item.username} - {item.email}</option>)}
              </select>
              <input className="input" type="number" placeholder="Points, e.g. 100 or -50" value={pointAdjust.points} onChange={(e) => setPointAdjust({ ...pointAdjust, points: e.target.value })} required />
              <input className="input" placeholder="Reason" value={pointAdjust.description} onChange={(e) => setPointAdjust({ ...pointAdjust, description: e.target.value })} required />
              <button className="btn-primary">Apply adjustment</button>
            </div>
          </form>
          <div className="grid gap-3">
            {users.sort((a, b) => b.loyalty_points - a.loyalty_points).slice(0, 10).map((item) => (
              <div className="panel flex flex-wrap items-center justify-between gap-3 p-4" key={item.id}>
                <div><strong>{item.username}</strong><p className="text-sm text-muted-foreground capitalize">{item.loyalty_tier} member</p></div>
                <div className="text-right"><p className="text-xl font-black text-primary">{item.loyalty_points}</p><p className="text-xs text-muted-foreground">available points</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "trash" && (
        <div className="grid gap-6">
          <div className="rounded-md border border-accent/30 bg-accent/10 p-4 text-sm">
            Deleted records stay here until you clean trash. Restore brings them back to active lists.
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <TrashSection title="Products" type="products" items={trash.products} label={(item) => item.name} onRestore={(item) => restoreProduct(item.slug)} onClean={() => cleanTrash("products")} />
            <TrashSection title="Orders" type="orders" items={trash.orders} label={(item) => `Order #${item.id} - $${item.total}`} onRestore={(item) => restoreOrder(item.id)} onClean={() => cleanTrash("orders")} />
            <TrashSection title="Categories" type="categories" items={trash.categories} label={(item) => item.name} onRestore={(item) => restoreCategory(item.slug)} onClean={() => cleanTrash("categories")} />
          </div>
        </div>
      )}
    </section>
  );
}

function TrashSection({ title, items, label, onRestore, onClean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-black">{title}</h2>
            <p className="text-sm text-muted-foreground">{items.length} in trash</p>
          </div>
          <button className="btn-ghost px-3" onClick={onClean} disabled={items.length === 0}><Trash2 size={16} /> Clean</button>
        </div>
        <div className="grid gap-2">
          {items.map((item) => (
            <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={`${title}-${item.id || item.slug}`}>
              <span className="text-sm font-semibold">{label(item)}</span>
              <button className="btn-ghost px-3" onClick={() => onRestore(item)}><RotateCcw size={16} /> Restore</button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">Trash is empty.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

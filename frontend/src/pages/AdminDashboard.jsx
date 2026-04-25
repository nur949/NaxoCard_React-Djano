import {
  Activity,
  BadgePercent,
  Boxes,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  Shield,
  Tags,
  Trash2,
  UserCog,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import {
  fetchAdminAnalytics,
  fetchAdminUsers,
  fetchCategories,
  fetchCoupons,
  fetchOrders,
  fetchProducts,
} from "../services/admin.js";

const sections = [
  ["overview", LayoutDashboard, "Overview"],
  ["users", UserCog, "Users"],
  ["products", Boxes, "Products"],
  ["orders", ReceiptText, "Orders"],
  ["categories", Tags, "Categories"],
  ["coupons", BadgePercent, "Coupons"],
];

const chartColors = ["#4f7cff", "#19a48f", "#ff9f43", "#ef5d60", "#7c5cff"];
const createVariantRow = (variant = {}) => ({
  upload_key: variant.upload_key || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: variant.name || "",
  value: variant.value || "",
  stock: variant.stock || "",
  gallery: Array.isArray(variant.gallery) ? variant.gallery : [],
  gallery_files: [],
});
const emptyProduct = {
  name: "",
  slug: "",
  category_id: "",
  price: "",
  stock: "",
  description: "",
  compare_at_price: "",
  is_featured: false,
  image_file: null,
  gallery_files: [],
  variants: [createVariantRow()],
};
const emptyCategory = { name: "", slug: "" };
const emptyCoupon = {
  code: "",
  discount_type: "percent",
  value: "",
  min_order_amount: "",
  usage_limit: "",
  is_active: true,
  valid_to: "",
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productEditing, setProductEditing] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [categoryEditing, setCategoryEditing] = useState(null);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [couponEditing, setCouponEditing] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const [analyticsData, usersData, productsData, ordersData, categoriesData, couponsData] = await Promise.all([
        fetchAdminAnalytics(),
        fetchAdminUsers({ search: userSearch, role: userRoleFilter || undefined }),
        fetchProducts(),
        fetchOrders({ status: orderStatusFilter || undefined }),
        fetchCategories(),
        fetchCoupons(),
      ]);
      setAnalytics(analyticsData);
      setUsers(usersData);
      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);
      setCoupons(couponsData);
      setSelectedOrder((current) => ordersData.find((order) => order.id === current?.id) || ordersData[0] || null);
    } catch {
      setError("Admin dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [userSearch, userRoleFilter, orderStatusFilter]);

  const lowStockProducts = useMemo(() => products.filter((item) => Number(item.stock) <= 5), [products]);
  const recentActivity = analytics?.recent_activity || [];

  async function saveProduct(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = new FormData();
      ["name", "slug", "category_id", "price", "stock", "description", "compare_at_price"].forEach((field) => {
        if (productForm[field] !== "" && productForm[field] !== null) payload.append(field, productForm[field]);
      });
      payload.append("is_featured", productForm.is_featured);
      if (productForm.image_file) payload.append("image", productForm.image_file);
      Array.from(productForm.gallery_files || []).slice(0, 4).forEach((file) => payload.append("gallery_files", file));
      payload.append("variants_input", JSON.stringify(
        (productForm.variants || []).filter((item) => item.name.trim() && item.value.trim()).map((item) => ({
          upload_key: item.upload_key,
          name: item.name.trim(),
          value: item.value.trim(),
          stock: Number(item.stock || 0),
          gallery: item.gallery || [],
        }))
      ));
      (productForm.variants || []).forEach((item) => {
        Array.from(item.gallery_files || []).slice(0, 5).forEach((file) => payload.append(`variant_gallery_files_${item.upload_key}`, file));
      });
      if (productEditing) await api.patch(`/products/${productEditing}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      else await api.post("/products/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setProductForm(emptyProduct);
      setProductEditing(null);
      await loadDashboard();
    } catch {
      setError("Product save failed.");
    }
  }

  async function saveCategory(e) {
    e.preventDefault();
    setError("");
    try {
      if (categoryEditing) await api.patch(`/categories/${categoryEditing}/`, categoryForm);
      else await api.post("/categories/", categoryForm);
      setCategoryForm(emptyCategory);
      setCategoryEditing(null);
      await loadDashboard();
    } catch {
      setError("Category save failed.");
    }
  }

  async function saveCoupon(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...couponForm,
        code: couponForm.code.toUpperCase(),
        value: Number(couponForm.value || 0),
        min_order_amount: Number(couponForm.min_order_amount || 0),
        usage_limit: couponForm.usage_limit ? Number(couponForm.usage_limit) : null,
        valid_to: couponForm.valid_to || null,
      };
      if (couponEditing) await api.patch(`/coupons/${couponEditing}/`, payload);
      else await api.post("/coupons/", payload);
      setCouponForm(emptyCoupon);
      setCouponEditing(null);
      await loadDashboard();
    } catch {
      setError("Coupon save failed.");
    }
  }

  async function updateUser(userId, payload) {
    setError("");
    try {
      await api.patch(`/admin/users/${userId}/`, payload);
      await loadDashboard();
    } catch {
      setError("User update failed.");
    }
  }

  async function deleteUser(userId) {
    setError("");
    try {
      await api.delete(`/admin/users/${userId}/`);
      await loadDashboard();
    } catch {
      setError("User delete failed.");
    }
  }

  async function updateOrder(orderId, status) {
    setError("");
    try {
      await api.patch(`/orders/${orderId}/`, { status });
      await loadDashboard();
    } catch {
      setError("Order update failed.");
    }
  }

  async function removeEntity(path) {
    setError("");
    try {
      await api.delete(path);
      await loadDashboard();
    } catch {
      setError("Delete failed.");
    }
  }

  function startProductEdit(product) {
    setActiveSection("products");
    setProductEditing(product.slug);
    setProductForm({
      name: product.name || "",
      slug: product.slug || "",
      category_id: product.category?.id || "",
      price: product.price || "",
      stock: product.stock || "",
      description: product.description || "",
      compare_at_price: product.compare_at_price || "",
      is_featured: Boolean(product.is_featured),
      image_file: null,
      gallery_files: [],
      variants: product.variants?.length ? product.variants.map((variant) => createVariantRow(variant)) : [createVariantRow()],
    });
  }

  function updateProductVariant(index, field, value) {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (
        variantIndex === index ? { ...variant, [field]: value } : variant
      )),
    }));
  }

  function addProductVariantRow() {
    setProductForm((current) => ({
      ...current,
      variants: [...current.variants, createVariantRow()],
    }));
  }

  function removeProductVariantRow(index) {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.length === 1
        ? [createVariantRow()]
        : current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function startCategoryEdit(category) {
    setActiveSection("categories");
    setCategoryEditing(category.slug);
    setCategoryForm({ name: category.name, slug: category.slug });
  }

  function startCouponEdit(coupon) {
    setActiveSection("coupons");
    setCouponEditing(coupon.id);
    setCouponForm({
      code: coupon.code || "",
      discount_type: coupon.discount_type || "percent",
      value: coupon.value || "",
      min_order_amount: coupon.min_order_amount || "",
      usage_limit: coupon.usage_limit || "",
      is_active: Boolean(coupon.is_active),
      valid_to: coupon.valid_to ? coupon.valid_to.slice(0, 16) : "",
    });
  }

  if (loading && !analytics) {
    return <section className="section py-8"><Skeleton lines={18} /></section>;
  }

  return (
    <section className="section py-8">
      <ErrorBox message={error} />
      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="panel h-fit p-4">
          <div className="border-b pb-4">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Admin panel</p>
            <h1 className="mt-2 text-2xl font-black">Control center</h1>
          </div>
          <nav className="mt-4 grid gap-2">
            {sections.map(([id, Icon, label]) => (
              <button
                key={id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${activeSection === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                onClick={() => setActiveSection(id)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-bold text-foreground">Real-time ready</p>
            <p className="mt-2">Current structure is API-driven and ready for a shoes-only catalog with color-wise PNG image updates.</p>
          </div>
        </aside>

        <div className="grid gap-6">
          <div className="panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Operations</p>
              <h2 className="mt-2 text-3xl font-black">Store analytics and management</h2>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm">
              <Activity size={18} className="text-primary" />
              <span>{recentActivity.length} recent admin activities</span>
            </div>
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="grid gap-6"
          >
            {activeSection === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard label="Total users" value={analytics?.totals?.users || 0} icon={UserCog} />
                  <KpiCard label="Total products" value={analytics?.totals?.products || 0} icon={Boxes} />
                  <KpiCard label="Total orders" value={analytics?.totals?.orders || 0} icon={ReceiptText} />
                  <KpiCard label="Revenue" value={`Tk ${Number(analytics?.totals?.revenue || 0).toFixed(2)}`} icon={Shield} />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <ChartCard title="Sales trend">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={(analytics?.sales_line || []).map((item) => ({ ...item, day: formatChartDate(item.day) }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="total_sales" stroke="#4f7cff" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Orders by status">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={analytics?.orders_by_status || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                          {(analytics?.orders_by_status || []).map((entry, index) => <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Revenue breakdown">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={analytics?.revenue_breakdown || []} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={2}>
                          {(analytics?.revenue_breakdown || []).map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="User growth">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={(analytics?.user_growth || []).map((item) => ({ ...item, day: formatChartDate(item.day) }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total_users" stroke="#19a48f" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black">Recent activity</h3>
                        <span className="text-sm text-muted-foreground">Live admin feed</span>
                      </div>
                      <div className="grid gap-3">
                        {recentActivity.map((item) => (
                          <div className="rounded-xl border p-4" key={item.id}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{item.description}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{item.actor_name || "System"} • {new Date(item.created_at).toLocaleString()}</p>
                              </div>
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{item.target_type}</span>
                            </div>
                          </div>
                        ))}
                        {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-black">Inventory watch</h3>
                      <div className="mt-4 grid gap-3">
                        {lowStockProducts.slice(0, 6).map((product) => (
                          <div className="rounded-xl border p-4" key={product.id}>
                            <p className="font-semibold">{product.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Stock left: {product.stock}</p>
                          </div>
                        ))}
                        {lowStockProducts.length === 0 && <p className="text-sm text-muted-foreground">No low stock alerts.</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeSection === "users" && (
              <div className="grid gap-6">
                <Card>
                  <CardContent className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_160px]">
                    <input className="input" placeholder="Search users by name, email, phone" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                    <select className="input" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                      <option value="">All roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {users.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_140px_140px_120px] xl:items-center">
                        <div>
                          <p className="font-black">{item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : item.username}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Joined {new Date(item.date_joined).toLocaleDateString()}</p>
                        </div>
                        <select className="input" value={item.is_staff ? "admin" : "user"} onChange={(e) => updateUser(item.id, { is_staff: e.target.value === "admin" })}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <select className="input" value={item.is_active ? "active" : "inactive"} onChange={(e) => updateUser(item.id, { is_active: e.target.value === "active" })}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <Button variant="outline" onClick={() => deleteUser(item.id)}><Trash2 size={16} /> Delete</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "products" && (
              <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-black">{productEditing ? "Edit product" : "Add product"}</h3>
                    <form className="mt-4 grid gap-3" onSubmit={saveProduct}>
                      <input className="input" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                      <input className="input" placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} required />
                      <select className="input" value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}>
                        <option value="">Select category</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className="input" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                        <input className="input" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                      </div>
                      <input className="input" placeholder="Compare at price" value={productForm.compare_at_price} onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })} />
                      <textarea className="input min-h-28" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required />
                      <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold">
                        <input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} />
                        Featured product
                      </label>
                      <div className="grid gap-3 rounded-xl border p-3">
                        <div>
                          <p className="text-sm font-black">Product images</p>
                          <p className="mt-1 text-xs text-muted-foreground">Use background-free PNG shoe images. 1 cover + up to 4 more images. Total 5.</p>
                        </div>
                        <input className="input" type="file" accept="image/*" onChange={(e) => setProductForm({ ...productForm, image_file: e.target.files?.[0] || null })} />
                        <input className="input" type="file" accept="image/*" multiple onChange={(e) => setProductForm({ ...productForm, gallery_files: Array.from(e.target.files || []).slice(0, 4) })} />
                        <p className="text-xs text-muted-foreground">
                          {productForm.image_file ? "Cover selected." : "No cover selected."} {productForm.gallery_files?.length ? `${productForm.gallery_files.length} extra image selected.` : "No extra image selected."}
                        </p>
                      </div>
                      <div className="grid gap-3 rounded-xl border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black">Variations</p>
                            <p className="mt-1 text-xs text-muted-foreground">Example: Size 42, Color Black. Add multiple PNG images for each color row.</p>
                          </div>
                          <Button type="button" variant="outline" onClick={addProductVariantRow}>Add row</Button>
                        </div>
                        <div className="grid gap-3">
                          {productForm.variants.map((variant, index) => (
                            <div key={variant.upload_key} className="grid gap-2 rounded-lg border p-3">
                              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_110px_auto]">
                              <input className="input" placeholder="Type" value={variant.name} onChange={(e) => updateProductVariant(index, "name", e.target.value)} />
                              <input className="input" placeholder="Value" value={variant.value} onChange={(e) => updateProductVariant(index, "value", e.target.value)} />
                              <input className="input" placeholder="Stock" value={variant.stock} onChange={(e) => updateProductVariant(index, "stock", e.target.value)} />
                              <Button type="button" variant="outline" onClick={() => removeProductVariantRow(index)}><Trash2 size={16} /></Button>
                              </div>
                              <div className="grid gap-2">
                                <input
                                  className="input"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => updateProductVariant(index, "gallery_files", Array.from(e.target.files || []).slice(0, 5))}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {variant.gallery?.length ? `${variant.gallery.length} existing color image.` : "No existing color image."}{" "}
                                  {variant.gallery_files?.length ? `${variant.gallery_files.length} new PNG image selected.` : "No new image selected."}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">{productEditing ? "Update" : "Create"}</Button>
                        {productEditing && <Button type="button" variant="outline" onClick={() => { setProductEditing(null); setProductForm(emptyProduct); }}>Cancel</Button>}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div>
                          <p className="font-black">{product.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{product.category?.name || "No category"} • Tk {product.price}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Stock {product.stock} • {product.is_featured ? "Featured" : "Standard"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => startProductEdit(product)}>Edit</Button>
                          <Button variant="outline" onClick={() => removeEntity(`/products/${product.slug}/`)}><Trash2 size={16} /> Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "orders" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="grid gap-3 p-5 md:grid-cols-[180px_minmax(0,1fr)]">
                      <select className="input" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                        <option value="">All statuses</option>
                        {["pending", "paid", "processing", "shipped", "delivered", "canceled"].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">Click any order to view details on the right.</div>
                    </CardContent>
                  </Card>

                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                        <button className="text-left" onClick={() => setSelectedOrder(order)}>
                          <p className="font-black">Order #{order.id}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{order.items.length} items • Tk {order.total}</p>
                        </button>
                        <select className="input" value={order.status} onChange={(e) => updateOrder(order.id, e.target.value)}>
                          {["pending", "paid", "processing", "shipped", "delivered", "canceled"].map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="h-fit">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-black">Order detail</h3>
                    {selectedOrder ? (
                      <div className="mt-4 grid gap-4">
                        <div className="rounded-xl bg-muted p-4">
                          <p className="font-black">Order #{selectedOrder.id}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                          <p className="mt-2 text-sm text-muted-foreground">Status: <span className="font-semibold capitalize text-foreground">{selectedOrder.status}</span></p>
                        </div>
                        <div className="grid gap-3">
                          {selectedOrder.items.map((item) => (
                            <div className="rounded-xl border p-4" key={item.id}>
                              <div className="flex justify-between gap-3">
                                <span className="font-semibold">{item.product_name}</span>
                                <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">Tk {item.subtotal}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <p className="mt-4 text-sm text-muted-foreground">Select an order to inspect details.</p>}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "categories" && (
              <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-black">{categoryEditing ? "Edit category" : "Add category"}</h3>
                    <form className="mt-4 grid gap-3" onSubmit={saveCategory}>
                      <input className="input" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                      <input className="input" placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} required />
                      <div className="flex gap-2">
                        <Button className="flex-1">{categoryEditing ? "Update" : "Create"}</Button>
                        {categoryEditing && <Button type="button" variant="outline" onClick={() => { setCategoryEditing(null); setCategoryForm(emptyCategory); }}>Cancel</Button>}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                        <div>
                          <p className="font-black">{category.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{category.slug}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => startCategoryEdit(category)}>Edit</Button>
                          <Button variant="outline" onClick={() => removeEntity(`/categories/${category.slug}/`)}><Trash2 size={16} /> Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "coupons" && (
              <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-black">{couponEditing ? "Edit coupon" : "Create coupon"}</h3>
                    <form className="mt-4 grid gap-3" onSubmit={saveCoupon}>
                      <input className="input" placeholder="Code" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
                      <select className="input" value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}>
                        <option value="percent">Percent</option>
                        <option value="fixed">Fixed</option>
                      </select>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className="input" placeholder="Value" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} required />
                        <input className="input" placeholder="Min order amount" value={couponForm.min_order_amount} onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className="input" placeholder="Usage limit" value={couponForm.usage_limit} onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })} />
                        <input className="input" type="datetime-local" value={couponForm.valid_to} onChange={(e) => setCouponForm({ ...couponForm, valid_to: e.target.value })} />
                      </div>
                      <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold">
                        <input type="checkbox" checked={couponForm.is_active} onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })} />
                        Active coupon
                      </label>
                      <div className="flex gap-2">
                        <Button className="flex-1">{couponEditing ? "Update" : "Create"}</Button>
                        {couponEditing && <Button type="button" variant="outline" onClick={() => { setCouponEditing(null); setCouponForm(emptyCoupon); }}>Cancel</Button>}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {coupons.map((coupon) => (
                    <Card key={coupon.id}>
                      <CardContent className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div>
                          <p className="font-black">{coupon.code}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {coupon.discount_type === "percent" ? `${coupon.value}% off` : `Tk ${coupon.value} off`} • Min order Tk {coupon.min_order_amount}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Used {coupon.used_count} {coupon.usage_limit ? `of ${coupon.usage_limit}` : "times"} • {coupon.is_active ? "Active" : "Inactive"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => startCouponEdit(coupon)}>Edit</Button>
                          <Button variant="outline" onClick={() => removeEntity(`/coupons/${coupon.id}/`)}><Trash2 size={16} /> Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-xl font-black">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

function formatChartDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

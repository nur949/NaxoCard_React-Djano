import {
  Activity,
  ArrowDown,
  ArrowUp,
  BadgePercent,
  Boxes,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  RefreshCcw,
  Shield,
  Sparkles,
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
import { useToast } from "../context/ToastContext.jsx";
import {
  fetchAdminAnalytics,
  fetchAdminUsers,
  fetchCategories,
  fetchCoupons,
  fetchOrders,
  fetchProducts,
} from "../services/admin.js";

const sections = [
  ["overview", LayoutDashboard, "Overview", "Live numbers, alerts and activity"],
  ["products", Boxes, "Products", "Catalog, variants and rearrange"],
  ["orders", ReceiptText, "Orders", "Processing and fulfillment flow"],
  ["users", UserCog, "Users", "Roles, access and lifecycle"],
  ["categories", Tags, "Categories", "Taxonomy and collection structure"],
  ["coupons", BadgePercent, "Coupons", "Campaigns and discount control"],
];

const chartColors = ["#2251ff", "#0f9f88", "#f59e0b", "#ef4444", "#7c3aed"];

const createVariantRow = (variant = {}) => ({
  upload_key: variant.upload_key || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: variant.name || "",
  value: variant.value || "",
  stock: variant.stock ?? "",
  gallery: Array.isArray(variant.gallery) ? variant.gallery : [],
  gallery_files: [],
});

const createEmptyProduct = () => ({
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
});

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
  const { pushToast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLabel, setActionLabel] = useState("");
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
  const [productForm, setProductForm] = useState(createEmptyProduct());
  const [productEditing, setProductEditing] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [categoryEditing, setCategoryEditing] = useState(null);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [couponEditing, setCouponEditing] = useState(null);

  async function loadDashboard({ silent = false } = {}) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [analyticsData, usersData, productsData, ordersData, categoriesData, couponsData] = await Promise.all([
        fetchAdminAnalytics(),
        fetchAdminUsers({ search: userSearch, role: userRoleFilter || undefined }),
        fetchProducts({ ordering: "sort_order" }),
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
    } catch (requestError) {
      setError(extractApiError(requestError, "Admin dashboard data could not be loaded."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [userSearch, userRoleFilter, orderStatusFilter]);

  const lowStockProducts = useMemo(() => products.filter((item) => Number(item.stock) <= 5), [products]);
  const featuredProducts = useMemo(() => products.filter((item) => item.is_featured), [products]);
  const recentActivity = analytics?.recent_activity || [];
  const activeSectionMeta = sections.find(([id]) => id === activeSection) || sections[0];

  async function withAction(label, task, successMessage) {
    setActionLabel(label);
    setError("");
    try {
      const result = await task();
      if (successMessage) pushToast(successMessage);
      return result;
    } catch (requestError) {
      const message = extractApiError(requestError, `${label} failed.`);
      setError(message);
      pushToast(message, "error");
      throw requestError;
    } finally {
      setActionLabel("");
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    const payload = new FormData();
    ["name", "slug", "category_id", "price", "stock", "description", "compare_at_price"].forEach((field) => {
      if (productForm[field] !== "" && productForm[field] !== null) payload.append(field, productForm[field]);
    });
    payload.append("is_featured", productForm.is_featured ? "true" : "false");
    if (productForm.image_file) payload.append("image", productForm.image_file);
    Array.from(productForm.gallery_files || []).slice(0, 4).forEach((file) => payload.append("gallery_files", file));
    payload.append("variants_input", JSON.stringify(
      (productForm.variants || [])
        .filter((item) => item.name.trim() && item.value.trim())
        .map((item) => ({
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

    const isEditing = Boolean(productEditing);
    await withAction(
      isEditing ? "Updating product" : "Creating product",
      async () => {
        if (isEditing) {
          await api.patch(`/products/${productEditing}/`, payload);
        } else {
          await api.post("/products/", payload);
        }
        setProductForm(createEmptyProduct());
        setProductEditing(null);
        await loadDashboard({ silent: true });
      },
      isEditing ? "Product updated." : "Product created."
    );
  }

  async function saveCategory(event) {
    event.preventDefault();
    const isEditing = Boolean(categoryEditing);
    await withAction(
      isEditing ? "Updating category" : "Creating category",
      async () => {
        if (isEditing) await api.patch(`/categories/${categoryEditing}/`, categoryForm);
        else await api.post("/categories/", categoryForm);
        setCategoryForm(emptyCategory);
        setCategoryEditing(null);
        await loadDashboard({ silent: true });
      },
      isEditing ? "Category updated." : "Category created."
    );
  }

  async function saveCoupon(event) {
    event.preventDefault();
    const payload = {
      ...couponForm,
      code: couponForm.code.toUpperCase(),
      value: Number(couponForm.value || 0),
      min_order_amount: Number(couponForm.min_order_amount || 0),
      usage_limit: couponForm.usage_limit ? Number(couponForm.usage_limit) : null,
      valid_to: couponForm.valid_to || null,
    };
    const isEditing = Boolean(couponEditing);
    await withAction(
      isEditing ? "Updating coupon" : "Creating coupon",
      async () => {
        if (isEditing) await api.patch(`/coupons/${couponEditing}/`, payload);
        else await api.post("/coupons/", payload);
        setCouponForm(emptyCoupon);
        setCouponEditing(null);
        await loadDashboard({ silent: true });
      },
      isEditing ? "Coupon updated." : "Coupon created."
    );
  }

  async function updateUser(userId, payload, successMessage) {
    await withAction(successMessage, async () => {
      await api.patch(`/admin/users/${userId}/`, payload);
      await loadDashboard({ silent: true });
    }, successMessage);
  }

  async function deleteUser(userId) {
    await withAction("Deleting user", async () => {
      await api.delete(`/admin/users/${userId}/`);
      await loadDashboard({ silent: true });
    }, "User deleted.");
  }

  async function updateOrder(orderId, status) {
    await withAction("Updating order", async () => {
      await api.patch(`/orders/${orderId}/`, { status });
      await loadDashboard({ silent: true });
    }, `Order moved to ${status}.`);
  }

  async function removeEntity(path, successMessage) {
    await withAction("Deleting item", async () => {
      await api.delete(path);
      await loadDashboard({ silent: true });
    }, successMessage);
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

  async function reorderProducts(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= products.length) return;
    const reordered = moveArrayItem(products, index, nextIndex);
    setProducts(reordered);
    try {
      await withAction(
        "Reordering products",
        async () => {
          await api.post("/products/reorder/", { ordered_slugs: reordered.map((item) => item.slug) });
          await loadDashboard({ silent: true });
        },
        `Product swapped to position ${nextIndex + 1}.`
      );
    } catch {
      setProducts(products);
    }
  }

  if (loading && !analytics) {
    return <section className="section py-8"><Skeleton lines={18} /></section>;
  }

  return (
    <section className="section py-8">
      <div className="relative overflow-hidden rounded-[28px] border border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,81,255,0.14),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(240,245,255,0.92))] p-5 shadow-soft dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,81,255,0.22),_transparent_34%),linear-gradient(135deg,_rgba(17,24,39,0.95),_rgba(10,15,26,0.94))] sm:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle,_rgba(15,159,136,0.12),_transparent_62%)] lg:block" />
        <ErrorBox message={error} />

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="panel h-fit overflow-hidden border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
            <div className="border-b border-border/70 px-5 py-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Admin cockpit</p>
              <h1 className="mt-3 text-3xl font-black">Store control room</h1>
              <p className="mt-2 text-sm text-muted-foreground">Catalog, users, orders and campaign operations from one workflow.</p>
            </div>

            <nav className="grid gap-2 p-3">
              {sections.map(([id, Icon, label, caption]) => (
                <button
                  key={id}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${activeSection === id ? "border-primary/20 bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-transparent bg-transparent hover:border-border hover:bg-muted/70"}`}
                  onClick={() => setActiveSection(id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-xl p-2 ${activeSection === id ? "bg-white/15" : "bg-muted text-primary"}`}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="font-bold">{label}</p>
                      <p className={`text-xs ${activeSection === id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{caption}</p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="m-3 rounded-2xl border border-border/70 bg-muted/60 p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Sparkles size={16} className="text-primary" />
                Ops pulse
              </p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <p>{lowStockProducts.length} low-stock product alert</p>
                <p>{featuredProducts.length} featured product live</p>
                <p>{recentActivity.length} fresh admin activity logged</p>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            <div className="panel overflow-hidden border-white/50 bg-white/85 p-5 backdrop-blur dark:bg-card/80">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">{activeSectionMeta[2]}</p>
                  <h2 className="mt-2 text-3xl font-black">{activeSectionMeta[3]}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {activeSection === "overview" && "Track live performance, spot bottlenecks and react before catalog or order flow slips."}
                    {activeSection === "products" && "Create products, update variations and reorder the storefront without leaving the admin view."}
                    {activeSection === "orders" && "Move every order through fulfillment with fast status updates and detailed inspection."}
                    {activeSection === "users" && "Manage customer access, admin roles and account health from a compact operations table."}
                    {activeSection === "categories" && "Keep collection structure clean so storefront navigation and filtering stay sharp."}
                    {activeSection === "coupons" && "Launch campaigns, manage expiry windows and keep discounts under control."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <CommandTile label="Sync state" value={refreshing ? "Refreshing..." : "Ready"} icon={RefreshCcw} onClick={() => loadDashboard({ silent: true })} />
                  <CommandTile label="Low stock" value={String(lowStockProducts.length)} icon={PackageSearch} onClick={() => setActiveSection("products")} />
                  <CommandTile label="Recent logs" value={String(recentActivity.length)} icon={Activity} onClick={() => setActiveSection("overview")} />
                </div>
              </div>

              {actionLabel && (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                  {actionLabel}...
                </div>
              )}
            </div>

            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6"
            >
              {activeSection === "overview" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard label="Total users" value={analytics?.totals?.users || 0} icon={UserCog} tone="blue" />
                    <KpiCard label="Total products" value={analytics?.totals?.products || 0} icon={Boxes} tone="emerald" />
                    <KpiCard label="Total orders" value={analytics?.totals?.orders || 0} icon={ReceiptText} tone="amber" />
                    <KpiCard label="Revenue" value={formatMoney(analytics?.totals?.revenue || 0)} icon={Shield} tone="violet" />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <ChartCard title="Sales trend">
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={(analytics?.sales_line || []).map((item) => ({ ...item, day: formatChartDate(item.day) }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="total_sales" stroke="#2251ff" strokeWidth={3} dot={false} />
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
                          <Bar dataKey="total" radius={[10, 10, 0, 0]}>
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
                          <Line type="monotone" dataKey="total_users" stroke="#0f9f88" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-black">Recent activity</h3>
                            <p className="text-sm text-muted-foreground">Latest admin-side actions and system changes.</p>
                          </div>
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">Live feed</span>
                        </div>
                        <div className="grid gap-3">
                          {recentActivity.map((item) => (
                            <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={item.id}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{item.description}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{item.actor_name || "System"} • {formatDateTime(item.created_at)}</p>
                                </div>
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold capitalize">{item.target_type}</span>
                              </div>
                            </div>
                          ))}
                          {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-black">Inventory watch</h3>
                        <div className="mt-4 grid gap-3">
                          {lowStockProducts.slice(0, 6).map((product) => (
                            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10" key={product.id}>
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

              {activeSection === "products" && (
                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                  <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black">{productEditing ? "Edit product" : "Add product"}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Safe payload validation is active, so bad variant input now returns clean API errors instead of crashing.</p>
                        </div>
                        {productEditing && (
                          <Button type="button" variant="outline" onClick={() => { setProductEditing(null); setProductForm(createEmptyProduct()); }}>
                            Reset
                          </Button>
                        )}
                      </div>

                      <form className="mt-5 grid gap-3" onSubmit={saveProduct}>
                        <input className="input" placeholder="Product name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required />
                        <input className="input" placeholder="Slug" value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} required />
                        <select className="input" value={productForm.category_id} onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })}>
                          <option value="">Select category</option>
                          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="input" type="number" min="0" step="0.01" placeholder="Price" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required />
                          <input className="input" type="number" min="0" step="1" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required />
                        </div>
                        <input className="input" type="number" min="0" step="0.01" placeholder="Compare at price" value={productForm.compare_at_price} onChange={(event) => setProductForm({ ...productForm, compare_at_price: event.target.value })} />
                        <textarea className="input min-h-28" placeholder="Description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required />
                        <label className="flex items-center gap-2 rounded-2xl border border-border/70 px-3 py-3 text-sm font-semibold">
                          <input type="checkbox" checked={productForm.is_featured} onChange={(event) => setProductForm({ ...productForm, is_featured: event.target.checked })} />
                          Featured product
                        </label>

                        <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
                          <div>
                            <p className="text-sm font-black">Product media</p>
                            <p className="mt-1 text-xs text-muted-foreground">One cover plus up to four gallery images. Backend validates files before saving.</p>
                          </div>
                          <input className="input h-auto py-2" type="file" accept="image/*" onChange={(event) => setProductForm({ ...productForm, image_file: event.target.files?.[0] || null })} />
                          <input className="input h-auto py-2" type="file" accept="image/*" multiple onChange={(event) => setProductForm({ ...productForm, gallery_files: Array.from(event.target.files || []).slice(0, 4) })} />
                          <p className="text-xs text-muted-foreground">
                            {productForm.image_file ? "Cover selected." : "No cover selected."} {productForm.gallery_files?.length ? `${productForm.gallery_files.length} gallery image selected.` : "No gallery image selected."}
                          </p>
                        </div>

                        <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black">Variants</p>
                              <p className="mt-1 text-xs text-muted-foreground">Add rows like Size 42 or Color Black. Variant stock is number-only now.</p>
                            </div>
                            <Button type="button" variant="outline" onClick={addProductVariantRow}>Add row</Button>
                          </div>

                          <div className="grid gap-3">
                            {productForm.variants.map((variant, index) => (
                              <div key={variant.upload_key} className="rounded-2xl border border-border/70 bg-background/90 p-3">
                                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
                                  <input className="input" placeholder="Type" value={variant.name} onChange={(event) => updateProductVariant(index, "name", event.target.value)} />
                                  <input className="input" placeholder="Value" value={variant.value} onChange={(event) => updateProductVariant(index, "value", event.target.value)} />
                                  <input className="input" type="number" min="0" step="1" placeholder="Stock" value={variant.stock} onChange={(event) => updateProductVariant(index, "stock", event.target.value)} />
                                  <Button type="button" variant="outline" onClick={() => removeProductVariantRow(index)}><Trash2 size={16} /></Button>
                                </div>
                                <div className="mt-3 grid gap-2">
                                  <input
                                    className="input h-auto py-2"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(event) => updateProductVariant(index, "gallery_files", Array.from(event.target.files || []).slice(0, 5))}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {variant.gallery?.length ? `${variant.gallery.length} existing variant image.` : "No existing variant image."} {variant.gallery_files?.length ? `${variant.gallery_files.length} new image selected.` : "No new image selected."}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">{productEditing ? "Update product" : "Create product"}</Button>
                          {productEditing && <Button type="button" variant="outline" onClick={() => { setProductEditing(null); setProductForm(createEmptyProduct()); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-xl font-black">Catalog queue</h3>
                          <p className="text-sm text-muted-foreground">Use the up/down controls to rearrange product order. A toast appears after every swap.</p>
                        </div>
                        <div className="rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">
                          {products.length} products • {featuredProducts.length} featured
                        </div>
                      </CardContent>
                    </Card>

                    {products.map((product, index) => (
                      <Card key={product.id} className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                        <CardContent className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black">{index + 1}. {product.name}</p>
                              {product.is_featured && <Badge text="Featured" tone="blue" />}
                              {Number(product.stock) <= 5 && <Badge text="Low stock" tone="amber" />}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{product.category?.name || "No category"} • {formatMoney(product.price)} • Stock {product.stock}</p>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" onClick={() => reorderProducts(index, -1)} disabled={index === 0}>
                              <ArrowUp size={16} /> Up
                            </Button>
                            <Button type="button" variant="outline" onClick={() => reorderProducts(index, 1)} disabled={index === products.length - 1}>
                              <ArrowDown size={16} /> Down
                            </Button>
                            <Button type="button" variant="outline" onClick={() => startProductEdit(product)}>Edit</Button>
                            <Button type="button" variant="outline" onClick={() => removeEntity(`/products/${product.slug}/`, "Product deleted.")}>
                              <Trash2 size={16} /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "orders" && (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                  <div className="grid gap-4">
                    <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                      <CardContent className="grid gap-3 p-5 md:grid-cols-[180px_minmax(0,1fr)]">
                        <select className="input" value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
                          <option value="">All statuses</option>
                          {["pending", "paid", "processing", "shipped", "delivered", "canceled"].map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">Select an order to inspect details. Status updates trigger immediate API sync.</div>
                      </CardContent>
                    </Card>

                    {orders.map((order) => (
                      <Card key={order.id} className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                        <CardContent className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                          <button className="text-left" onClick={() => setSelectedOrder(order)}>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black">Order #{order.id}</p>
                              <Badge text={order.status} tone={statusTone(order.status)} />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{order.items.length} items • {formatMoney(order.total)}</p>
                          </button>
                          <select className="input" value={order.status} onChange={(event) => updateOrder(order.id, event.target.value)}>
                            {["pending", "paid", "processing", "shipped", "delivered", "canceled"].map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="h-fit border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-black">Order detail</h3>
                      {selectedOrder ? (
                        <div className="mt-4 grid gap-4">
                          <div className="rounded-2xl bg-muted p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-black">Order #{selectedOrder.id}</p>
                              <Badge text={selectedOrder.status} tone={statusTone(selectedOrder.status)} />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                            <p className="mt-2 text-xs text-muted-foreground">{selectedOrder.items.length} line items • {formatMoney(selectedOrder.total)}</p>
                          </div>
                          <div className="grid gap-3">
                            {selectedOrder.items.map((item) => (
                              <div className="rounded-2xl border border-border/70 p-4" key={item.id}>
                                <div className="flex justify-between gap-3">
                                  <span className="font-semibold">{item.product_name}</span>
                                  <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{formatMoney(item.subtotal)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : <p className="mt-4 text-sm text-muted-foreground">Select an order to inspect details.</p>}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "users" && (
                <div className="grid gap-6">
                  <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                    <CardContent className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_180px]">
                      <input className="input" placeholder="Search users by name, email, phone" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
                      <select className="input" value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}>
                        <option value="">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    {users.map((item) => (
                      <Card key={item.id} className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                        <CardContent className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_150px_150px_120px] xl:items-center">
                          <div>
                            <p className="font-black">{item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : item.username}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Joined {new Date(item.date_joined).toLocaleDateString()}</p>
                          </div>
                          <select className="input" value={item.is_staff ? "admin" : "user"} onChange={(event) => updateUser(item.id, { is_staff: event.target.value === "admin" }, "User role updated.")}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <select className="input" value={item.is_active ? "active" : "inactive"} onChange={(event) => updateUser(item.id, { is_active: event.target.value === "active" }, "User status updated.")}>
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

              {activeSection === "categories" && (
                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                  <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                    <CardContent className="p-5">
                      <h3 className="text-xl font-black">{categoryEditing ? "Edit category" : "Add category"}</h3>
                      <form className="mt-4 grid gap-3" onSubmit={saveCategory}>
                        <input className="input" placeholder="Category name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required />
                        <input className="input" placeholder="Slug" value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} required />
                        <div className="flex gap-2">
                          <Button className="flex-1">{categoryEditing ? "Update category" : "Create category"}</Button>
                          {categoryEditing && <Button type="button" variant="outline" onClick={() => { setCategoryEditing(null); setCategoryForm(emptyCategory); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                          <div>
                            <p className="font-black">{category.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{category.slug}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => startCategoryEdit(category)}>Edit</Button>
                            <Button variant="outline" onClick={() => removeEntity(`/categories/${category.slug}/`, "Category deleted.")}><Trash2 size={16} /> Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "coupons" && (
                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                  <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                    <CardContent className="p-5">
                      <h3 className="text-xl font-black">{couponEditing ? "Edit coupon" : "Create coupon"}</h3>
                      <form className="mt-4 grid gap-3" onSubmit={saveCoupon}>
                        <input className="input" placeholder="Code" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value.toUpperCase() })} required />
                        <select className="input" value={couponForm.discount_type} onChange={(event) => setCouponForm({ ...couponForm, discount_type: event.target.value })}>
                          <option value="percent">Percent</option>
                          <option value="fixed">Fixed</option>
                        </select>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="input" type="number" min="0" step="0.01" placeholder="Value" value={couponForm.value} onChange={(event) => setCouponForm({ ...couponForm, value: event.target.value })} required />
                          <input className="input" type="number" min="0" step="0.01" placeholder="Min order amount" value={couponForm.min_order_amount} onChange={(event) => setCouponForm({ ...couponForm, min_order_amount: event.target.value })} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="input" type="number" min="0" step="1" placeholder="Usage limit" value={couponForm.usage_limit} onChange={(event) => setCouponForm({ ...couponForm, usage_limit: event.target.value })} />
                          <input className="input" type="datetime-local" value={couponForm.valid_to} onChange={(event) => setCouponForm({ ...couponForm, valid_to: event.target.value })} />
                        </div>
                        <label className="flex items-center gap-2 rounded-2xl border border-border/70 px-3 py-3 text-sm font-semibold">
                          <input type="checkbox" checked={couponForm.is_active} onChange={(event) => setCouponForm({ ...couponForm, is_active: event.target.checked })} />
                          Active coupon
                        </label>
                        <div className="flex gap-2">
                          <Button className="flex-1">{couponEditing ? "Update coupon" : "Create coupon"}</Button>
                          {couponEditing && <Button type="button" variant="outline" onClick={() => { setCouponEditing(null); setCouponForm(emptyCoupon); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    {coupons.map((coupon) => (
                      <Card key={coupon.id} className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
                        <CardContent className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black">{coupon.code}</p>
                              <Badge text={coupon.is_active ? "Active" : "Inactive"} tone={coupon.is_active ? "emerald" : "slate"} />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {coupon.discount_type === "percent" ? `${coupon.value}% off` : `${formatMoney(coupon.value)} off`} • Min order {formatMoney(coupon.min_order_amount)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Used {coupon.used_count} {coupon.usage_limit ? `of ${coupon.usage_limit}` : "times"}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => startCouponEdit(coupon)}>Edit</Button>
                            <Button variant="outline" onClick={() => removeEntity(`/coupons/${coupon.id}/`, "Coupon deleted.")}><Trash2 size={16} /> Delete</Button>
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
      </div>
    </section>
  );
}

function CommandTile({ label, value, icon: Icon, onClick }) {
  return (
    <button
      className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left transition hover:border-primary/20 hover:bg-primary/5"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-lg font-black">{value}</p>
        </div>
        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon size={18} />
        </span>
      </div>
    </button>
  );
}

function KpiCard({ label, value, icon: Icon, tone = "blue" }) {
  const toneClass = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  }[tone];

  return (
    <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
          <div className={`rounded-2xl p-3 ${toneClass}`}>
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card className="border-white/50 bg-white/85 backdrop-blur dark:bg-card/80">
      <CardContent className="p-6">
        <h3 className="mb-4 text-xl font-black">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

function Badge({ text, tone = "slate" }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    violet: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
    red: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    slate: "border-border bg-muted text-muted-foreground",
  };

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${tones[tone]}`}>{text}</span>;
}

function formatChartDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMoney(value) {
  return `Tk ${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function statusTone(status) {
  const tones = {
    pending: "amber",
    paid: "blue",
    processing: "violet",
    shipped: "emerald",
    delivered: "emerald",
    canceled: "red",
  };
  return tones[status] || "slate";
}

function moveArrayItem(items, fromIndex, toIndex) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function extractApiError(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;

  const firstEntry = Object.entries(data).find(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" && value;
  });

  if (!firstEntry) return fallback;

  const [field, value] = firstEntry;
  if (Array.isArray(value)) return `${field}: ${value[0]}`;
  return `${field}: ${value}`;
}

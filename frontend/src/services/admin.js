import api from "../api/client.js";

export async function fetchAdminAnalytics() {
  const { data } = await api.get("/admin/analytics/");
  return data;
}

export async function fetchAdminActivity() {
  const { data } = await api.get("/admin/activity/");
  return data.results || data;
}

export async function fetchAdminUsers(params = {}) {
  const { data } = await api.get("/admin/users/", { params });
  return data.results || data;
}

export async function fetchProducts(params = {}) {
  const { data } = await api.get("/products/", { params });
  return data.results || data;
}

export async function fetchCategories() {
  const { data } = await api.get("/categories/");
  return data.results || data;
}

export async function fetchOrders(params = {}) {
  const { data } = await api.get("/orders/", { params });
  return data.results || data;
}

export async function fetchCoupons() {
  const { data } = await api.get("/coupons/");
  return data.results || data;
}

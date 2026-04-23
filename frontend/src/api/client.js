import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const API_ROOT = API_URL.replace(/\/api\/?$/, "");

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toUpperCase();
    if (typeof window !== "undefined" && method && method !== "GET") {
      window.dispatchEvent(new CustomEvent("myshop:api-mutated", {
        detail: {
          method,
          url: response.config?.url || "",
          data: response.data,
        },
      }));
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
        localStorage.setItem("accessToken", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ROOT}${path}`;
}

export function productImage(product, fallback = "") {
  if (!product) return fallback;
  const galleryImage = Array.isArray(product.gallery) ? product.gallery.find(Boolean) : "";
  return mediaUrl(product.image) || mediaUrl(galleryImage) || fallback;
}

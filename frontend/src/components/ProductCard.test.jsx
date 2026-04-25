import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ProductCard from "./ProductCard.jsx";

vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("../context/CartContext.jsx", () => ({ useCart: () => ({ add: vi.fn() }) }));

describe("ProductCard", () => {
  it("renders product name and price", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProductCard product={{ id: 1, name: "Runner", slug: "runner", price: "49.99", description: "Light shoes", rating: "4.50", stock: 5 }} />
      </MemoryRouter>
    );
    expect(screen.getByText("Runner")).toBeInTheDocument();
    expect(screen.getByText("Tk 49.99")).toBeInTheDocument();
  });
});

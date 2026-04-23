import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const menus = [
  {
    label: "MEN",
    columns: [
      ["ALL SHOES", "Casual Shoes", "Formal Shoes", "Mens Sandal", "Sports", "Loafer"],
      ["BRANDS", "Power", "North Star", "Hush Puppies", "Weinbrenner", "Bata"],
      ["BY PRICE", "Under Tk.1000", "Tk.1001 - Tk.1500", "Tk.1501 - Tk.3000", "Above Tk.5000"],
    ],
  },
  {
    label: "WOMEN",
    columns: [
      ["ALL SHOES", "Ladies Sandals", "Ladies Heel", "Ladies Sports", "Closed Shoes"],
      ["BRANDS", "Bata", "Marie Claire", "Power", "Scholl"],
      ["BY COLOR", "Black", "Brown", "Red", "Pink", "White"],
    ],
  },
  {
    label: "CHILDREN",
    columns: [
      ["BOYS", "Sandal", "Sports", "Kids Casuals"],
      ["GIRLS", "Sandal", "Sports", "School Shoes"],
      ["BY SIZE", "1", "2", "3", "4", "5", "6"],
    ],
  },
  {
    label: "ACCESSORIES",
    columns: [
      ["BAG", "Backpack", "Ladies Handbags"],
      ["OTHERS", "Belts", "Wallets", "Shoe Care"],
      ["SHOP", "New Arrivals", "Best Seller", "Gift Cards"],
    ],
  },
  {
    label: "BATA CLUB",
    columns: [
      ["MEMBERSHIP", "Check points", "Register", "Benefits"],
      ["OFFERS", "Member deals", "Season sale", "Store rewards"],
    ],
  },
];

export default function MegaNav() {
  return (
    <nav className="hidden border-y bg-background lg:block">
      <div className="section flex h-12 items-center justify-center gap-10">
        <Link to="/products" className="text-sm font-bold uppercase tracking-wide hover:text-primary">New Arrivals</Link>
        <Link to="/products" className="text-sm font-bold uppercase tracking-wide hover:text-primary">Best Sellers</Link>
        {menus.map((menu) => (
          <div key={menu.label} className="group relative h-full">
            <Link to="/products" className="flex h-full items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary">
              {menu.label} <ChevronDown size={14} />
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 translate-y-2 rounded-b-lg border bg-popover p-6 opacity-0 shadow-premium transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}>
                {menu.columns.map(([title, ...items]) => (
                  <div key={title}>
                    <h3 className="mb-3 text-sm font-black uppercase">{title}</h3>
                    <div className="grid gap-2">
                      {items.map((item) => (
                        <Link key={item} to={`/products?search=${encodeURIComponent(item)}`} className="text-sm text-muted-foreground hover:text-primary">{item}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

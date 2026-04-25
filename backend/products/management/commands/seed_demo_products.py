from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import Category, Product, ProductVariant


DEFAULT_CATEGORIES = [
    ("Men's Shoes", "mens-shoes"),
    ("Women's Shoes", "womens-shoes"),
    ("Kids' Shoes", "kids-shoes"),
    ("Sneakers", "sneakers"),
    ("Sandals", "sandals"),
    ("Loafers", "loafers"),
]

CATALOG = {
    "mens-shoes": [
        ("Bata Comfit Leather Derby", "Polished leather derby shoes with cushioned footbed for office and formal wear.", "3990.00", "4590.00", 4.7, 132, 84),
        ("Power Flex Walk Trainer", "Lightweight lace-up walking shoes with breathable mesh and flexible outsole.", "3290.00", "3790.00", 4.5, 96, 73),
        ("North Star Urban Loafer", "Slip-on casual loafer with soft lining, grip sole, and everyday styling.", "2490.00", "2990.00", 4.3, 74, 51),
        ("Hush Puppies Classic Moc Toe", "Premium moc-toe casual shoes made for all-day comfort and smart weekends.", "6490.00", "7290.00", 4.8, 188, 120),
        ("Bata Red Label Formal Oxford", "Sharp cap-toe oxford shoes with durable synthetic leather finish.", "3490.00", "4090.00", 4.4, 83, 62),
    ],
    "womens-shoes": [
        ("Marie Claire Block Heel Pump", "Comfortable block heel pump with padded insole and stable heel support.", "3790.00", "4490.00", 4.6, 117, 78),
        ("Bata Comfit Ballet Flat", "Soft round-toe flats built for daily office, campus, and commute wear.", "1990.00", "2390.00", 4.4, 102, 69),
        ("Weinbrenner Casual Slip-On", "Textured slip-on shoes with flexible outsole and a clean weekend profile.", "2990.00", "3590.00", 4.5, 91, 55),
        ("Power Knit Walking Shoe", "Breathable knit upper with responsive cushioning for active daily movement.", "3590.00", "4290.00", 4.7, 146, 98),
        ("Bata Rose Gold Party Heel", "Elegant low party heel with metallic finish and soft ankle support.", "4290.00", "4990.00", 4.6, 87, 47),
    ],
    "kids-shoes": [
        ("Bubblegummers School Shoe", "Durable black school shoes with easy-clean upper and cushioned collar.", "1890.00", "2190.00", 4.5, 126, 88),
        ("Power Kids Sport Runner", "Flexible sport shoes with hook-and-loop strap for quick everyday wear.", "2290.00", "2690.00", 4.6, 138, 102),
        ("North Star Junior Sneaker", "Colorful lace-up sneakers with lightweight outsole for play and school.", "1990.00", "2490.00", 4.4, 92, 66),
        ("Bubblegummers Light-Up Trainer", "Fun light-up sneakers with padded heel and non-marking sole.", "2790.00", "3290.00", 4.7, 174, 121),
        ("Bata Kids Canvas Classic", "Breathable canvas shoes with rubber toe guard and reliable grip.", "1490.00", "1790.00", 4.3, 68, 44),
    ],
    "sneakers": [
        ("Power Nitro Running Shoe", "Responsive running shoes with mesh ventilation and shock-absorbing midsole.", "4490.00", "5290.00", 4.8, 214, 158),
        ("Power Court Pro Sneaker", "Court-inspired sneakers with lateral support and durable rubber traction.", "3990.00", "4690.00", 4.6, 137, 93),
        ("North Star Street Runner", "Street-ready sneaker with layered upper, soft collar, and bold outsole.", "3190.00", "3790.00", 4.5, 118, 82),
        ("Power Gym Flex Trainer", "Stable training shoes for gym sessions, walking, and daily active use.", "3690.00", "4290.00", 4.4, 104, 71),
        ("Power Trail Grip Sneaker", "Outdoor-ready sneaker with rugged sole pattern and reinforced toe bumper.", "4990.00", "5790.00", 4.7, 163, 112),
    ],
    "sandals": [
        ("Bata Comfit Leather Sandal", "Soft leather sandal with adjustable straps and cushioned walking sole.", "2490.00", "2990.00", 4.5, 106, 75),
        ("Power Active Slide", "Quick-dry sport slides with contoured footbed and textured grip.", "1290.00", "1590.00", 4.4, 95, 71),
        ("North Star Casual Flip-Flop", "Lightweight flip-flops for casual days, travel, and indoor comfort.", "890.00", "1090.00", 4.2, 77, 52),
        ("Bata Daily Comfort Sandal", "Everyday sandal with padded upper and flexible anti-slip outsole.", "1790.00", "2190.00", 4.3, 88, 59),
        ("Weinbrenner Outdoor Sandal", "Rugged outdoor sandal with secure straps and durable treaded outsole.", "3290.00", "3890.00", 4.6, 122, 86),
    ],
    "loafers": [
        ("North Star Penny Loafer", "Smart casual penny loafer with clean lines, soft lining, and easy slip-on comfort.", "2890.00", "3490.00", 4.4, 104, 69),
        ("Bata Comfit Tassel Loafer", "Comfort-driven tassel loafer for office, travel, and polished daily wear.", "3290.00", "3890.00", 4.5, 116, 77),
        ("Hush Puppies Softwalk Loafer", "Cushioned moc-style loafer with flexible sole and premium finish.", "5890.00", "6690.00", 4.8, 148, 103),
        ("Power Street Slip Loafer", "Modern casual loafer with sporty base and all-day walkable support.", "2590.00", "3090.00", 4.3, 81, 58),
        ("Bata Weekend Driver Loafer", "Relaxed driver loafer with grip outsole and soft footbed for long days out.", "3090.00", "3690.00", 4.6, 122, 84),
    ],
}

DEMO_ASSET_URL_BASE = "/media/demo-products"
DEMO_ASSET_STORAGE_BASE = "demo-products"

IMAGE_POOLS = {
        "mens-shoes": [
        f"{DEMO_ASSET_URL_BASE}/mens-black.svg",
        f"{DEMO_ASSET_URL_BASE}/mens-brown.svg",
        f"{DEMO_ASSET_URL_BASE}/mens-white.svg",
    ],
    "womens-shoes": [
        f"{DEMO_ASSET_URL_BASE}/women-black.svg",
        f"{DEMO_ASSET_URL_BASE}/women-pink.svg",
        f"{DEMO_ASSET_URL_BASE}/women-white.svg",
    ],
    "kids-shoes": [
        f"{DEMO_ASSET_URL_BASE}/kids-black.svg",
        f"{DEMO_ASSET_URL_BASE}/kids-blue.svg",
        f"{DEMO_ASSET_URL_BASE}/kids-pink.svg",
    ],
    "sneakers": [
        f"{DEMO_ASSET_URL_BASE}/sneaker-black.svg",
        f"{DEMO_ASSET_URL_BASE}/sneaker-blue.svg",
        f"{DEMO_ASSET_URL_BASE}/sneaker-white.svg",
    ],
    "sandals": [
        f"{DEMO_ASSET_URL_BASE}/sandal-black.svg",
        f"{DEMO_ASSET_URL_BASE}/sandal-brown.svg",
        f"{DEMO_ASSET_URL_BASE}/sandal-white.svg",
    ],
    "loafers": [
        f"{DEMO_ASSET_URL_BASE}/loafer-black.svg",
        f"{DEMO_ASSET_URL_BASE}/loafer-brown.svg",
        f"{DEMO_ASSET_URL_BASE}/loafer-white.svg",
    ],
}

COLOR_IMAGE_POOLS = {
    "mens-shoes": {
        "Black": [f"{DEMO_ASSET_URL_BASE}/mens-black.svg", f"{DEMO_ASSET_URL_BASE}/loafer-black.svg"],
        "Brown": [f"{DEMO_ASSET_URL_BASE}/mens-brown.svg", f"{DEMO_ASSET_URL_BASE}/loafer-brown.svg"],
        "White": [f"{DEMO_ASSET_URL_BASE}/mens-white.svg", f"{DEMO_ASSET_URL_BASE}/sneaker-white.svg"],
    },
    "womens-shoes": {
        "Black": [f"{DEMO_ASSET_URL_BASE}/women-black.svg", f"{DEMO_ASSET_URL_BASE}/women-white.svg"],
        "Pink": [f"{DEMO_ASSET_URL_BASE}/women-pink.svg", f"{DEMO_ASSET_URL_BASE}/women-white.svg"],
        "White": [f"{DEMO_ASSET_URL_BASE}/women-white.svg", f"{DEMO_ASSET_URL_BASE}/women-black.svg"],
    },
    "kids-shoes": {
        "Black": [f"{DEMO_ASSET_URL_BASE}/kids-black.svg", f"{DEMO_ASSET_URL_BASE}/kids-blue.svg"],
        "Blue": [f"{DEMO_ASSET_URL_BASE}/kids-blue.svg", f"{DEMO_ASSET_URL_BASE}/kids-black.svg"],
        "Pink": [f"{DEMO_ASSET_URL_BASE}/kids-pink.svg", f"{DEMO_ASSET_URL_BASE}/kids-white.svg"],
    },
    "sneakers": {
        "Black": [f"{DEMO_ASSET_URL_BASE}/sneaker-black.svg", f"{DEMO_ASSET_URL_BASE}/sneaker-blue.svg"],
        "Blue": [f"{DEMO_ASSET_URL_BASE}/sneaker-blue.svg", f"{DEMO_ASSET_URL_BASE}/sneaker-white.svg"],
        "White": [f"{DEMO_ASSET_URL_BASE}/sneaker-white.svg", f"{DEMO_ASSET_URL_BASE}/sneaker-black.svg"],
    },
    "sandals": {
        "Black": [f"{DEMO_ASSET_URL_BASE}/sandal-black.svg", f"{DEMO_ASSET_URL_BASE}/sandal-brown.svg"],
        "Brown": [f"{DEMO_ASSET_URL_BASE}/sandal-brown.svg", f"{DEMO_ASSET_URL_BASE}/sandal-white.svg"],
        "White": [f"{DEMO_ASSET_URL_BASE}/sandal-white.svg", f"{DEMO_ASSET_URL_BASE}/sandal-black.svg"],
    },
    "loafers": {
        "Black": [f"{DEMO_ASSET_URL_BASE}/loafer-black.svg", f"{DEMO_ASSET_URL_BASE}/loafer-brown.svg"],
        "Brown": [f"{DEMO_ASSET_URL_BASE}/loafer-brown.svg", f"{DEMO_ASSET_URL_BASE}/loafer-white.svg"],
        "White": [f"{DEMO_ASSET_URL_BASE}/loafer-white.svg", f"{DEMO_ASSET_URL_BASE}/loafer-black.svg"],
    },
}


def build_generic_products(category, count):
    name = category.name
    return [
        (f"{name} Essential One", f"Best-selling {name.lower()} item with practical comfort and daily durability.", "1990.00", "2390.00", 4.4, 55, 30),
        (f"{name} Premium Comfort", f"Premium {name.lower()} selection with refined materials and polished finish.", "2990.00", "3490.00", 4.5, 63, 38),
        (f"{name} Weekend Classic", f"Versatile {name.lower()} product for casual styling and repeat use.", "2490.00", "2990.00", 4.3, 42, 25),
        (f"{name} Pro Collection", f"Performance-focused {name.lower()} product with reliable construction.", "3490.00", "4190.00", 4.6, 71, 44),
        (f"{name} Value Pack", f"Affordable {name.lower()} option with a balanced comfort-first build.", "1490.00", "1890.00", 4.2, 36, 21),
    ][:count]


class Command(BaseCommand):
    help = "Seed realistic demo categories and products for the ecommerce store."

    def add_arguments(self, parser):
        parser.add_argument("--per-category", type=int, default=5, help="Minimum products per category. Default: 5.")

    def handle(self, *args, **options):
        per_category = max(4, options["per_category"])

        if not Category.all_objects.exists():
            for name, slug in DEFAULT_CATEGORIES:
                Category.all_objects.update_or_create(
                    slug=slug,
                    defaults={"name": name, "is_deleted": False, "deleted_at": None},
                )

        categories = list(Category.all_objects.filter(is_deleted=False).order_by("name"))
        created = 0
        updated = 0

        for category in categories:
            category_slug = category.slug
            products = CATALOG.get(category_slug) or build_generic_products(category, per_category)
            image_pool = IMAGE_POOLS.get(category_slug) or IMAGE_POOLS["sneakers"]

            for index, item in enumerate(products[:per_category]):
                name, description, price, compare_at_price, rating, review_count, sales_count = item
                slug = slugify(name)
                gallery = [image_pool[index % len(image_pool)], image_pool[(index + 1) % len(image_pool)]]
                image_name = gallery[0].split("/")[-1]
                product, was_created = Product.all_objects.update_or_create(
                    slug=slug,
                    defaults={
                        "category": category,
                        "name": name,
                        "price": Decimal(price),
                        "compare_at_price": Decimal(compare_at_price),
                        "stock": 18 + (index * 7),
                        "image": f"{DEMO_ASSET_STORAGE_BASE}/{image_name}",
                        "gallery": gallery[1:],
                        "description": description,
                        "rating": Decimal(str(rating)),
                        "review_count": review_count,
                        "sales_count": sales_count,
                        "is_featured": index < 2,
                        "is_active": True,
                        "is_deleted": False,
                        "deleted_at": None,
                    },
                )
                created += int(was_created)
                updated += int(not was_created)
                self.seed_variants(product, category_slug, index)

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: {len(categories)} categories, {created} products created, {updated} products updated."
        ))

    def seed_variants(self, product, category_slug, index):
        if category_slug == "kids-shoes":
            variants = [("Size", value, 10 + index) for value in ("28", "30", "32", "34")]
            variants += [("Color", value, 12 + index) for value in ("Black", "Blue", "Pink")]
        elif category_slug == "womens-shoes":
            variants = [("Size", value, 8 + index) for value in ("36", "37", "38", "39", "40")]
            variants += [("Color", value, 10 + index) for value in ("Black", "Pink", "White")]
        elif category_slug == "sneakers":
            variants = [("Size", value, 8 + index) for value in ("39", "40", "41", "42", "43")]
            variants += [("Color", value, 10 + index) for value in ("Black", "Blue", "White")]
        else:
            variants = [("Size", value, 8 + index) for value in ("39", "40", "41", "42", "43")]
            variants += [("Color", value, 10 + index) for value in ("Black", "Brown", "White")]

        product.variants.all().delete()

        for name, value, stock in variants:
            ProductVariant.objects.update_or_create(
                product=product,
                name=name,
                value=value,
                defaults={
                    "stock": stock,
                    "gallery": COLOR_IMAGE_POOLS.get(category_slug, {}).get(value, [])[:2] if name == "Color" else [],
                },
            )

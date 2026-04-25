from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from .models import Category, Product


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class ProductApiTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name="Shoes", slug="shoes")
        Product.objects.create(category=category, name="Runner", slug="runner", price="49.99", stock=5, description="Light shoes", rating="4.50")

    def test_product_list_search(self):
        response = self.client.get("/api/products/?search=runner")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_admin_can_create_product(self):
        user = get_user_model().objects.create_superuser("admin", "admin@example.com", "password123")
        self.client.force_authenticate(user)
        category = Category.objects.first()
        response = self.client.post("/api/products/", {
            "category_id": category.id,
            "name": "Boot",
            "slug": "boot",
            "price": "89.99",
            "stock": 3,
            "description": "Trail boot",
            "rating": "4.00",
            "is_active": True,
        })
        self.assertEqual(response.status_code, 201)

    def test_invalid_variant_stock_returns_400(self):
        user = get_user_model().objects.create_superuser("admin2", "admin2@example.com", "password123")
        self.client.force_authenticate(user)
        category = Category.objects.first()
        response = self.client.post("/api/products/", {
            "category_id": category.id,
            "name": "Bad Variant Product",
            "slug": "bad-variant-product",
            "price": "89.99",
            "stock": 3,
            "description": "Trail boot",
            "variants_input": '[{"upload_key":"row1","name":"Color","value":"Black","stock":"oops"}]',
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("variants_input", response.data)

    def test_admin_can_reorder_products(self):
        user = get_user_model().objects.create_superuser("admin3", "admin3@example.com", "password123")
        self.client.force_authenticate(user)
        category = Category.objects.first()
        second = Product.objects.create(category=category, name="Loafer", slug="loafer", price="59.99", stock=8, description="Loafer")
        third = Product.objects.create(category=category, name="Sneaker", slug="sneaker", price="69.99", stock=10, description="Sneaker")

        response = self.client.post("/api/products/reorder/", {
            "ordered_slugs": [third.slug, second.slug, "runner"],
        }, format="json")

        self.assertEqual(response.status_code, 200)
        ordered = list(Product.objects.values_list("slug", flat=True))
        self.assertEqual(ordered, [third.slug, second.slug, "runner"])

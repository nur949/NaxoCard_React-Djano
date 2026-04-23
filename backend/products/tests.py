from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Category, Product


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

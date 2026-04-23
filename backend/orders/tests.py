from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from products.models import Category, Product


class CartOrderApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("buyer", "buyer@example.com", "password123")
        category = Category.objects.create(name="Tech", slug="tech")
        self.product = Product.objects.create(category=category, name="Keyboard", slug="keyboard", price="20.00", stock=10, description="Mechanical")
        self.client.force_authenticate(self.user)

    def test_add_to_cart_and_create_order(self):
        cart_response = self.client.post("/api/cart/add/", {"product_id": self.product.id, "quantity": 2})
        self.assertEqual(cart_response.status_code, 200)
        order_response = self.client.post("/api/orders/", {"shipping_address": "123 Main St"})
        self.assertEqual(order_response.status_code, 201)
        self.assertEqual(order_response.data["total"], "40.00")

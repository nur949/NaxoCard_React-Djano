from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from orders.models import Order
from products.models import Category, Product


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
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

    def test_guest_can_create_cod_order_without_auth(self):
        self.client.force_authenticate(user=None)
        order_response = self.client.post(
            "/api/orders/",
            {
                "guest_name": "Guest Buyer",
                "guest_email": "guest@example.com",
                "guest_phone": "01700000000",
                "shipping_address": "House 10, Road 5, Dhaka",
                "payment_method": "cod",
                "items_payload": [{"product_id": self.product.id, "quantity": 1}],
            },
            format="json",
        )
        self.assertEqual(order_response.status_code, 201)
        self.assertEqual(order_response.data["payment_method"], "cod")
        self.assertEqual(order_response.data["total"], "20.00")
        self.assertIsNone(Order.objects.get(pk=order_response.data["id"]).user)

    def test_admin_can_update_order_status_without_create_validation(self):
        admin = get_user_model().objects.create_superuser("admin", "admin@example.com", "password123")
        order = Order.objects.create(
            user=self.user,
            shipping_address="123 Main St",
            total="20.00",
            status=Order.Status.PENDING,
        )

        self.client.force_authenticate(admin)
        response = self.client.patch(f"/api/orders/{order.id}/", {"status": Order.Status.PROCESSING}, format="json")

        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PROCESSING)

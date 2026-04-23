from django.db import transaction
from rest_framework import serializers

from products.models import Product
from products.serializers import ProductSerializer
from users.models import LoyaltyTransaction
from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True), source="product", write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity", "subtotal")

    def validate(self, attrs):
        product = attrs.get("product", getattr(self.instance, "product", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        if quantity < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        if product and quantity > product.stock:
            raise serializers.ValidationError("Quantity exceeds available stock.")
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total", "updated_at")


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "price", "quantity", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "status", "total", "shipping_address", "stripe_session_id", "items", "is_deleted", "deleted_at", "created_at")
        read_only_fields = ("id", "total", "stripe_session_id", "items", "is_deleted", "deleted_at", "created_at")

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart = Cart.objects.prefetch_related("items__product").get(user=user)
        if not cart.items.exists():
            raise serializers.ValidationError("Cart is empty.")
        order = Order.objects.create(user=user, total=cart.total, **validated_data)
        for item in cart.items.all():
            product = item.product
            if item.quantity > product.stock:
                raise serializers.ValidationError(f"{product.name} has insufficient stock.")
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price=product.price,
                quantity=item.quantity,
            )
            product.stock -= item.quantity
            product.save(update_fields=["stock"])
            product.sales_count += item.quantity
            product.save(update_fields=["sales_count"])
        earned_points = int(order.total)
        if earned_points > 0:
            user.loyalty_points += earned_points
            user.lifetime_points += earned_points
            user.update_loyalty_tier()
            user.save(update_fields=["loyalty_points", "lifetime_points", "loyalty_tier"])
            LoyaltyTransaction.objects.create(
                user=user,
                points=earned_points,
                transaction_type=LoyaltyTransaction.Type.EARN,
                description=f"Earned from order #{order.id}",
                order_id=order.id,
            )
        cart.items.all().delete()
        return order

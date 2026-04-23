import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import decorators, permissions, response, status, views, viewsets

from .models import Cart, CartItem, Order
from .permissions import IsOwnerOrAdmin
from .serializers import CartItemSerializer, CartSerializer, OrderSerializer


class CartViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer

    def get_cart(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request):
        return response.Response(self.get_serializer(self.get_cart()).data)

    @decorators.action(detail=False, methods=["post"])
    def add(self, request):
        cart = self.get_cart()
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity += quantity
            if item.quantity > product.stock:
                return response.Response({"detail": "Quantity exceeds available stock."}, status=status.HTTP_400_BAD_REQUEST)
            item.save()
        return response.Response(CartSerializer(cart, context={"request": request}).data, status=status.HTTP_200_OK)

    @decorators.action(detail=False, methods=["patch"], url_path="items/(?P<item_id>[^/.]+)")
    def update_item(self, request, item_id=None):
        item = get_object_or_404(self.get_cart().items, id=item_id)
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(CartSerializer(self.get_cart(), context={"request": request}).data)

    @decorators.action(detail=False, methods=["post"], url_path="items/(?P<item_id>[^/.]+)/set")
    def set_item_quantity(self, request, item_id=None):
        item = get_object_or_404(self.get_cart().items, id=item_id)
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(CartSerializer(self.get_cart(), context={"request": request}).data)

    @decorators.action(detail=False, methods=["delete"], url_path="items/(?P<item_id>[^/.]+)")
    def remove_item(self, request, item_id=None):
        self.get_cart().items.filter(id=item_id).delete()
        return response.Response(CartSerializer(self.get_cart(), context={"request": request}).data, status=status.HTTP_200_OK)

    @decorators.action(detail=False, methods=["delete"])
    def clear(self, request):
        self.get_cart().items.all().delete()
        return response.Response(CartSerializer(self.get_cart(), context={"request": request}).data, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    ordering_fields = ["created_at", "status"]

    def get_queryset(self):
        base = Order.all_objects if self.action in ["trash", "restore", "clean_trash"] else Order.objects
        queryset = base.prefetch_related("items").all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def perform_destroy(self, instance):
        instance.delete()

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def trash(self, request):
        orders = Order.all_objects.deleted().prefetch_related("items")
        page = self.paginate_queryset(orders)
        serializer = self.get_serializer(page or orders, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, pk=None):
        order = self.get_object()
        order.restore()
        return response.Response(self.get_serializer(order).data)

    @decorators.action(detail=False, methods=["delete"], permission_classes=[permissions.IsAdminUser])
    def clean_trash(self, request):
        count = Order.all_objects.deleted().count()
        for order in Order.all_objects.deleted():
            order.hard_delete()
        return response.Response({"deleted": count})


class StripeCheckoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        order = Order.objects.filter(user=request.user).order_by("-created_at").first()
        if not order:
            return response.Response({"detail": "Create an order before payment."}, status=status.HTTP_400_BAD_REQUEST)
        if not settings.STRIPE_SECRET_KEY:
            return response.Response({"detail": "Stripe is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": f"Order #{order.id}"},
                        "unit_amount": int(order.total * 100),
                    },
                    "quantity": 1,
                }
            ],
            success_url=f"{settings.FRONTEND_URL}/orders?payment=success",
            cancel_url=f"{settings.FRONTEND_URL}/checkout?payment=cancelled",
            metadata={"order_id": order.id},
        )
        order.stripe_session_id = session.id
        order.save(update_fields=["stripe_session_id"])
        return response.Response({"checkout_url": session.url})

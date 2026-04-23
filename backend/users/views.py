from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import decorators, generics, permissions, response, status, views, viewsets

from orders.models import Order
from products.models import Product

from .models import AdminActivityLog, LoyaltyTransaction
from .serializers import AdminActivityLogSerializer, AdminUserSerializer, LoyaltyAdjustSerializer, LoyaltyTransactionSerializer, PasswordChangeSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


def log_admin_activity(request, action, target_type, description, target_id="", metadata=None):
    if not request.user or not request.user.is_authenticated or not request.user.is_staff:
        return
    AdminActivityLog.objects.create(
        actor=request.user,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        description=description,
        metadata=metadata or {},
    )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_parser_classes(self):
        return super().get_parser_classes()

    def get_object(self):
        return self.request.user


class PasswordChangeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response({"detail": "Password updated."}, status=status.HTTP_200_OK)


class LoyaltyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transactions = LoyaltyTransaction.objects.filter(user=request.user)[:20]
        return response.Response({
            "summary": UserSerializer(request.user).data,
            "transactions": LoyaltyTransactionSerializer(transactions, many=True).data,
        })


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["username", "email", "first_name", "last_name", "phone"]
    ordering_fields = ["date_joined", "loyalty_points", "lifetime_points"]

    def get_queryset(self):
        queryset = self.serializer_class.Meta.model.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        if role == "admin":
            queryset = queryset.filter(is_staff=True)
        elif role == "user":
            queryset = queryset.filter(is_staff=False)
        status_filter = self.request.query_params.get("status")
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)
        return queryset

    def perform_update(self, serializer):
        previous = {field: getattr(serializer.instance, field) for field in ["is_staff", "is_active", "phone", "city", "country"]}
        updated = serializer.save()
        changes = {}
        for field in ["is_staff", "is_active", "phone", "city", "country"]:
            old_value = previous[field]
            new_value = getattr(updated, field)
            if old_value != new_value:
                changes[field] = {"from": old_value, "to": new_value}
        if changes:
            log_admin_activity(
                self.request,
                "user.updated",
                "user",
                f"Updated {updated.username}",
                target_id=updated.pk,
                metadata=changes,
            )

    def perform_destroy(self, instance):
        username = instance.username
        user_id = instance.pk
        instance.delete()
        log_admin_activity(self.request, "user.deleted", "user", f"Deleted {username}", target_id=user_id)

    @decorators.action(detail=True, methods=["post"])
    def adjust_points(self, request, pk=None):
        user = self.get_object()
        serializer = LoyaltyAdjustSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        points = serializer.validated_data["points"]
        user.loyalty_points = max(user.loyalty_points + points, 0)
        if points > 0:
            user.lifetime_points += points
        user.update_loyalty_tier()
        user.save(update_fields=["loyalty_points", "lifetime_points", "loyalty_tier"])
        LoyaltyTransaction.objects.create(
            user=user,
            points=points,
            transaction_type=LoyaltyTransaction.Type.ADJUST,
            description=serializer.validated_data["description"],
        )
        log_admin_activity(
            request,
            "loyalty.adjusted",
            "user",
            f"Adjusted loyalty for {user.username}",
            target_id=user.pk,
            metadata={"points": points, "description": serializer.validated_data["description"]},
        )
        return response.Response(AdminUserSerializer(user).data)


class AdminDashboardAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        recent_orders = Order.objects.filter(created_at__gte=now - timedelta(days=30))
        recent_users = User.objects.filter(date_joined__gte=now - timedelta(days=30))
        status_counts = Order.objects.values("status").annotate(total=Count("id")).order_by("status")
        sales_line = list(
            recent_orders.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(total_sales=Sum("total"), total_orders=Count("id"))
            .order_by("day")
        )
        user_growth = list(
            recent_users.annotate(day=TruncDate("date_joined"))
            .values("day")
            .annotate(total_users=Count("id"))
            .order_by("day")
        )
        revenue_total = Order.objects.filter(status__in=["paid", "processing", "shipped", "delivered"]).aggregate(total=Sum("total"))["total"] or 0
        totals = {
            "users": User.objects.count(),
            "products": Product.objects.count(),
            "orders": Order.objects.count(),
            "revenue": revenue_total,
        }
        recent_activity = AdminActivityLogSerializer(AdminActivityLog.objects.select_related("actor")[:8], many=True).data
        return response.Response({
            "totals": totals,
            "sales_line": sales_line,
            "orders_by_status": list(status_counts),
            "revenue_breakdown": [
                {"name": "Completed", "value": float(revenue_total)},
                {"name": "Pending", "value": float(Order.objects.filter(status="pending").aggregate(total=Sum("total"))["total"] or 0)},
                {"name": "Canceled", "value": float(Order.objects.filter(status="canceled").aggregate(total=Sum("total"))["total"] or 0)},
            ],
            "user_growth": user_growth,
            "recent_activity": recent_activity,
        })


class AdminActivityLogView(generics.ListAPIView):
    serializer_class = AdminActivityLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return AdminActivityLog.objects.select_related("actor").all()

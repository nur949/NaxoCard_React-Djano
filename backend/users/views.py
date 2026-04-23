from rest_framework import decorators, generics, permissions, response, status, views, viewsets

from .models import LoyaltyTransaction
from .serializers import AdminUserSerializer, LoyaltyAdjustSerializer, LoyaltyTransactionSerializer, PasswordChangeSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        return self.serializer_class.Meta.model.objects.all().order_by("-date_joined")

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
        return response.Response(AdminUserSerializer(user).data)

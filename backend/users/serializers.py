from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()

from .models import LoyaltyTransaction


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    next_tier_points = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "address",
            "city",
            "postal_code",
            "country",
            "is_staff",
            "loyalty_points",
            "lifetime_points",
            "loyalty_tier",
            "next_tier_points",
        )
        read_only_fields = ("id", "username", "email", "is_staff", "loyalty_points", "lifetime_points", "loyalty_tier", "next_tier_points")

    def get_next_tier_points(self, obj):
        thresholds = {"bronze": 1000, "silver": 2500, "gold": 5000, "platinum": obj.lifetime_points}
        return max(thresholds.get(obj.loyalty_tier, 1000) - obj.lifetime_points, 0)


class AdminUserSerializer(serializers.ModelSerializer):
    next_tier_points = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "city",
            "country",
            "is_active",
            "is_staff",
            "date_joined",
            "loyalty_points",
            "lifetime_points",
            "loyalty_tier",
            "next_tier_points",
        )
        read_only_fields = ("id", "username", "email", "date_joined", "lifetime_points", "next_tier_points")

    def get_next_tier_points(self, obj):
        return UserSerializer().get_next_tier_points(obj)


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = LoyaltyTransaction
        fields = ("id", "user", "user_name", "points", "transaction_type", "description", "order_id", "created_at")
        read_only_fields = ("id", "user_name", "created_at")


class LoyaltyAdjustSerializer(serializers.Serializer):
    points = serializers.IntegerField()
    description = serializers.CharField(max_length=255)

    def validate_points(self, value):
        if value == 0:
            raise serializers.ValidationError("Points must not be zero.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context["request"].user)
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user

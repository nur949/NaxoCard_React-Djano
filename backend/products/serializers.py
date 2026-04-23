from rest_framework import serializers

from .models import Category, Product, ProductReview, ProductVariant, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "value", "stock")


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ProductReview
        fields = ("id", "user_name", "rating", "title", "comment", "created_at")
        read_only_fields = ("id", "user_name", "created_at")


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False, allow_null=True
    )
    is_wishlisted = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "category_id",
            "name",
            "slug",
            "price",
            "compare_at_price",
            "discount_percent",
            "stock",
            "image",
            "gallery",
            "description",
            "rating",
            "review_count",
            "sales_count",
            "is_featured",
            "is_active",
            "is_deleted",
            "deleted_at",
            "is_wishlisted",
            "variants",
            "reviews",
            "created_at",
        )
        read_only_fields = ("created_at", "is_wishlisted", "is_deleted", "deleted_at")

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Wishlist.objects.filter(user=request.user, product=obj).exists()

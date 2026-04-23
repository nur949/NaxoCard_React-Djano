import json

from django.core.files.storage import default_storage
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
    variants_input = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
            "variants_input",
            "reviews",
            "created_at",
        )
        read_only_fields = ("created_at", "is_wishlisted", "is_deleted", "deleted_at")

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Wishlist.objects.filter(user=request.user, product=obj).exists()

    def validate_variants_input(self, value):
        if not value:
            return []
        try:
            rows = json.loads(value)
        except json.JSONDecodeError as exc:
            raise serializers.ValidationError("Invalid variant payload.") from exc
        if not isinstance(rows, list):
            raise serializers.ValidationError("Variants must be a list.")
        cleaned = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            name = str(row.get("name", "")).strip()
            value = str(row.get("value", "")).strip()
            stock = row.get("stock", 0)
            if not name or not value:
                continue
            cleaned.append({
                "name": name,
                "value": value,
                "stock": max(int(stock or 0), 0),
            })
        return cleaned

    def create(self, validated_data):
        variants = validated_data.pop("variants_input", [])
        product = super().create(validated_data)
        self._sync_gallery(product)
        self._sync_variants(product, variants)
        return product

    def update(self, instance, validated_data):
        variants = validated_data.pop("variants_input", None)
        product = super().update(instance, validated_data)
        self._sync_gallery(product)
        if variants is not None:
            self._sync_variants(product, variants)
        return product

    def _sync_gallery(self, product):
        request = self.context.get("request")
        if not request:
            return
        uploaded = []
        if request.FILES.get("image"):
            uploaded.append(request.FILES["image"])
        uploaded.extend(request.FILES.getlist("gallery_files"))
        if not uploaded:
            return

        uploaded = uploaded[:5]
        saved_paths = []
        saved_urls = []
        for file in uploaded:
            path = default_storage.save(f"products/{file.name}", file)
            saved_paths.append(path)
            saved_urls.append(default_storage.url(path))

        product.image = saved_paths[0]
        product.gallery = saved_urls[1:]
        product.save(update_fields=["image", "gallery", "updated_at"])

    def _sync_variants(self, product, variants):
        product.variants.all().delete()
        ProductVariant.objects.bulk_create(
            [ProductVariant(product=product, **variant) for variant in variants]
        )

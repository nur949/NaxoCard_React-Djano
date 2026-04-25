import json

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.storage import default_storage
from django.db.models import Max
from rest_framework import serializers

from .models import Category, Product, ProductReview, ProductVariant, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "value", "stock", "gallery")


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
            "sort_order",
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
            try:
                stock_value = max(int(stock or 0), 0)
            except (TypeError, ValueError) as exc:
                raise serializers.ValidationError(f"Variant stock for {name} / {value} must be a valid number.") from exc
            cleaned.append({
                "name": name,
                "value": value,
                "stock": stock_value,
                "gallery": row.get("gallery", []) if isinstance(row.get("gallery", []), list) else [],
                "upload_key": str(row.get("upload_key", "")).strip(),
            })
        return cleaned

    def validate_sort_order(self, value):
        if value is None:
            return value
        if value < 0:
            raise serializers.ValidationError("Sort order cannot be negative.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context.get("request")
        image_file = request.FILES.get("image") if request else None
        if image_file:
            self._validate_uploaded_image(image_file, field_name="image")
        if request:
            for gallery_file in request.FILES.getlist("gallery_files"):
                self._validate_uploaded_image(gallery_file, field_name="gallery_files")
            variants = attrs.get("variants_input", [])
            for variant in variants:
                upload_key = variant.get("upload_key")
                if not upload_key:
                    continue
                files = request.FILES.getlist(f"variant_gallery_files_{upload_key}")
                for gallery_file in files:
                    self._validate_uploaded_image(gallery_file, field_name=f"variant_gallery_files_{upload_key}")
        return attrs

    def create(self, validated_data):
        variants = validated_data.pop("variants_input", [])
        if validated_data.get("sort_order") in (None, ""):
            max_sort_order = Product.all_objects.aggregate(max_value=Max("sort_order"))["max_value"] or 0
            validated_data["sort_order"] = max_sort_order + 1
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
        existing_gallery = list(product.gallery or [])
        product.gallery = saved_urls[1:] or existing_gallery
        product.save(update_fields=["image", "gallery", "updated_at"])

    def _sync_variants(self, product, variants):
        product.variants.all().delete()
        request = self.context.get("request")
        rows = []
        for variant in variants:
            uploaded_gallery = []
            if request and variant.get("upload_key"):
                files = request.FILES.getlist(f"variant_gallery_files_{variant['upload_key']}")
                for file in files[:5]:
                    path = default_storage.save(f"products/variants/{file.name}", file)
                    uploaded_gallery.append(default_storage.url(path))
            rows.append(ProductVariant(
                product=product,
                name=variant["name"],
                value=variant["value"],
                stock=variant["stock"],
                gallery=uploaded_gallery or variant.get("gallery", [])[:5],
            ))
        ProductVariant.objects.bulk_create(rows)

    def _validate_uploaded_image(self, file, field_name):
        try:
            file.seek(0)
            if hasattr(file, "image"):
                file.image.verify()
            file.seek(0)
        except (AttributeError, OSError, DjangoValidationError) as exc:
            raise serializers.ValidationError({field_name: "Upload a valid image file."}) from exc

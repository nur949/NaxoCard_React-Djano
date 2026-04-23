from django.db.models import Avg, F, Q
from django_filters import rest_framework as filters
from rest_framework import decorators, permissions, response, status, viewsets

from users.models import AdminActivityLog

from .models import Category, Product, ProductReview, Wishlist
from .permissions import IsAdminOrReadOnly
from .serializers import CategorySerializer, ProductReviewSerializer, ProductSerializer


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


class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_rating = filters.NumberFilter(field_name="rating", lookup_expr="gte")
    category = filters.CharFilter(field_name="category__slug")
    in_stock = filters.BooleanFilter(method="filter_in_stock")
    featured = filters.BooleanFilter(field_name="is_featured")
    on_sale = filters.BooleanFilter(method="filter_on_sale")

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset

    def filter_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(compare_at_price__isnull=False, compare_at_price__gt=F("price"))
        return queryset

    class Meta:
        model = Product
        fields = ["category", "min_price", "max_price", "min_rating", "in_stock", "featured", "on_sale"]


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        if self.action in ["trash", "restore", "clean_trash"]:
            return Category.all_objects.all()
        return Category.objects.all()

    def perform_destroy(self, instance):
        slug = instance.slug
        instance.delete()
        log_admin_activity(self.request, "category.deleted", "category", f"Deleted category {instance.name}", target_id=slug)

    def perform_create(self, serializer):
        category = serializer.save()
        log_admin_activity(self.request, "category.created", "category", f"Created category {category.name}", target_id=category.slug)

    def perform_update(self, serializer):
        category = serializer.save()
        log_admin_activity(self.request, "category.updated", "category", f"Updated category {category.name}", target_id=category.slug)

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def trash(self, request):
        serializer = self.get_serializer(Category.all_objects.deleted(), many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, slug=None):
        category = self.get_object()
        category.restore()
        return response.Response(self.get_serializer(category).data)

    @decorators.action(detail=False, methods=["delete"], permission_classes=[permissions.IsAdminUser])
    def clean_trash(self, request):
        count = Category.all_objects.deleted().count()
        for category in Category.all_objects.deleted():
            category.hard_delete()
        return response.Response({"deleted": count})


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["price", "rating", "created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        base = Product.all_objects if self.action in ["trash", "restore", "clean_trash"] else Product.objects
        queryset = base.select_related("category").prefetch_related("variants", "reviews").all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(Q(name__icontains=q) | Q(description__icontains=q))
        return queryset

    def perform_destroy(self, instance):
        slug = instance.slug
        instance.delete()
        log_admin_activity(self.request, "product.deleted", "product", f"Deleted product {instance.name}", target_id=slug)

    def perform_create(self, serializer):
        product = serializer.save()
        log_admin_activity(self.request, "product.created", "product", f"Created product {product.name}", target_id=product.slug)

    def perform_update(self, serializer):
        product = serializer.save()
        log_admin_activity(self.request, "product.updated", "product", f"Updated product {product.name}", target_id=product.slug)

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def trash(self, request):
        products = Product.all_objects.deleted().select_related("category")
        page = self.paginate_queryset(products)
        serializer = self.get_serializer(page or products, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, slug=None):
        product = self.get_object()
        product.restore()
        return response.Response(self.get_serializer(product).data)

    @decorators.action(detail=False, methods=["delete"], permission_classes=[permissions.IsAdminUser])
    def clean_trash(self, request):
        count = Product.all_objects.deleted().count()
        for product in Product.all_objects.deleted():
            product.hard_delete()
        return response.Response({"deleted": count})

    @decorators.action(detail=False, methods=["get"])
    def featured(self, request):
        products = self.get_queryset().filter(Q(is_featured=True) | Q(sales_count__gt=0)).order_by("-is_featured", "-sales_count", "-rating")[:12]
        return response.Response(self.get_serializer(products, many=True).data)

    @decorators.action(detail=False, methods=["get"])
    def suggest(self, request):
        q = request.query_params.get("q", "").strip()
        if len(q) < 2:
            return response.Response([])
        products = self.get_queryset().filter(Q(name__icontains=q) | Q(category__name__icontains=q))[:8]
        data = []
        for product in products:
            image = request.build_absolute_uri(product.image.url) if product.image else ""
            if not image and product.gallery:
                image = product.gallery[0]
            data.append({
                "name": product.name,
                "slug": product.slug,
                "price": product.price,
                "image": image,
                "category": product.category.name if product.category else "",
            })
        return response.Response(data)

    @decorators.action(detail=True, methods=["get"])
    def related(self, request, slug=None):
        product = self.get_object()
        products = self.get_queryset().filter(category=product.category).exclude(pk=product.pk)[:8]
        return response.Response(self.get_serializer(products, many=True).data)

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def wishlist(self, request, slug=None):
        product = self.get_object()
        item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.delete()
        return response.Response({"wishlisted": created}, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, slug=None):
        product = self.get_object()
        serializer = ProductReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review, _ = ProductReview.objects.update_or_create(
            product=product,
            user=request.user,
            defaults=serializer.validated_data,
        )
        approved = product.reviews.filter(is_approved=True)
        aggregate = approved.aggregate(avg=Avg("rating"))
        product.rating = aggregate["avg"] or 0
        product.review_count = approved.count()
        product.save(update_fields=["rating", "review_count"])
        return response.Response(ProductReviewSerializer(review).data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def wishlist_items(self, request):
        products = Product.objects.filter(wishlisted_by__user=request.user).select_related("category")
        page = self.paginate_queryset(products)
        serializer = self.get_serializer(page or products, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return response.Response(serializer.data)

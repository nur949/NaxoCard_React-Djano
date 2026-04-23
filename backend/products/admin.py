from django.contrib import admin

from .models import Category, Product, ProductReview, ProductVariant, Wishlist


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ("user", "rating", "title", "comment", "created_at")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "rating", "review_count", "sales_count", "is_featured", "is_active")
    list_filter = ("category", "is_featured", "is_active")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductVariantInline, ProductReviewInline]


admin.site.register(Wishlist)
admin.site.register(ProductReview)

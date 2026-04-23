from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import LoyaltyTransaction, User


class LoyaltyTransactionInline(admin.TabularInline):
    model = LoyaltyTransaction
    extra = 0
    readonly_fields = ("points", "transaction_type", "description", "order_id", "created_at")


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("phone", "address", "city", "postal_code", "country")}),
        ("Loyalty", {"fields": ("loyalty_points", "lifetime_points", "loyalty_tier")}),
    )
    list_display = ("username", "email", "is_staff", "loyalty_tier", "loyalty_points", "date_joined")
    list_filter = ("is_staff", "is_active", "loyalty_tier")
    inlines = [LoyaltyTransactionInline]


@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "points", "transaction_type", "description", "order_id", "created_at")
    list_filter = ("transaction_type", "created_at")
    search_fields = ("user__username", "user__email", "description")

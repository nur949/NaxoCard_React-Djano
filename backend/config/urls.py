from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from orders.views import CartViewSet, OrderViewSet, StripeCheckoutView
from products.views import CategoryViewSet, ProductViewSet
from users.views import AdminUserViewSet, LoyaltyView, PasswordChangeView, RegisterView, UserProfileView

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("cart", CartViewSet, basename="cart")
router.register("orders", OrderViewSet, basename="order")
router.register("admin/users", AdminUserViewSet, basename="admin-users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/profile/", UserProfileView.as_view(), name="profile"),
    path("api/auth/password/", PasswordChangeView.as_view(), name="password_change"),
    path("api/auth/loyalty/", LoyaltyView.as_view(), name="loyalty"),
    path("api/checkout/stripe/", StripeCheckoutView.as_view(), name="stripe_checkout"),
    path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

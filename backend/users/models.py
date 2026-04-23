from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class LoyaltyTier(models.TextChoices):
        BRONZE = "bronze", "Bronze"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"
        PLATINUM = "platinum", "Platinum"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=80, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0)
    lifetime_points = models.PositiveIntegerField(default=0)
    loyalty_tier = models.CharField(max_length=20, choices=LoyaltyTier.choices, default=LoyaltyTier.BRONZE)

    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username

    def update_loyalty_tier(self):
        if self.lifetime_points >= 5000:
            self.loyalty_tier = self.LoyaltyTier.PLATINUM
        elif self.lifetime_points >= 2500:
            self.loyalty_tier = self.LoyaltyTier.GOLD
        elif self.lifetime_points >= 1000:
            self.loyalty_tier = self.LoyaltyTier.SILVER
        else:
            self.loyalty_tier = self.LoyaltyTier.BRONZE


class LoyaltyTransaction(models.Model):
    class Type(models.TextChoices):
        EARN = "earn", "Earn"
        REDEEM = "redeem", "Redeem"
        ADJUST = "adjust", "Adjust"

    user = models.ForeignKey(User, related_name="loyalty_transactions", on_delete=models.CASCADE)
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=Type.choices)
    description = models.CharField(max_length=255)
    order_id = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} {self.transaction_type} {self.points}"

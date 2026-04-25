from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0003_coupon_order_discount_amount_order_coupon"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="guest_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name="order",
            name="guest_name",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="order",
            name="guest_phone",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="order",
            name="payment_method",
            field=models.CharField(choices=[("cod", "Cash on delivery"), ("stripe", "Stripe")], default="cod", max_length=20),
        ),
        migrations.AlterField(
            model_name="order",
            name="user",
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, related_name="orders", to="users.user"),
        ),
    ]

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0003_category_deleted_at_category_is_deleted_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="productvariant",
            name="gallery",
            field=models.JSONField(blank=True, default=list),
        ),
    ]

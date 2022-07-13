# Generated by Django 3.1 on 2021-01-22 20:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0043_shoppingitem_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='shoppingitem',
            name='thumbnail_image',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lstv_api_v1.image'),
        ),
    ]

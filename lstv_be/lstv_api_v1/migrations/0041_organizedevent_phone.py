# Generated by Django 3.1 on 2021-01-22 15:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0040_auto_20210122_0019'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizedevent',
            name='phone',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='lstv_api_v1.phone'),
        ),
    ]

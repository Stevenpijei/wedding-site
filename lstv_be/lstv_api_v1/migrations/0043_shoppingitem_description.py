# Generated by Django 3.1 on 2021-01-22 20:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0042_auto_20210122_1920'),
    ]

    operations = [
        migrations.AddField(
            model_name='shoppingitem',
            name='description',
            field=models.CharField(db_index=True, max_length=500, null=True),
        ),
    ]
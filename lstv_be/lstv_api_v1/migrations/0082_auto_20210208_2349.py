# Generated by Django 3.1 on 2021-02-08 23:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0081_business_card_thumbnail'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='hash_code',
            field=models.CharField(db_index=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='business',
            name='legacy_url',
            field=models.CharField(db_index=True, max_length=200),
        ),
    ]
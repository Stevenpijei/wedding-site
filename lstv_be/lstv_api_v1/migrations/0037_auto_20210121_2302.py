# Generated by Django 3.1 on 2021-01-21 23:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0036_business_business_photos'),
    ]

    operations = [
        migrations.RenameField(
            model_name='photo',
            old_name='photo_credit',
            new_name='photo_credit_or_desc',
        ),
    ]

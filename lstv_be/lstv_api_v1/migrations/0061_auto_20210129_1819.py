# Generated by Django 3.1 on 2021-01-29 18:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0060_contentsearchquery_limit_to_location'),
    ]

    operations = [
        migrations.RenameField(
            model_name='contentsearchquery',
            old_name='limit_to_location',
            new_name='limit_to_locations',
        ),
    ]
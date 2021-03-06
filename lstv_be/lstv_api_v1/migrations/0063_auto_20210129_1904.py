# Generated by Django 3.1 on 2021-01-29 19:04

from django.db import migrations
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0062_contentsearchquery_business_location_scope'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contentsearchquery',
            name='business_location_scope',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.ContentBusinessLocationScope(2), enum_class=lstv_api_v1.models.ContentBusinessLocationScope, max_length=18),
        ),
    ]

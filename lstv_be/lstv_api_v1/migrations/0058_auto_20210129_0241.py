# Generated by Django 3.1 on 2021-01-29 02:41

from django.db import migrations
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0057_auto_20210129_0109'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contentsearchquery',
            name='content_sort_method',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, enum_class=lstv_api_v1.models.ContentSearchQueryOrderType, max_length=16),
        ),
    ]

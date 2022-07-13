# Generated by Django 3.1 on 2021-02-17 14:39

from django.db import migrations
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0086_directorytype_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contentsearchquery',
            name='verbosity',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.ContentVerbosityType(1), enum_class=lstv_api_v1.models.ContentVerbosityType, max_length=14),
        ),
    ]
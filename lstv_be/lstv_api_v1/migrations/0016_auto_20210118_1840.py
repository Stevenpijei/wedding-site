# Generated by Django 3.1 on 2021-01-18 18:40

from django.db import migrations
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0015_auto_20210112_2345'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='type',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, enum_class=lstv_api_v1.models.PostTypeEnum, max_length=7),
        ),
    ]

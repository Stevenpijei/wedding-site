# Generated by Django 3.1 on 2021-01-14 01:30

from django.db import migrations
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0024_auto_20210114_0127'),
    ]

    operations = [
        migrations.AlterField(
            model_name='placealtname',
            name='type',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.PlaceType(1), enum_class=lstv_api_v1.models.PlaceAltType, max_length=10),
        ),
    ]

# Generated by Django 3.1 on 2021-01-28 00:17

from django.db import migrations
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0055_remove_contentsearchquery_initial_num_cards_desktop'),
    ]

    operations = [
        migrations.AddField(
            model_name='contentsearchquery',
            name='verbosity',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.ContentVerbosityType(1), enum_class=lstv_api_v1.models.ContentVerbosityType, max_length=4),
        ),
    ]

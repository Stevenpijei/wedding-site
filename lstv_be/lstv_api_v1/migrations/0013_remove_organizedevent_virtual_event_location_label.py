# Generated by Django 3.1 on 2021-01-12 23:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0012_auto_20210112_2325'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='organizedevent',
            name='virtual_event_location_label',
        ),
    ]

# Generated by Django 3.1 on 2021-01-12 23:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0013_remove_organizedevent_virtual_event_location_label'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizedevent',
            name='lstv_event',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='organizedevent',
            name='is_virtual',
            field=models.BooleanField(db_index=True, default=False),
        ),
    ]
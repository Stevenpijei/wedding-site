# Generated by Django 3.1 on 2021-01-11 19:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0002_auto_20210108_0153'),
    ]

    operations = [
        migrations.RenameField(
            model_name='organizedevent',
            old_name='event_date_time',
            new_name='event_start_date_time',
        ),
    ]
# Generated by Django 3.1 on 2021-01-11 19:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0004_organizedevent_event_end_date_time'),
    ]

    operations = [
        migrations.RenameField(
            model_name='organizedevent',
            old_name='tagline',
            new_name='cta_label',
        ),
    ]

# Generated by Django 3.1 on 2021-01-25 16:53

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0048_business_promo_videos'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizedevent',
            name='event_end_date',
            field=models.DateField(db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='organizedevent',
            name='event_end_time',
            field=models.TimeField(db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='organizedevent',
            name='event_start_date',
            field=models.DateField(db_index=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='organizedevent',
            name='event_start_time',
            field=models.TimeField(db_index=True, null=True),
        ),
    ]
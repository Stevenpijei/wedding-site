# Generated by Django 3.1 on 2021-01-14 01:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0022_auto_20210114_0016'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='place',
            name='alt_slug_1',
        ),
        migrations.RemoveField(
            model_name='place',
            name='alt_slug_2',
        ),
        migrations.RemoveField(
            model_name='place',
            name='alt_slug_3',
        ),
        migrations.RemoveField(
            model_name='place',
            name='alt_slug_4',
        ),
        migrations.RemoveField(
            model_name='place',
            name='alt_slug_5',
        ),
    ]
# Generated by Django 3.1 on 2021-01-12 23:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0007_merge_20210112_2303'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='organizedevent',
            name='business',
        ),
    ]

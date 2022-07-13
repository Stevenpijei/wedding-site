# Generated by Django 3.1 on 2021-03-03 19:16

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0093_message_bcc'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='bcc',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(db_index=True, max_length=50, null=True), null=True, size=None),
        ),
    ]

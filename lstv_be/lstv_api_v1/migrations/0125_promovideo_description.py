# Generated by Django 3.1 on 2021-04-27 23:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0124_auto_20210427_2312'),
    ]

    operations = [
        migrations.AddField(
            model_name='promovideo',
            name='description',
            field=models.TextField(db_index=True, max_length=500, null=True),
        ),
    ]
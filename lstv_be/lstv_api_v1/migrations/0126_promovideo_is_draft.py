# Generated by Django 3.1 on 2021-04-27 23:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0125_promovideo_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='promovideo',
            name='is_draft',
            field=models.BooleanField(db_index=True, default=False),
        ),
    ]

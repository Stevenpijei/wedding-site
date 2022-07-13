# Generated by Django 3.1 on 2021-01-29 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0058_auto_20210129_0241'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='businessroletype',
            options={'ordering': ['-priority', '-weight_in_videos']},
        ),
        migrations.AddField(
            model_name='businessroletype',
            name='priority',
            field=models.IntegerField(db_index=True, default=1),
        ),
    ]

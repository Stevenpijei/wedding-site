# Generated by Django 3.1 on 2021-01-14 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0026_auto_20210114_0132'),
    ]

    operations = [
        migrations.AddField(
            model_name='country',
            name='weight_photos',
            field=models.IntegerField(db_index=True, default=0),
        ),
        migrations.AddField(
            model_name='county',
            name='weight_photos',
            field=models.IntegerField(db_index=True, default=0),
        ),
        migrations.AddField(
            model_name='place',
            name='weight_photos',
            field=models.IntegerField(db_index=True, default=0),
        ),
        migrations.AddField(
            model_name='stateprovince',
            name='weight_photos',
            field=models.IntegerField(db_index=True, default=0),
        ),
    ]
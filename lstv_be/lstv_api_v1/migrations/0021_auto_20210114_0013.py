# Generated by Django 3.1 on 2021-01-14 00:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0020_remove_place_alt_slugs'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='alt_slug_1',
            field=models.CharField(db_index=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='alt_slug_2',
            field=models.CharField(db_index=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='alt_slug_3',
            field=models.CharField(db_index=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='alt_slug_4',
            field=models.CharField(db_index=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='alt_slug_5',
            field=models.CharField(db_index=True, max_length=100, null=True),
        ),
    ]

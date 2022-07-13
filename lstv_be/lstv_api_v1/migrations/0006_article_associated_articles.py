# Generated by Django 3.1 on 2021-01-11 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0005_auto_20210111_1912'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='associated_articles',
            field=models.ManyToManyField(db_table='articles_to_associated_articles', related_name='_article_associated_articles_+', to='lstv_api_v1.Article'),
        ),
    ]

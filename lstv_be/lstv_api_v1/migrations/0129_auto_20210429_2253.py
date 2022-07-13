# Generated by Django 3.1 on 2021-04-29 22:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0128_merge_20210428_1908'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='suggested_by_business',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='suggesting_business', to='lstv_api_v1.business'),
        ),
        migrations.AddField(
            model_name='business',
            name='suggested_for_video',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='suggesting_business', to='lstv_api_v1.video'),
        ),
    ]

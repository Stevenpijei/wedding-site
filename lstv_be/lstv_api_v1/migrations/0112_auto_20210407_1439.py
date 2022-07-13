# Generated by Django 3.1 on 2021-04-07 14:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0111_auto_20210407_1408'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='resourceorder',
            name='element_id',
        ),
        migrations.AddField(
            model_name='resourceorder',
            name='video',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lstv_api_v1.video'),
        ),
    ]
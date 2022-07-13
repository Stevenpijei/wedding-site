# Generated by Django 3.1 on 2021-04-26 02:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0115_auto_20210421_0408'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='businessweightedworklocationhistory',
            name='country',
        ),
        migrations.RemoveField(
            model_name='businessweightedworklocationhistory',
            name='county',
        ),
        migrations.RemoveField(
            model_name='businessweightedworklocationhistory',
            name='place',
        ),
        migrations.RemoveField(
            model_name='businessweightedworklocationhistory',
            name='state_province',
        ),
        migrations.AddField(
            model_name='businessweightedworklocationhistory',
            name='location',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lstv_api_v1.location'),
        ),
    ]
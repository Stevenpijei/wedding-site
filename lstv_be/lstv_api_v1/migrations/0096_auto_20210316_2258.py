# Generated by Django 3.1 on 2021-03-16 22:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0095_auto_20210305_1932'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='dmz_originating_business',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lstv_api_v1.business'),
        ),
        migrations.AddField(
            model_name='business',
            name='dmz_originating_video',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lstv_api_v1.video'),
        ),
    ]
# Generated by Django 3.1 on 2021-03-29 16:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0106_auto_20210329_1604'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='account_claim_code_created_at',
            field=models.DateTimeField(db_index=True, null=True),
        ),
    ]

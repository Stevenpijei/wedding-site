# Generated by Django 3.1 on 2021-03-17 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0098_business_state_reason'),
    ]

    operations = [
        migrations.AlterField(
            model_name='directorytype',
            name='role_types',
            field=models.ManyToManyField(db_table='directories_to_role_types', related_name='related_directory', to='lstv_api_v1.BusinessRoleType'),
        ),
    ]
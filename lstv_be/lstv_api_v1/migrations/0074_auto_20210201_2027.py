# Generated by Django 3.1 on 2021-02-01 20:27

from django.db import migrations, models
import enumchoicefield.fields
import lstv_api_v1.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0073_auto_20210201_1919'),
    ]

    operations = [
        migrations.CreateModel(
            name='DirectoryType',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, null=True)),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('slug', models.CharField(db_index=True, max_length=100)),
                ('priority', models.IntegerField(db_index=True, default=0)),
                ('show_in_dropdown', models.BooleanField(db_index=True, default=False)),
                ('type', enumchoicefield.fields.EnumChoiceField(db_index=True, enum_class=lstv_api_v1.models.DirectoryPageClass, max_length=8)),
                ('role_capacity_types', models.ManyToManyField(db_table='directories_to_role_capacity_types', related_name='role_capacity_types_directory', to='lstv_api_v1.VideoBusinessCapacityType')),
                ('role_types', models.ManyToManyField(db_table='role_types_directory', related_name='directories_to_role_types', to='lstv_api_v1.BusinessRoleType')),
            ],
            options={
                'db_table': 'directory_types',
                'ordering': ['show_in_dropdown', 'priority'],
            },
        ),
        migrations.DeleteModel(
            name='BusinessRoleSpeedDialType',
        ),
    ]
# Generated by Django 3.1 on 2021-02-01 21:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0074_auto_20210201_2027'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='directorytype',
            options={'ordering': ['-show_in_dropdown', 'priority']},
        ),
        migrations.RenameField(
            model_name='directorytype',
            old_name='type',
            new_name='content_type',
        ),
    ]

# Generated by Django 3.1 on 2021-05-12 18:37

from django.db import migrations, models
import enumchoicefield.fields
import lstv_api_v1.models


class Migration(migrations.Migration):

    dependencies = [
        ('lstv_api_v1', '0132_promovideo_opt_in_for_social_and_paid'),
    ]

    operations = [
        migrations.AddField(
            model_name='country',
            name='lat',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='country',
            name='long',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='country',
            name='source',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.PlaceSource(1), enum_class=lstv_api_v1.models.PlaceSource, max_length=6),
        ),
        migrations.AddField(
            model_name='county',
            name='lat',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='county',
            name='long',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='county',
            name='source',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.PlaceSource(1), enum_class=lstv_api_v1.models.PlaceSource, max_length=6),
        ),
        migrations.AddField(
            model_name='stateprovince',
            name='lat',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='stateprovince',
            name='long',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='stateprovince',
            name='source',
            field=enumchoicefield.fields.EnumChoiceField(db_index=True, default=lstv_api_v1.models.PlaceSource(1), enum_class=lstv_api_v1.models.PlaceSource, max_length=6),
        ),
    ]
from django.contrib import admin

# Register your models here.

from django.apps import apps

for model in apps.get_app_config('lstv_api_v1').models.values():
    admin.site.register(model)

from django.contrib import admin
from .models import Ministeres

class MinistereAdmin(admin.ModelAdmin):
    list_display = ('name', 'adresse', 'description')
    search_fields = ('name',)

admin.site.register(Ministeres, MinistereAdmin)
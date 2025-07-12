from django.contrib import admin
from .models import Membres

class MembresAdmin(admin.ModelAdmin):
    list_display = ('nom', 'postnom', 'prenom', 'sexe', 'contact', 'deja_baptiser', 'eglise', 'servir_avec_nous', 'besoin_de_priere', 'categorie_membres', 'ville')
    search_fields = ('nom', 'prenom', 'contact', 'eglise')
    list_filter = ('sexe', 'deja_baptiser', 'servir_avec_nous', 'besoin_de_priere', 'categorie_membres')
    ordering = ('nom', 'prenom')


admin.site.register(Membres, MembresAdmin)

from django.db import models

class Membres(models.Model):

    SEXE_CHOICES = [('Homme','homme'),('Femme', 'femme')]
    CATEGORIE = [('Membre', 'membre'), ('Visiteur', 'visiteur'), ('Ame_Evangelisee','ame_evangelisee'), ('Serviteur', 'serviteur')]

    nom = models.CharField(max_length=100)
    postnom = models.CharField(max_length=100, blank=True, null=True)
    prenom = models.CharField(max_length=100)
    sexe = models.CharField(max_length=10, choices=SEXE_CHOICES)
    contact = models.CharField(max_length=15)
    deja_baptiser = models.BooleanField(default=False)
    eglise = models.CharField(max_length=100)
    servir_avec_nous = models.BooleanField(default=False)
    besoin_de_priere = models.BooleanField(default=False)
    requete_priere = models.TextField(blank=True, null=True)
    suggestion_amelioration = models.TextField(blank=True, null=True)
    categorie_membres = models.CharField(max_length=50, choices=CATEGORIE)
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100, blank=True, null=True)
    avenue = models.CharField(max_length=100, blank=True, null=True)
    numero = models.IntegerField()

    def __str__(self):
        return f"{self.nom} {self.prenom}"

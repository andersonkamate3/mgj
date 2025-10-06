from django.db import models


class Ministeres(models.Model):
    name = models.CharField(max_length=100, null=True)
    adresse = models.CharField(max_length=200, null=True)
    description = models.TextField(blank=True, null=True)
    logos = models.ImageField(upload_to='logo/', null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f'{self.name} - {self.adresse}'
from django.shortcuts import render
from .models import Membres
import pandas as pd
import os


def home(request):

    membres = Membres.objects.all().order_by('nom')
    nombre_membres = Membres.objects.all().count()
    context={
        'membres':membres,
        'nbr_memebre':nombre_membres
    }

    return render(request, 'membres/home.html', context)
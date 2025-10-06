from django.shortcuts import render, HttpResponse

from infomgj.models import Ministeres
from .models import Membres
import pandas as pd
import openpyxl

import os


def home(request):
    ministere = Ministeres.objects.all().first()
    context = {'ministere': ministere}

    return render(request, 'membres/home.html', context)


def media(request):

    context={
       
    }

    return render(request, 'membres/media.html', context)


def program(request):

    context={
       
    }

    return render(request, 'membres/program.html', context)


def contact(request):

    context={
       
    }

    return render(request, 'membres/contact.html', context)


def apropos(request):
    membres = Membres.objects.all().order_by('nom')
    nombre_membres = Membres.objects.all().count()
    compteur = 0

    for item in membres:
        if len(item.contact)>10:
            item.contact = item.contact[:10]
            item.save()
            compteur +=1

    context={
        'membres':membres,
        'nbr_memebre':nombre_membres,
        'compteur':compteur,
    }

    return render(request, 'membres/apropos.html', context)


def admin_beta(request):
    membres = Membres.objects.all().order_by('-id')
    nombre_membres = Membres.objects.all().count()
    compteur = 0

    for item in membres:
        if len(item.contact)>10:
            item.contact = item.contact[:10]
            item.save()
            compteur +=1

    context={
        'membres':membres,
        'nbr_memebre':nombre_membres,
        'compteur':compteur,
    }

    return render(request, 'membres/admin_beta.html', context)    



#etat de sortie
def Etat_Sortie(request):
    membres = Membres.objects.all().order_by('-id')
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Liste de Membres"
    compteur = 1

    #en-tete
    ws.append(['Num', 'Nom', 'Post-nom', 'Prénom', 'Sexe', 'Contatc','categorie'])

    #donnees
    for item in membres:
        ws.append([
            compteur,
            item.nom,
            item.postnom,
            item.prenom,
            item.sexe,
            item.contact,
            item.categorie_membres
        ])
        compteur += 1

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['content-Disposition'] = 'attachment; filename="membres.xlsx"'
    wb.save(response)
    return response
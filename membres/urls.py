from django.urls import path
from . import views


app_name='membres'

urlpatterns = [
    path('', views.home, name='home'),
    path("export_excel/", views.Etat_Sortie, name="export_excel"),
    path('apropos/', views.apropos, name='apropos'),
    path('media/', views.media, name='media'),
    path('program/', views.program, name='programe'),
    path('contact/', views.contact, name='contact'),
    path('admin_beta', views.admin_beta, name='admin_beta')
]
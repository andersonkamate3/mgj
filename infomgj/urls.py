from django.urls import path
from . import views

app_name = 'infomgj'

urlpatterns = [
    path('', views.home, name='home'),
]
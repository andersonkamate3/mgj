from django.shortcuts import render
from infomgj.models import Ministeres

# Create your views here.
def home(request):
    ministere = Ministeres.objects.all().first()
    context = {'ministere': ministere}
    return render(request, 'infomgj/index_infomgj.html', context)
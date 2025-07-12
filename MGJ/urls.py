
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from MGJ.settings import DEBUG , MEDIA_ROOT, MEDIA_URL

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('membres.urls')),
]

if DEBUG:
    urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)

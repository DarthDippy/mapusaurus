from django.conf.urls import patterns, url


urlpatterns = patterns(
    '',
    url(r'^all/', 'api.views.all', name='all'),
    url(r'^hmda/', 'api.views.hmda', name='hmda'),
    url(r'^census/', 'api.views.census', name='census'),
    url(r'^tractCentroids/', 'api.views.tractCentroids', name='tractCentroids'),
)

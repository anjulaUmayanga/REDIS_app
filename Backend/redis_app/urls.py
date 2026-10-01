from django.urls import path

from .views import (
    ArticleDetailView,
    ArticleListView,
    AuthorDetailView,
    CacheFlushView,
    CachePingView,
    TrendingView,
)

urlpatterns = [
    path("articles/", ArticleListView.as_view(), name="article-list"),
    path("articles/trending/", TrendingView.as_view(), name="article-trending"),
    path("articles/<int:pk>/", ArticleDetailView.as_view(), name="article-detail"),
    path("authors/<str:name>/", AuthorDetailView.as_view(), name="author-detail"),
    path("cache/ping/", CachePingView.as_view(), name="cache-ping"),
    path("cache/flush/", CacheFlushView.as_view(), name="cache-flush"),
]

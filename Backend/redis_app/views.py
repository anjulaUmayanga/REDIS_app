from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .cache_utils import (
    KEY_PREFIX,
    LIST_NEWEST,
    LIST_VIEWS,
    TRENDING,
    _client,
    author_key,
    cache_get,
    cache_set,
    detail_key,
    get_redis_views,
    incr_views,
    invalidate_article_caches,
)
from .models import Article, Author
from .serializers import ArticleSerializer, AuthorSerializer


class ArticleListView(APIView):
    """
    GET  /api/articles/?sort=newest|most_viewed  — Redis-cached list
    POST /api/articles/                          — create + invalidate cache
    """

    def get(self, request):
        sort = request.query_params.get("sort", "newest")
        key = LIST_NEWEST if sort == "newest" else LIST_VIEWS

        cached = cache_get(key)
        if cached is not None:
            return Response({"cache": "HIT", "results": cached})

        qs = Article.objects.all()
        if sort == "most_viewed":
            qs = qs.order_by("-views", "-date")
        else:
            qs = qs.order_by("-date")

        data = ArticleSerializer(qs, many=True).data
        cache_set(key, data, timeout=60)
        return Response({"cache": "MISS", "results": data})

    def post(self, request):
        serializer = ArticleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save()
        Author.objects.get_or_create(
            name=article.author,
            defaults={"bio": ""},
        )
        invalidate_article_caches(article.id, article.author)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ArticleDetailView(APIView):
    """
    GET    /api/articles/<id>/  — Redis-cached detail; bumps view counter in Redis
    PUT    /api/articles/<id>/  — update + invalidate
    DELETE /api/articles/<id>/  — delete + invalidate
    """

    def get(self, request, pk):
        key = detail_key(pk)
        cached = cache_get(key)
        hit = "HIT" if cached is not None else "MISS"

        if cached is None:
            article = get_object_or_404(Article, pk=pk)
            data = ArticleSerializer(article).data
            # Seed Redis view counter from DB if first time
            if get_redis_views(pk) is None:
                _client().set(f"{KEY_PREFIX}:views:{pk}", article.views)
            cache_set(key, data, timeout=300)
        else:
            data = cached

        views = incr_views(pk)
        data = {**data, "views": views}

        # Soft-update DB views occasionally (keep MySQL roughly in sync)
        Article.objects.filter(pk=pk).update(views=views)

        return Response({"cache": hit, "article": data})

    def put(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        serializer = ArticleSerializer(article, data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save()
        invalidate_article_caches(pk, article.author)
        return Response(serializer.data)

    def patch(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        serializer = ArticleSerializer(article, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        article = serializer.save()
        invalidate_article_caches(pk, article.author)
        return Response(serializer.data)

    def delete(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        author = article.author
        article.delete()
        invalidate_article_caches(pk, author)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrendingView(APIView):
    """GET /api/articles/trending/ — top 5 by views, short Redis TTL."""

    def get(self, request):
        cached = cache_get(TRENDING)
        if cached is not None:
            return Response({"cache": "HIT", "results": cached})

        qs = Article.objects.order_by("-views", "-date")[:5]
        data = ArticleSerializer(qs, many=True).data
        cache_set(TRENDING, data, timeout=30)
        return Response({"cache": "MISS", "results": data})


class AuthorDetailView(APIView):
    """GET /api/authors/<name>/ — author + articles, Redis-cached."""

    def get(self, request, name):
        from urllib.parse import unquote

        name = unquote(name).strip()
        key = author_key(name)
        cached = cache_get(key)
        if cached is not None:
            return Response({"cache": "HIT", "author": cached})

        author = Author.objects.filter(name=name).first()
        articles_qs = Article.objects.filter(author=name).order_by("-date")
        if author is None and not articles_qs.exists():
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "name": author.name if author else name,
            "bio": author.bio if author else "",
            "articles": ArticleSerializer(articles_qs, many=True).data,
        }
        cache_set(key, data, timeout=300)
        return Response({"cache": "MISS", "author": data})


class CacheFlushView(APIView):
    """POST /api/cache/flush/ — clear article/list/trending cache keys (dev)."""

    def post(self, request):
        invalidate_article_caches()
        return Response({"ok": True, "message": "article list/trending caches cleared"})


class CachePingView(APIView):
    """GET /api/cache/ping/ — verify Upstash Redis connectivity."""

    def get(self, request):
        try:
            cache_set("ping", {"ok": True}, timeout=30)
            value = cache_get("ping")
            return Response({"redis": "ok", "value": value})
        except Exception as exc:
            return Response(
                {"redis": "error", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

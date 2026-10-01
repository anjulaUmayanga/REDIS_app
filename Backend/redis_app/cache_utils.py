"""
Upstash Redis REST cache helpers.

Your .env uses Upstash REST credentials:
  REDIS_URL=https://....upstash.io
  UPSTASH_REDIS_REST_TOKEN=...

So we use the official upstash-redis SDK (HTTP), not django-redis (TCP).
"""

from __future__ import annotations

import json
from typing import Any

from django.conf import settings
from upstash_redis import Redis

KEY_PREFIX = "blog"

LIST_NEWEST = "articles:list:newest"
LIST_VIEWS = "articles:list:most_viewed"
TRENDING = "articles:trending:top5"


def _client() -> Redis:
    url = settings.UPSTASH_REDIS_REST_URL
    token = settings.UPSTASH_REDIS_REST_TOKEN
    if not url or not token:
        raise RuntimeError(
            "Missing REDIS_URL or UPSTASH_REDIS_REST_TOKEN in .env "
            "(Upstash REST URL + token required)."
        )
    return Redis(url=url, token=token)


def _full_key(key: str) -> str:
    return f"{KEY_PREFIX}:{key}"


def detail_key(pk: int) -> str:
    return f"articles:detail:{pk}"


def author_key(name: str) -> str:
    return f"author:{name}:articles"


def cache_get(key: str) -> Any | None:
    """Return deserialized JSON value, or None on miss."""
    raw = _client().get(_full_key(key))
    if raw is None:
        return None
    if isinstance(raw, (dict, list)):
        return raw
    try:
        return json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return raw


def cache_set(key: str, value: Any, timeout: int = 60) -> None:
    """Store JSON-serializable value with TTL in seconds."""
    _client().set(_full_key(key), json.dumps(value), ex=timeout)


def cache_delete(*keys: str) -> None:
    if not keys:
        return
    client = _client()
    client.delete(*[_full_key(k) for k in keys])


def invalidate_article_caches(article_id: int | None = None, author: str | None = None) -> None:
    keys = [LIST_NEWEST, LIST_VIEWS, TRENDING]
    if article_id is not None:
        keys.append(detail_key(article_id))
    if author:
        keys.append(author_key(author))
    cache_delete(*keys)


def incr_views(article_id: int) -> int:
    """Atomic view counter in Redis. Returns new count."""
    return int(_client().incr(f"{KEY_PREFIX}:views:{article_id}"))


def get_redis_views(article_id: int) -> int | None:
    val = _client().get(f"{KEY_PREFIX}:views:{article_id}")
    return int(val) if val is not None else None

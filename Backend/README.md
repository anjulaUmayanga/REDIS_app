# Blog Redis API (Django + DRF + Upstash)

MySQL stores articles. Upstash Redis (REST) caches API responses and view counters.

## Setup

```bash
cd Backend
source venv/bin/activate
# .env must have DB_* + REDIS_URL (https://...) + UPSTASH_REDIS_REST_TOKEN
python manage.py migrate
python manage.py seed_articles
python manage.py runserver 8001
```

## Endpoints

| Method | Path | Cache |
|--------|------|--------|
| GET | `/api/cache/ping/` | connectivity check |
| GET | `/api/articles/?sort=newest\|most_viewed` | list TTL 60s |
| POST | `/api/articles/` | invalidates lists |
| GET | `/api/articles/<id>/` | detail TTL 300s + Redis INCR views |
| PUT/PATCH/DELETE | `/api/articles/<id>/` | invalidates caches |
| GET | `/api/articles/trending/` | top 5 TTL 30s |
| GET | `/api/authors/<name>/` | author TTL 300s |
| POST | `/api/cache/flush/` | clear list/trending keys |

Responses include `"cache": "HIT"` or `"MISS"` so you can see Redis working.

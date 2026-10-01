from django.db import models


class Article(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=120)
    date = models.DateField()
    excerpt = models.TextField()
    body = models.JSONField(default=list)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.title


class Author(models.Model):
    name = models.CharField(max_length=120, unique=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name

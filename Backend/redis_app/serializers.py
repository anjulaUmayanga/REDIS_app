from rest_framework import serializers

from .models import Article, Author


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ["id", "title", "author", "date", "excerpt", "body", "views"]


class AuthorSerializer(serializers.ModelSerializer):
    articles = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = ["name", "bio", "articles"]

    def get_articles(self, obj):
        qs = Article.objects.filter(author=obj.name).order_by("-date")
        return ArticleSerializer(qs, many=True).data

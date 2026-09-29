from django.contrib import admin
from .models import Profile, Tweet, Follow, Like, Comment


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "location", "birth_date")


@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ("author", "content", "created_at")
    search_fields = ("content", "author__username")


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("follower", "following", "created_at")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "tweet", "created_at")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "tweet", "content", "created_at")

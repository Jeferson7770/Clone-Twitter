from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Bookmark,
    Comment,
    Follow,
    Hashtag,
    Like,
    Message,
    Notification,
    Profile,
    Retweet,
    Tweet,
    TweetHashtag,
)


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ["avatar", "bio", "location", "birth_date"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    tweets_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    liked_tweets = serializers.SerializerMethodField()
    bookmarked_tweets = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "profile",
            "followers_count",
            "following_count",
            "tweets_count",
            "is_following",
            "liked_tweets",
            "bookmarked_tweets",
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_tweets_count(self, obj):
        return obj.tweets.count()

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

    def get_liked_tweets(self, obj):
        return Like.objects.filter(user=obj).values_list("tweet_id", flat=True)

    def get_bookmarked_tweets(self, obj):
        return Bookmark.objects.filter(user=obj).values_list("tweet_id", flat=True)

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.email = validated_data.get("email", instance.email)
        instance.save()

        profile, created = Profile.objects.get_or_create(user=instance)

        profile.bio = profile_data.get("bio", profile.bio)
        profile.location = profile_data.get("location", profile.location)

        birth_date = profile_data.get("birth_date")
        if birth_date is not None:
            profile.birth_date = birth_date

        avatar = profile_data.get("avatar")
        if avatar:
            profile.avatar = avatar

        profile.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "birth_date",
            "avatar",
        ]

    def create(self, validated_data):
        birth_date = validated_data.pop("birth_date", None)
        avatar = validated_data.pop("avatar", None)

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
        )

        profile = user.profile
        if birth_date:
            profile.birth_date = birth_date
        if avatar:
            profile.avatar = avatar
        profile.save()

        return user


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    liked_by = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "content",
            "parent",
            "created_at",
            "likes_count",
            "is_liked",
            "replies_count",
            "replies",
            "liked_by",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_replies_count(self, obj):
        return obj.replies.count()

    def get_replies(self, obj):
        return CommentSerializer(
            obj.replies.all(), many=True, context=self.context
        ).data

    def get_liked_by(self, obj):
        return UserSerializer(obj.likes.all(), many=True, context=self.context).data


class QuotedTweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Tweet
        fields = ["id", "content", "created_at", "author", "media", "media_type"]


class TweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    quoted_tweet = QuotedTweetSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    retweets_count = serializers.SerializerMethodField()
    bookmarks_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_retweeted = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    isRetweet = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    liked_by = serializers.SerializerMethodField()
    unique_id = serializers.SerializerMethodField()
    retweet_id = serializers.SerializerMethodField()
    retweeted_by_username = serializers.SerializerMethodField()
    retweeted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            "id",
            "author",
            "content",
            "media",
            "media_type",
            "created_at",
            "likes_count",
            "comments_count",
            "retweets_count",
            "bookmarks_count",
            "is_liked",
            "is_retweeted",
            "is_bookmarked",
            "isRetweet",
            "comments",
            "liked_by",
            "quoted_tweet",
            "unique_id",
            "retweet_id",
            "retweeted_by_username",
            "retweeted_by_name",
        ]

    def get_likes_count(self, obj):
        return getattr(obj, "likes_count", obj.likes.count())

    def get_comments_count(self, obj):
        return getattr(obj, "comments_count", obj.comments.count())

    def get_retweets_count(self, obj):
        if hasattr(obj, "retweets_count"):
            return obj.retweets_count
        retweets_convencionais = obj.retweets.count() if hasattr(obj, "retweets") else 0
        quotes = Tweet.objects.filter(quoted_tweet=obj).count()
        return retweets_convencionais + quotes

    def get_bookmarks_count(self, obj):
        return obj.bookmarked_by.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, tweet=obj).exists()
        return False

    def get_is_retweeted(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            has_retweet = (
                obj.retweets.filter(user=request.user).exists()
                if hasattr(obj, "retweets")
                else False
            )
            has_quote = Tweet.objects.filter(
                author=request.user, quoted_tweet=obj
            ).exists()
            return has_retweet or has_quote
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, tweet=obj).exists()
        return False

    def get_isRetweet(self, obj):
        return getattr(obj, "is_retweet_instance", False)

    def get_unique_id(self, obj):
        return getattr(obj, "unique_id", f"tw_{obj.id}")

    def get_retweet_id(self, obj):
        return getattr(obj, "retweet_id", None)

    def get_retweeted_by_username(self, obj):
        user = getattr(obj, "retweet_user", None)
        return user.username if user else None

    def get_retweeted_by_name(self, obj):
        user = getattr(obj, "retweet_user", None)
        if user:
            return user.first_name or user.username
        return None

    def get_comments(self, obj):
        top_level_comments = obj.comments.filter(parent__isnull=True)
        return CommentSerializer(
            top_level_comments, many=True, context=self.context
        ).data

    def get_liked_by(self, obj):
        users = [
            like.user
            for like in obj.likes.select_related("user", "user__profile").all()
        ]
        return UserSerializer(users, many=True, context=self.context).data

    def create(self, validated_data):
        media = validated_data.get("media", None)
        if media:
            if media.content_type.startswith("video"):
                validated_data["media_type"] = "video"
            else:
                validated_data["media_type"] = "image"
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="recipient", write_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "recipient",
            "recipient_id",
            "content",
            "created_at",
            "is_read",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    text = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    tweet_id = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "user",
            "text",
            "content",
            "tweet_id",
            "is_read",
            "created_at",
        ]

    def get_user(self, obj):
        request = self.context.get("request")
        avatar_url = None

        if hasattr(obj.actor, "profile") and obj.actor.profile.avatar:
            avatar_url = obj.actor.profile.avatar.url
            if request:
                avatar_url = request.build_absolute_uri(avatar_url)

        return {
            "name": obj.actor.first_name or obj.actor.username,
            "username": obj.actor.username,
            "avatar": avatar_url,
        }

    def get_text(self, obj):
        texts = {
            "like": "curtiu seu tweet",
            "comment": "respondeu ao seu tweet",
            "post": "fez um novo tweet",
            "retweet": "retweetou seu tweet",
            "follow": "começou a seguir você",
        }
        return texts.get(obj.type, "interagiu com você")

    def get_content(self, obj):
        if obj.tweet and obj.tweet.content:
            return f"{obj.tweet.content[:50]}..."
        return None

    def get_tweet_id(self, obj):
        if obj.tweet:
            return obj.tweet.id
        return None


class FavoriteTweetSerializer(serializers.ModelSerializer):
    tweet = TweetSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ["id", "user", "tweet", "created_at"]


class BookmarkSerializer(serializers.ModelSerializer):
    tweet = TweetSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "tweet", "created_at"]


class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = "__all__"


class TrendingHashtagSerializer(serializers.Serializer):
    nome = serializers.CharField()
    usos_recentes = serializers.IntegerField()
    score_tendencia = serializers.FloatField()

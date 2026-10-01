import re
from django.contrib.auth.models import User
from django.db import models
from django.db.models import F
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    bio = models.TextField(max_length=160, blank=True, default="")
    location = models.CharField(max_length=100, blank=True, default="")
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Perfil de @{self.user.username}"


class Tweet(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tweets")
    content = models.TextField(max_length=280, blank=True)
    media = models.FileField(upload_to="tweets_media/", null=True, blank=True)
    media_type = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"@{self.author.username}: {self.content[:30]}"


class Follow(models.Model):
    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="following"
    )
    following = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")

    def __str__(self):
        return f"@{self.follower.username} segue @{self.following.username}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "tweet")


class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    tweet = models.ForeignKey(
        Tweet, on_delete=models.CASCADE, related_name="bookmarked_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "tweet")

    def __str__(self):
        return f"@{self.user.username} favoritou/salvou o tweet {self.tweet.id}"


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField(max_length=280)

    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies"
    )
    likes = models.ManyToManyField(User, related_name="liked_comments", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comentário de @{self.author.username} no tweet {self.tweet.id}"

    @property
    def likes_count(self):
        return self.likes.count()


# Retweets
class Retweet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="retweets")
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name="retweets")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "tweet")

    def __str__(self):
        return f"@{self.user.username} retweetou o tweet {self.tweet.id}"


# -------------------------------------------------------------------
# SISTEMA DE MENSAGENS PRIVADAS (DM)
# -------------------------------------------------------------------
class Message(models.Model):
    sender = models.ForeignKey(
        User, related_name="sent_messages", on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        User, related_name="received_messages", on_delete=models.CASCADE
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return (
            f"{self.sender.username} -> {self.recipient.username}: {self.content[:20]}"
        )


# -------------------------------------------------------------------
# SISTEMA DE NOTIFICAÇÕES
# -------------------------------------------------------------------
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("like", "Like"),
        ("comment", "Comment"),
        ("post", "Post"),
        ("retweet", "Retweet"),
        ("follow", "Follow"),
    )

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    # Quem FEZ a ação (curtiu, comentou, postou, seguiu)
    actor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="actions_created"
    )

    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)

    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.actor} -> {self.recipient}: {self.type}"


# -------------------------------------------------------------------
# SISTEMA DE HASHTAGS
# -------------------------------------------------------------------
class Hashtag(models.Model):
    nome = models.CharField(max_length=100)
    nome_normalizado = models.CharField(max_length=100, unique=True, db_index=True)
    quantidade_total_de_uso = models.PositiveIntegerField(default=0)
    pontuacao_total = models.FloatField(default=0.0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome


class TweetHashtag(models.Model):
    hashtag = models.ForeignKey(
        Hashtag, on_delete=models.CASCADE, related_name="tweet_links"
    )
    tweet = models.ForeignKey(
        Tweet, on_delete=models.CASCADE, related_name="hashtag_links"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ("hashtag", "tweet")


# -------------------------------------------------------------------
# SIGNALS (EXTRAÇÃO, PERFIL E NOTIFICAÇÕES)
# -------------------------------------------------------------------


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.tweet.author:
        Notification.objects.create(
            recipient=instance.tweet.author,
            actor=instance.user,
            type="like",
            tweet=instance.tweet,
        )


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        if instance.parent and instance.author != instance.parent.author:
            Notification.objects.create(
                recipient=instance.parent.author,
                actor=instance.author,
                type="comment",
                tweet=instance.tweet,
            )
        elif not instance.parent and instance.author != instance.tweet.author:
            Notification.objects.create(
                recipient=instance.tweet.author,
                actor=instance.author,
                type="comment",
                tweet=instance.tweet,
            )


@receiver(post_save, sender=Tweet)
def create_post_notification(sender, instance, created, **kwargs):
    if created:
        followers = Follow.objects.filter(following=instance.author)

        notifications = []
        for follow in followers:
            notifications.append(
                Notification(
                    recipient=follow.follower,
                    actor=instance.author,
                    type="post",
                    tweet=instance,
                )
            )
        if notifications:
            Notification.objects.bulk_create(notifications)


@receiver(post_save, sender=Retweet)
def create_retweet_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.tweet.author:
        Notification.objects.create(
            recipient=instance.tweet.author,
            actor=instance.user,
            type="retweet",
            tweet=instance.tweet,
        )


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.following, actor=instance.follower, type="follow"
        )


@receiver(post_save, sender=Tweet)
def extrair_hashtags_do_tweet(sender, instance, created, **kwargs):
    """
    Sinal responsável por extrair as hashtags do conteúdo do Tweet
    automaticamente sempre que um novo Tweet é criado.
    """
    if not created:
        return

    # Extrai todas as palavras que começam com # (suporta letras, números e acentos)
    hashtags_encontradas = set(re.findall(r'#([^\s#.,;:!?"\']+)', instance.content))

    for tag in hashtags_encontradas:
        nome_normalizado = tag.lower()

        # Cria ou recupera a hashtag
        hashtag_obj, is_new = Hashtag.objects.get_or_create(
            nome_normalizado=nome_normalizado, defaults={"nome": f"#{tag}"}
        )

        # Incrementa o uso total de forma segura para concorrência (Race Conditions)
        if not is_new:
            Hashtag.objects.filter(id=hashtag_obj.id).update(
                quantidade_total_de_uso=F("quantidade_total_de_uso") + 1
            )
        else:
            hashtag_obj.quantidade_total_de_uso = 1
            hashtag_obj.save(update_fields=["quantidade_total_de_uso"])

        # Associa a hashtag ao tweet sem duplicar
        TweetHashtag.objects.get_or_create(hashtag=hashtag_obj, tweet=instance)

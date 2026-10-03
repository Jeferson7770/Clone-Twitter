import copy
import re
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Count, ExpressionWrapper, F, FloatField, Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .serializers import (
    BookmarkSerializer,
    CommentSerializer,
    FavoriteTweetSerializer,
    HashtagSerializer,
    MessageSerializer,
    NotificationSerializer,
    ProfileSerializer,
    QuotedTweetSerializer,
    RegisterSerializer,
    TrendingHashtagSerializer,
    TweetSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class MeView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()

        if "first_name" in request.data:
            user.first_name = request.data["first_name"]
        if "password" in request.data and request.data["password"]:
            user.set_password(request.data["password"])
        user.save()

        profile_serializer = ProfileSerializer(
            user.profile, data=request.data, partial=True
        )
        if profile_serializer.is_valid():
            profile_serializer.save()

        return Response(UserSerializer(user, context={"request": request}).data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        try:
            user.delete()
            return Response(
                {"detail": "Conta eliminada com sucesso."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception:
            return Response(
                {
                    "error": "Ocorreu um erro ao tentar eliminar a tua conta. Tenta novamente."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "O email é obrigatório."}, status=status.HTTP_400_BAD_REQUEST
            )

        users = User.objects.filter(email=email)
        if not users.exists():
            return Response(
                {"message": "Se o e-mail existir, um link de recuperação foi enviado."},
                status=status.HTTP_200_OK,
            )

        frontend_url = "http://localhost:5173/reset-password"
        for user in users:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"{frontend_url}/{uid}/{token}/"

            send_mail(
                subject=f"Recuperação de Senha - @{user.username}",
                message=f"Olá @{user.username},\n\nPara redefinir a tua senha, clica no link: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response(
            {"message": "Se o e-mail existir, um link de recuperação foi enviado."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get("password")
        if not password:
            return Response(
                {"error": "A nova senha é obrigatória."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response(
                {"message": "Senha redefinida com sucesso."}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "O link de recuperação é inválido ou expirou."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class TweetViewSet(viewsets.ModelViewSet):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Tweet.objects.all().select_related(
            "author", "author__profile", "quoted_tweet"
        )

    def _compute_tweet_metrics(self, tweet_obj):
        likes = Like.objects.filter(tweet_id=tweet_obj.id).count()
        comments = Comment.objects.filter(tweet_id=tweet_obj.id).count()
        retweets_count = Retweet.objects.filter(tweet_id=tweet_obj.id).count()
        quotes_count = Tweet.objects.filter(quoted_tweet_id=tweet_obj.id).count()
        total_retweets = retweets_count + quotes_count
        score = (likes * 1) + (comments * 2) + (total_retweets * 3)
        return likes, comments, total_retweets, float(score)

    def _get_timeline_response(self, request, is_popular_override=None):
        username = request.query_params.get("username")

        if is_popular_override is not None:
            is_popular = is_popular_override
        else:
            is_popular = False
            popular_terms = {
                "popular",
                "alta",
                "em_alta",
                "em-alta",
                "em alta",
                "trending",
                "top",
                "hot",
                "score",
                "engagement",
                "relevant",
                "destaque",
                "likes",
                "curtidas",
                "mais_curtidos",
                "most_liked",
            }

            for key, val in request.query_params.items():
                v_lower = str(val).lower()
                if any(term in v_lower for term in popular_terms):
                    is_popular = True
                    break

        if username:
            tweets_qs = Tweet.objects.filter(author__username=username).select_related(
                "author", "author__profile", "quoted_tweet"
            )
            retweets_qs = Retweet.objects.filter(
                user__username=username
            ).select_related("tweet", "tweet__author", "tweet__author__profile", "user")
        else:
            followed_users = Follow.objects.filter(follower=request.user).values_list(
                "following", flat=True
            )
            if followed_users.exists():
                feed_users = list(followed_users) + [request.user.id]
                tweets_qs = Tweet.objects.filter(author__in=feed_users).select_related(
                    "author", "author__profile", "quoted_tweet"
                )
                retweets_qs = Retweet.objects.filter(
                    user__in=feed_users
                ).select_related(
                    "tweet", "tweet__author", "tweet__author__profile", "user"
                )
            else:
                tweets_qs = Tweet.objects.all().select_related(
                    "author", "author__profile", "quoted_tweet"
                )
                retweets_qs = Retweet.objects.all().select_related(
                    "tweet", "tweet__author", "tweet__author__profile", "user"
                )

        timeline = []

        for tweet in tweets_qs:
            l, c, r, score = self._compute_tweet_metrics(tweet)
            tweet.likes_count = l
            tweet.comments_count = c
            tweet.retweets_count = r
            tweet.score = score
            tweet.sort_date = tweet.created_at
            tweet.is_retweet_instance = False
            tweet.unique_id = f"tw_{tweet.id}"
            timeline.append(tweet)

        for rt in retweets_qs:
            if rt.tweet:
                t_copy = copy.copy(rt.tweet)
                l, c, r, score = self._compute_tweet_metrics(t_copy)
                t_copy.is_retweet_instance = True
                t_copy.retweet_user = rt.user
                t_copy.retweet_id = rt.id
                t_copy.unique_id = f"rt_{rt.id}"
                t_copy.likes_count = l
                t_copy.comments_count = c
                t_copy.retweets_count = r
                t_copy.score = score
                t_copy.sort_date = rt.created_at
                timeline.append(t_copy)

        if is_popular:
            timeline.sort(
                key=lambda x: (
                    getattr(x, "score", 0.0),
                    getattr(x, "sort_date", x.created_at),
                ),
                reverse=True,
            )
        else:
            timeline.sort(
                key=lambda x: getattr(x, "sort_date", x.created_at),
                reverse=True,
            )

        serializer = self.get_serializer(
            timeline, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        return self._get_timeline_response(request)

    @action(detail=False, methods=["get"], url_path="em_alta")
    def em_alta(self, request):
        return self._get_timeline_response(request, is_popular_override=True)

    @action(detail=False, methods=["get"], url_path="popular")
    def popular(self, request):
        return self._get_timeline_response(request, is_popular_override=True)

    @action(detail=False, methods=["get"], url_path="trending")
    def trending(self, request):
        return self._get_timeline_response(request, is_popular_override=True)

    def perform_create(self, serializer):
        tweet = serializer.save(author=self.request.user)

        hashtags = set(re.findall(r"#(\w+)", tweet.content))
        for tag_name in hashtags:
            tag_normalizado = tag_name.lower()
            hashtag_obj, _ = Hashtag.objects.get_or_create(
                nome_normalizado=tag_normalizado, defaults={"nome": f"#{tag_name}"}
            )
            TweetHashtag.objects.get_or_create(tweet=tweet, hashtag=hashtag_obj)

            hashtag_obj.quantidade_total_de_uso = TweetHashtag.objects.filter(
                hashtag=hashtag_obj
            ).count()
            hashtag_obj.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("Você não tem permissão para apagar este tweet.")

        hashtag_ids = list(
            TweetHashtag.objects.filter(tweet=instance).values_list(
                "hashtag_id", flat=True
            )
        )

        instance.delete()

        for h_id in hashtag_ids:
            try:
                h = Hashtag.objects.get(id=h_id)
                h.quantidade_total_de_uso = TweetHashtag.objects.filter(
                    hashtag=h
                ).count()
                h.save()
            except Hashtag.DoesNotExist:
                pass

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        tweet = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, tweet=tweet)
        if not created:
            like.delete()
            return Response({"status": "unliked"}, status=status.HTTP_200_OK)
        return Response({"status": "liked"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        tweet = self.get_object()
        content = request.data.get("content")
        parent_id = request.data.get("parent")

        if not content:
            return Response(
                {"error": "Conteúdo é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        comment = Comment.objects.create(
            author=request.user,
            tweet=tweet,
            content=content,
            parent_id=parent_id if parent_id else None,
        )

        serializer = CommentSerializer(comment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def retweet(self, request, pk=None):
        tweet = self.get_object()
        retweet_obj, created = Retweet.objects.get_or_create(
            user=request.user, tweet=tweet
        )
        if not created:
            retweet_obj.delete()
            return Response({"status": "unretweeted"}, status=status.HTTP_200_OK)
        return Response({"status": "retweeted"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def retweeted_by(self, request, pk=None):
        tweet = self.get_object()
        retweets = Retweet.objects.filter(tweet=tweet).select_related(
            "user", "user__profile"
        )
        users = [rt.user for rt in retweets]
        serializer = UserSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def quote(self, request, pk=None):
        original_tweet = self.get_object()
        content = request.data.get("content", "")

        if not content:
            return Response(
                {"error": "Conteúdo é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        quoted_tweet = Tweet.objects.create(
            author=request.user,
            content=content,
            quoted_tweet=original_tweet,
        )

        serializer = self.get_serializer(quoted_tweet, context={"request": request})
        data = serializer.data

        if "quoted_tweet" not in data or not isinstance(data["quoted_tweet"], dict):
            original_serializer = QuotedTweetSerializer(
                original_tweet, context={"request": request}
            )
            data["quoted_tweet"] = original_serializer.data

        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="unread_count")
    def unread_count(self, request):
        return Response(
            {"unread_count": 0, "count": 0, "unread": 0}, status=status.HTTP_200_OK
        )


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied(
                "Você não tem permissão para apagar este comentário."
            )
        instance.delete()

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        comment = self.get_object()
        if request.user in comment.likes.all():
            comment.likes.remove(request.user)
            return Response({"status": "unliked"}, status=status.HTTP_200_OK)
        else:
            comment.likes.add(request.user)
            return Response({"status": "liked"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        parent_comment = self.get_object()
        content = request.data.get("content")

        if not content:
            return Response(
                {"error": "Conteúdo é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        reply_comment = Comment.objects.create(
            author=request.user,
            tweet=parent_comment.tweet,
            content=content,
            parent=parent_comment,
        )

        serializer = CommentSerializer(reply_comment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "username"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @action(detail=True, methods=["post", "delete"])
    def follow(self, request, username=None):
        user_to_follow = self.get_object()
        if user_to_follow == request.user:
            return Response(
                {"error": "Você não pode seguir a si mesmo"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.method == "DELETE":
            Follow.objects.filter(
                follower=request.user, following=user_to_follow
            ).delete()
            return Response({"status": "unfollowed"}, status=status.HTTP_200_OK)

        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=user_to_follow
        )
        if not created:
            follow.delete()
            return Response({"status": "unfollowed"}, status=status.HTTP_200_OK)
        return Response({"status": "followed"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="favorites")
    def favorites(self, request, username=None):
        target_user = self.get_object()
        liked_tweets = Tweet.objects.filter(likes__user=target_user).order_by(
            "-likes__created_at"
        )
        serializer = TweetSerializer(
            liked_tweets, many=True, context={"request": request}
        )
        return Response(serializer.data)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by(
            "-created_at"
        )[:50]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def post(self, request, *args, **kwargs):
        Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True
        )
        return Response(
            {"status": "Notificações marcadas como lidas"}, status=status.HTTP_200_OK
        )


class UnreadNotificationCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({"unread_count": count})


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        )

    def create(self, request, *args, **kwargs):
        recipient_id = request.data.get("recipient")
        content = request.data.get("content")

        if not recipient_id or not content:
            return Response(
                {"error": "Destinatário e conteúdo são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if int(recipient_id) == request.user.id:
            return Response(
                {"error": "Você não pode enviar mensagens para si mesmo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        is_following = Follow.objects.filter(
            follower=request.user, following=recipient
        ).exists()
        has_history = Message.objects.filter(
            Q(sender=request.user, recipient=recipient)
            | Q(sender=recipient, recipient=request.user)
        ).exists()

        if not (is_following or has_history):
            return Response(
                {"error": "Você precisa seguir este usuário para enviar uma mensagem."},
                status=status.HTTP_403_FORBIDDEN,
            )

        message = Message.objects.create(
            sender=request.user, recipient=recipient, content=content
        )

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path=r"chat/(?P<username>[\w.@+-]+)")
    def chat_history(self, request, username=None):
        try:
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        messages = Message.objects.filter(
            (Q(sender=request.user) & Q(recipient=other_user))
            | (Q(sender=other_user) & Q(recipient=request.user))
        ).order_by("created_at")

        messages.filter(recipient=request.user, is_read=False).update(is_read=True)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def conversations(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list(
            "following", flat=True
        )
        sent_ids = Message.objects.filter(sender=request.user).values_list(
            "recipient", flat=True
        )
        received_ids = Message.objects.filter(recipient=request.user).values_list(
            "sender", flat=True
        )

        all_contact_ids = set(following_ids) | set(sent_ids) | set(received_ids)
        all_contact_ids.discard(request.user.id)

        contact_users = User.objects.filter(id__in=all_contact_ids)

        results = []
        for user in contact_users:
            user_data = UserSerializer(user, context={"request": request}).data

            unread_count = Message.objects.filter(
                sender=user, recipient=request.user, is_read=False
            ).count()

            last_msg = (
                Message.objects.filter(
                    (Q(sender=request.user) & Q(recipient=user))
                    | (Q(sender=user) & Q(recipient=request.user))
                )
                .order_by("-created_at")
                .first()
            )

            user_data["unread_count"] = unread_count
            user_data["has_unread"] = unread_count > 0
            user_data["last_message"] = last_msg.content if last_msg else ""
            user_data["last_message_time"] = (
                last_msg.created_at.isoformat() if last_msg else ""
            )

            results.append(user_data)

        results.sort(
            key=lambda x: (x["has_unread"], x["last_message_time"]),
            reverse=True,
        )

        return Response(results)

    @action(detail=False, methods=["get"], url_path="unread_count")
    def unread_count(self, request):
        count = Message.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count})


class HashtagDetailView(generics.RetrieveAPIView):
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "nome_normalizado"


class HashtagAutocompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip().lower()
        if query.startswith("#"):
            query = query[1:]

        if not query:
            return Response([])

        hashtags = Hashtag.objects.filter(nome_normalizado__istartswith=query).order_by(
            "-quantidade_total_de_uso"
        )[:10]

        return Response(HashtagSerializer(hashtags, many=True).data)


class TrendingHashtagsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            trending = (
                Hashtag.objects.filter(quantidade_total_de_uso__gt=0)
                .annotate(
                    total_likes=Count("tweet_links__tweet__likes", distinct=True),
                    total_comments=Count("tweet_links__tweet__comments", distinct=True),
                    total_retweets=Count("tweet_links__tweet__retweets", distinct=True),
                )
                .annotate(
                    score_tendencia=ExpressionWrapper(
                        F("quantidade_total_de_uso") * 2
                        + F("total_likes") * 1
                        + F("total_comments") * 2
                        + F("total_retweets") * 3,
                        output_field=FloatField(),
                    )
                )
                .order_by("-score_tendencia")[:20]
            )

            data = [
                {
                    "nome": tag.nome,
                    "nome_normalizado": tag.nome_normalizado,
                    "usos_recentes": tag.quantidade_total_de_uso,
                    "score_tendencia": getattr(
                        tag, "score_tendencia", tag.quantidade_total_de_uso
                    ),
                }
                for tag in trending
            ]
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Erro ao buscar tendências: {e}")
            return Response([], status=status.HTTP_200_OK)


class HashtagTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        hashtag_nome = self.kwargs["nome_normalizado"].lower()
        if hashtag_nome.startswith("#"):
            hashtag_nome = hashtag_nome[1:]

        popular_keywords = {
            "popular",
            "alta",
            "em_alta",
            "em-alta",
            "trending",
            "top",
            "engagement",
            "relevant",
            "score",
        }
        is_popular = False
        for param in ["sort", "ordering", "tab", "filter", "type"]:
            val = self.request.query_params.get(param)
            if val and any(k in str(val).lower() for k in popular_keywords):
                is_popular = True
                break

        queryset = Tweet.objects.filter(
            hashtag_links__hashtag__nome_normalizado=hashtag_nome
        )

        if is_popular:
            queryset = (
                queryset.annotate(
                    total_likes=Count("likes", distinct=True),
                    total_comments=Count("comments", distinct=True),
                    total_retweets=Count("retweets", distinct=True),
                )
                .annotate(
                    relevance_score=ExpressionWrapper(
                        F("total_likes") * 1
                        + F("total_comments") * 2
                        + F("total_retweets") * 3,
                        output_field=FloatField(),
                    )
                )
                .order_by("-relevance_score", "-created_at")
            )
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

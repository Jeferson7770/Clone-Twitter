from django.contrib.auth.models import User
from django.db.models import Q, Count, F, ExpressionWrapper, FloatField
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import CursorPagination

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache

from .models import (
    Comment,
    Follow,
    Like,
    Message,
    Notification,
    Profile,
    Retweet,
    Tweet,
    Hashtag,
    TweetHashtag,
)
from .serializers import (
    CommentSerializer,
    MessageSerializer,
    NotificationSerializer,
    ProfileSerializer,
    RegisterSerializer,
    TweetSerializer,
    UserSerializer,
    HashtagSerializer,
    TrendingHashtagSerializer,
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
        else:
            print("Erros no serializer do perfil:", profile_serializer.errors)

        return Response(UserSerializer(user, context={"request": request}).data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        try:
            user.delete()
            return Response(
                {"detail": "Conta eliminada com sucesso."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
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
        else:
            return Response(
                {"error": "O link de recuperação é inválido ou expirou."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TweetViewSet(viewsets.ModelViewSet):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Tweet.objects.all()

    def list(self, request, *args, **kwargs):
        username = request.query_params.get("username")

        if username:
            tweets = Tweet.objects.filter(author__username=username)
            retweets = Retweet.objects.filter(user__username=username).select_related(
                "tweet"
            )
        else:
            followed_users = Follow.objects.filter(follower=request.user).values_list(
                "following", flat=True
            )
            feed_users = list(followed_users) + [request.user.id]

            tweets = Tweet.objects.filter(author__in=feed_users)
            retweets = Retweet.objects.filter(user__in=feed_users).select_related(
                "tweet"
            )

        timeline = []

        for tweet in tweets:
            tweet.sort_date = tweet.created_at
            timeline.append(tweet)

        for rt in retweets:
            tweet_obj = rt.tweet
            tweet_obj.is_retweet_instance = True
            tweet_obj.sort_date = rt.created_at
            timeline.append(tweet_obj)

        timeline.sort(key=lambda x: getattr(x, "sort_date", x.created_at), reverse=True)

        serializer = self.get_serializer(
            timeline, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("Você não tem permissão para apagar este tweet.")
        instance.delete()

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
            parent_id=parent_id,
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

        # Marca como lidas as mensagens recebidas neste chat
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

        # Ordena: mensagens não lidas e chats mais recentes ficam no topo
        results.sort(
            key=lambda x: (x["has_unread"], x["last_message_time"]),
            reverse=True,
        )

        return Response(results)

    @action(detail=False, methods=["get"], url_path="unread_count")
    def unread_count(self, request):
        count = Message.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count})


# -------------------------------------------------------------------
# SISTEMA DE HASHTAGS (NOVAS VIEWS)
# -------------------------------------------------------------------


class TweetCursorPagination(CursorPagination):
    page_size = 20
    ordering = "-created_at"


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

        # Busca por prefixo, ordena por uso
        hashtags = Hashtag.objects.filter(nome_normalizado__istartswith=query).order_by(
            "-quantidade_total_de_uso"
        )[:10]

        return Response(HashtagSerializer(hashtags, many=True).data)


class TrendingHashtagsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period_param = request.query_params.get("period", "24h")
        cache_key = f"trending_hashtags_{period_param}"

        resultados = cache.get(cache_key)
        if resultados:
            return Response(resultados)

        # Define a janela de tempo
        horas = 24
        if period_param == "1h":
            horas = 1
        elif period_param == "7d":
            horas = 168

        tempo_limite = timezone.now() - timedelta(hours=horas)

        # Calcula as tendências com base nas relações recentes
        trending = (
            Hashtag.objects.filter(tweet_links__created_at__gte=tempo_limite)
            .annotate(usos_recentes=Count("tweet_links", distinct=True))
            .filter(usos_recentes__gt=0)
            .order_by("-usos_recentes")[:20]
        )

        data = [
            {
                "nome": tag.nome,
                "usos_recentes": tag.usos_recentes,
                "score_tendencia": tag.pontuacao_total,
            }
            for tag in trending
        ]

        # Cacheia por 5 minutos para performance
        cache.set(cache_key, data, 300)
        return Response(data)


class HashtagTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = TweetCursorPagination

    def get_queryset(self):
        hashtag_nome = self.kwargs["nome_normalizado"].lower()
        if hashtag_nome.startswith("#"):
            hashtag_nome = hashtag_nome[1:]

        sort = self.request.query_params.get("sort", "recent")

        # Filtra os tweets que têm a relação com esta hashtag
        queryset = Tweet.objects.filter(
            hashtag_links__hashtag__nome_normalizado=hashtag_nome
        )

        if sort == "relevant":
            # Calcula o score em tempo real para ordenação:
            # (Curtidas * 1) + (Comentários * 2) + (Retweets * 3)
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

            # Muda a ordenação da paginação temporariamente para refletir a relevância
            self.pagination_class.ordering = "-relevance_score"

        return queryset

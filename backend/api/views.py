from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Profile, Tweet, Follow, Like, Comment
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProfileSerializer,
    TweetSerializer,
    CommentSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

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


class TweetViewSet(viewsets.ModelViewSet):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Exibe no Feed os tweets do usuário + de quem ele segue
        followed_users = Follow.objects.filter(follower=self.request.user).values_list(
            "following", flat=True
        )
        return Tweet.objects.filter(
            author__in=list(followed_users) + [self.request.user.id]
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

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
        if not content:
            return Response(
                {"error": "Conteúdo é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        comment = Comment.objects.create(
            author=request.user, tweet=tweet, content=content
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        user_to_follow = self.get_object()
        if user_to_follow == request.user:
            return Response(
                {"error": "Você não pode seguir a si mesmo"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=user_to_follow
        )
        if not created:
            follow.delete()
            return Response({"status": "unfollowed"}, status=status.HTTP_200_OK)
        return Response({"status": "followed"}, status=status.HTTP_201_CREATED)

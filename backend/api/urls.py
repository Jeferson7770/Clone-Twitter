from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import (
    RegisterView,
    MeView,
    TweetViewSet,
    CommentViewSet,
    UserViewSet,
    NotificationListView,
    UnreadNotificationCountView,
    NotificationReadView,
    MessageViewSet,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ChangePasswordView,  # <--- Importação adicionada aqui
    HashtagDetailView,
    HashtagAutocompleteView,
    TrendingHashtagsView,
    HashtagTweetsView,
)

router = DefaultRouter()
router.register(r"tweets", TweetViewSet, basename="tweet")
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"users", UserViewSet, basename="user")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path(
        "change-password/", ChangePasswordView.as_view(), name="change-password"
    ),  # <--- Rota de alteração de senha adicionada aqui
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset_request",
    ),
    path(
        "password-reset-confirm/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path(
        "notifications/<int:pk>/read/",
        NotificationReadView.as_view(),
        name="notification-read",
    ),
    path(
        "notifications/unread_count/",
        UnreadNotificationCountView.as_view(),
        name="unread-count",
    ),
    path(
        "hashtags/trending/", TrendingHashtagsView.as_view(), name="trending-hashtags"
    ),
    path(
        "hashtags/autocomplete/",
        HashtagAutocompleteView.as_view(),
        name="hashtag-autocomplete",
    ),
    path(
        "hashtags/<str:nome_normalizado>/",
        HashtagDetailView.as_view(),
        name="hashtag-detail",
    ),
    path(
        "hashtags/<str:nome_normalizado>/tweets/",
        HashtagTweetsView.as_view(),
        name="hashtag-tweets",
    ),
    path("", include(router.urls)),
]

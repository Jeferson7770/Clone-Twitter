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
    MessageViewSet,
    PasswordResetRequestView,
    PasswordResetConfirmView,
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
        "notifications/unread_count/",
        UnreadNotificationCountView.as_view(),
        name="unread-count",
    ),
    path("", include(router.urls)),
]

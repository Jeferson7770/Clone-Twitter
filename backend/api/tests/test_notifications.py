from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Notification, Tweet


class NotificationTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="123")
        self.user2 = User.objects.create_user(username="user2", password="123")
        self.tweet = Tweet.objects.create(author=self.user1, content="Olá")

        Notification.objects.create(
            recipient=self.user1, actor=self.user2, type="like", tweet=self.tweet
        )

        self.client.force_authenticate(user=self.user1)
        self.list_url = "/api/notifications/"
        self.count_url = "/api/notifications/unread_count/"

    def test_list_notifications(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Se você estiver usando paginação, verifique len(response.data['results'])
        # Se não, verifique len(response.data)
        try:
            self.assertEqual(len(response.data["results"]), 1)
        except TypeError:
            self.assertEqual(len(response.data), 1)

    def test_unread_count(self):
        response = self.client.get(self.count_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 1)

    def test_mark_as_read(self):
        response = self.client.post(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            Notification.objects.filter(recipient=self.user1, is_read=False).exists()
        )

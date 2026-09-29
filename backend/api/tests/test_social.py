from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Follow, Message


class SocialTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="123")
        self.user2 = User.objects.create_user(username="user2", password="123")
        self.messages_url = "/api/messages/"
        self.client.force_authenticate(user=self.user1)

    def test_send_message_without_following(self):
        data = {"recipient": self.user2.id, "content": "Oi"}
        response = self.client.post(self.messages_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_send_message_success(self):
        Follow.objects.create(follower=self.user1, following=self.user2)
        data = {"recipient": self.user2.id, "content": "Oi"}
        response = self.client.post(self.messages_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)

    def test_chat_history_and_conversations(self):
        Follow.objects.create(follower=self.user1, following=self.user2)
        Message.objects.create(sender=self.user1, recipient=self.user2, content="M1")
        Message.objects.create(sender=self.user2, recipient=self.user1, content="M2")

        # Chat history
        history_url = f"/api/messages/chat/{self.user2.username}/"
        response_history = self.client.get(history_url)
        self.assertEqual(response_history.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_history.data), 2)

        # Conversations list
        conversations_url = "/api/messages/conversations/"
        response_conv = self.client.get(conversations_url)
        self.assertEqual(response_conv.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_conv.data), 1)

    def test_unread_count(self):
        Message.objects.create(
            sender=self.user2, recipient=self.user1, content="M1", is_read=False
        )
        unread_url = "/api/messages/unread_count/"
        response = self.client.get(unread_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 1)

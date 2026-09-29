from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Profile, Follow, Tweet, Like


class UserTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/register/"
        self.me_url = "/api/me/"

        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "strongpassword123",
            "first_name": "Test",
        }
        self.user = User.objects.create_user(**self.user_data)
        self.user2 = User.objects.create_user(username="otheruser", password="123")

    def test_user_registration(self):
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpassword123",
            "first_name": "New",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)
        self.assertEqual(Profile.objects.count(), 3)

    def test_me_view_get(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")

    def test_me_view_update(self):
        self.client.force_authenticate(user=self.user)
        update_data = {"first_name": "Nome Atualizado", "bio": "Nova bio"}
        response = self.client.patch(self.me_url, update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Nome Atualizado")
        self.assertEqual(self.user.profile.bio, "Nova bio")

    def test_me_view_delete(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.count(), 1)

    def test_user_follow_unfollow(self):
        self.client.force_authenticate(user=self.user)
        follow_url = f"/api/users/{self.user2.username}/follow/"

        # Follow
        response = self.client.post(follow_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Follow.objects.filter(follower=self.user, following=self.user2).exists()
        )

        # Unfollow (POST toggle)
        response = self.client.post(follow_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            Follow.objects.filter(follower=self.user, following=self.user2).exists()
        )

    def test_user_favorites(self):
        self.client.force_authenticate(user=self.user)
        tweet = Tweet.objects.create(author=self.user2, content="Tweet")
        Like.objects.create(user=self.user, tweet=tweet)

        favorites_url = f"/api/users/{self.user.username}/favorites/"
        response = self.client.get(favorites_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

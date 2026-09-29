from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status


class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secure123")
        self.token_url = "/api/token/"
        self.refresh_url = "/api/token/refresh/"

    def test_obtain_token(self):
        data = {"username": "testuser", "password": "secure123"}
        response = self.client.post(self.token_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_token(self):
        login = self.client.post(
            self.token_url, {"username": "testuser", "password": "secure123"}
        )
        refresh_token = login.data["refresh"]

        response = self.client.post(self.refresh_url, {"refresh": refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

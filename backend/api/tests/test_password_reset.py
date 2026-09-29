from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="oldpassword"
        )
        self.request_url = "/api/password-reset/"

    def test_password_reset_request_valid(self):
        data = {"email": "test@example.com"}
        response = self.client.post(self.request_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_password_reset_request_invalid(self):
        data = {"email": "fake@example.com"}
        response = self.client.post(self.request_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        confirm_url = f"/api/password-reset-confirm/{uidb64}/{token}/"
        data = {"password": "newpassword123"}

        response = self.client.post(confirm_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))

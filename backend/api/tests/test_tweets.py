from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Tweet, Like, Comment, Retweet


class TweetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="autor", password="123")
        self.other_user = User.objects.create_user(username="leitor", password="123")
        self.client.force_authenticate(user=self.user)
        self.tweet_url = "/api/tweets/"
        self.tweet = Tweet.objects.create(author=self.user, content="Meu tweet")

    def test_list_tweets(self):
        response = self.client.get(self.tweet_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_tweet(self):
        data = {"content": "Novo tweet!"}
        response = self.client.post(self.tweet_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tweet.objects.count(), 2)

    def test_delete_tweet(self):
        response = self.client.delete(f"{self.tweet_url}{self.tweet.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Tweet.objects.count(), 0)

    def test_delete_tweet_forbidden(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(f"{self.tweet_url}{self.tweet.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_like_tweet(self):
        like_url = f"{self.tweet_url}{self.tweet.id}/like/"

        # Like
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Like.objects.count(), 1)

        # Unlike
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Like.objects.count(), 0)

    def test_retweet(self):
        retweet_url = f"{self.tweet_url}{self.tweet.id}/retweet/"
        response = self.client.post(retweet_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Retweet.objects.count(), 1)

    def test_comment_on_tweet(self):
        comment_url = f"{self.tweet_url}{self.tweet.id}/comment/"
        data = {"content": "Comentário legal"}
        response = self.client.post(comment_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)

    def test_comment_reply_and_like(self):
        comment = Comment.objects.create(
            author=self.other_user, tweet=self.tweet, content="Top"
        )
        reply_url = f"/api/comments/{comment.id}/reply/"
        like_url = f"/api/comments/{comment.id}/like/"

        # Reply
        response_reply = self.client.post(reply_url, {"content": "Resposta"})
        self.assertEqual(response_reply.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)

        # Like comment
        response_like = self.client.post(like_url)
        self.assertEqual(response_like.status_code, status.HTTP_201_CREATED)
        self.assertIn(self.user, comment.likes.all())

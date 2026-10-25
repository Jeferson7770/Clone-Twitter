import type { MouseEvent } from 'react';
import {
  QuotedAvatar,
  QuotedContent,
  QuotedHeader,
  QuotedTweetCard,
} from '../styles';
import type { ITweetData } from '../types';
import { getAvatarUrl } from '../utils';
import TweetMedia from './TweetMedia';

interface QuotedTweetProps {
  tweet: ITweetData;
  onOpen: (tweetId: ITweetData['id']) => void;
  onUserClick: (e: MouseEvent, username: string) => void;
}

/** Card do tweet citado (retweet com comentário). */
const QuotedTweet = ({ tweet, onOpen, onUserClick }: QuotedTweetProps) => {
  const { author } = tweet;

  return (
    <QuotedTweetCard
      onClick={(e) => {
        e.stopPropagation();
        onOpen(tweet.id);
      }}
    >
      <QuotedHeader>
        <QuotedAvatar
          $avatarUrl={getAvatarUrl(author.profile?.avatar)}
          onClick={(e) => onUserClick(e, author.username)}
        />
        <strong onClick={(e) => onUserClick(e, author.username)}>
          {author.first_name || author.username}
        </strong>
        <span onClick={(e) => onUserClick(e, author.username)}>
          @{author.username}
        </span>
      </QuotedHeader>

      {tweet.content && <QuotedContent>{tweet.content}</QuotedContent>}

      {tweet.media && (
        <TweetMedia
          media={tweet.media}
          mediaType={tweet.media_type}
          stopPropagation
        />
      )}
    </QuotedTweetCard>
  );
};

export default QuotedTweet;

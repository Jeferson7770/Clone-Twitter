export interface IComment {
  id: number | string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    username: string;
    profile?: {
      avatar?: string;
    };
  };
  likes_count?: number;
  is_liked?: boolean;
  replies_count?: number;
  replies?: IComment[];
  parent?: number | string | null;
  parent_author_username?: string | null; // <--- Adicionado aqui
  media?: string | null;
  media_type?: 'image' | 'video';
}

export interface ILikedUser {
  id: number | string;
  username: string;
  first_name?: string;
  is_following?: boolean;
  profile?: {
    avatar?: string | null;
  };
}

export interface ITweetData {
  id: number | string;
  content: string;
  created_at: string;
  author: {
    id?: number | string;
    first_name: string;
    username: string;
    profile?: {
      avatar?: string;
    };
  };
  likes_count?: number;
  retweets_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_retweeted?: boolean;
  media?: string | null;
  media_type?: 'image' | 'video';
  isRetweet?: boolean;
  comments?: IComment[];
  liked_by?: ILikedUser[];
  quoted_tweet?: ITweetData | null;
}

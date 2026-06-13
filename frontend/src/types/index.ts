export interface User {
  id: number;
  username: string;
  nickname?: string;
  bio?: string;
  email: string | null;
  avatar: string | null;
  role: 'ADMIN' | 'USER';
  followerCount?: number;
  followingCount?: number;
  articleCount?: number;
  coins?: number;
  createTime?: string;
}

export interface Tag {
  id: number;
  name: string;
  createTime: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  createTime: string;
}

export interface Comment {
  id: number;
  content: string;
  articleId: number;
  userId: number;
  username: string;
  userAvatar?: string | null;
  parentId: number | null;
  children?: Comment[];
  createTime: string;
  likes?: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  views: number;
  likes: number;
  commentCount?: number;
  favoriteCount?: number;
  status: string;
  userId: number;
  username?: string;
  userAvatar?: string | null;
  categoryId: number | null;
  categoryName?: string;
  categorySlug?: string;
  isTop?: boolean;
  tags: Tag[];
  createTime: string;
  updateTime: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

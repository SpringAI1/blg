import { apiGet, apiPost, apiDelete } from '@/utils/http';
import { PageResult } from '@/types';

export interface FollowUser {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  articleCount?: number;
}

export const followApi = {
  getMyFollowing: (pageNum: number = 1, pageSize: number = 10) =>
    apiGet<PageResult<FollowUser>>('/follows/following', { pageNum, pageSize }),

  getMyFollowers: (pageNum: number = 1, pageSize: number = 10) =>
    apiGet<PageResult<FollowUser>>('/follows/followers', { pageNum, pageSize }),

  follow: (followingId: number) =>
    apiPost<string>('/follows', { followingId }),

  unfollow: (followingId: number) =>
    apiDelete<string>(`/follows/${followingId}`),

  checkFollow: (followingId: number) =>
    apiGet<boolean>(`/follows/check/${followingId}`),
};

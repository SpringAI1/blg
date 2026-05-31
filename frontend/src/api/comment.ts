import { apiGet, apiPost, apiDelete } from '@/utils/http';

export interface CommentDTO {
  id: number;
  content: string;
  articleId: number;
  userId: number;
  username: string;
  userAvatar: string | null;
  parentId: number | null;
  children?: CommentDTO[];
  createTime: string;
}

export const commentApi = {
  getCommentsByArticle: (articleId: number) =>
    apiGet<CommentDTO[]>(`/articles/${articleId}/comments`),

  addComment: (articleId: number, data: { content: string; parentId?: number }) =>
    apiPost<CommentDTO>(`/articles/${articleId}/comments`, data),

  deleteComment: (id: number) =>
    apiDelete(`/comments/${id}`),

  getAllComments: () =>
    apiGet<CommentDTO[]>('/comments/all'),
};

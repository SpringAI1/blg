import { apiGet, apiPost, apiPut } from '@/utils/http';

export interface Meeting {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location: string;
  maxParticipants: number;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
  hostId: number;
  categoryId?: number;
  coverImage?: string;
  tags?: string;
  participantCount: number;
  joinCode?: string;
  createTime: string;
}

export interface MeetingParticipant {
  id: number;
  meetingId: number;
  userId: number;
  role: 'HOST' | 'PARTICIPANT';
  joinedAt: string;
}

export const meetingApi = {
  getAll: () => apiGet<Meeting[]>('/meetings'),

  getById: (id: number) => apiGet<Meeting>(`/meetings/${id}`),

  create: (data: Partial<Meeting>) =>
    apiPost<Meeting>('/meetings', data),

  update: (id: number, data: Partial<Meeting>) =>
    apiPut<Meeting>(`/meetings/${id}`, data),

  join: (id: number, joinCode?: string) =>
    apiPost<void>(`/meetings/${id}/join`, { joinCode }),

  leave: (id: number) => apiPost<void>(`/meetings/${id}/leave`),

  getParticipants: (id: number) =>
    apiGet<MeetingParticipant[]>(`/meetings/${id}/participants`),

  checkJoined: (id: number) =>
    apiGet<boolean>(`/meetings/${id}/check-joined`),

  getMyMeetings: () => apiGet<Meeting[]>('/meetings/my'),

  getJoinedMeetings: () => apiGet<Meeting[]>('/meetings/joined'),
};

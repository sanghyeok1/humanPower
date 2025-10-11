// lib/api-client.ts - Express 백엔드 API 클라이언트

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

async function apiClient<T = any>(
  endpoint: string,
  { data, ...options }: FetchOptions = {}
): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 쿠키 포함
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// API 메서드들
export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiClient('/auth/login', { method: 'POST', data: { username, password } }),

  logout: () =>
    apiClient('/auth/logout', { method: 'POST' }),

  signup: (data: any) =>
    apiClient('/auth/signup/seeker', { method: 'POST', data }),

  checkUsername: (username: string) =>
    apiClient('/auth/check-username', { method: 'POST', data: { username } }),

  getMe: () =>
    apiClient('/me'),

  // Chat
  getChatRooms: () =>
    apiClient('/chat'),

  createChatRoom: (posting_id: string, employer_id: number) =>
    apiClient('/chat', { method: 'POST', data: { posting_id, employer_id } }),

  getChatMessages: (roomId: string) =>
    apiClient(`/chat/${roomId}`),

  sendMessage: (roomId: string, message: string) =>
    apiClient(`/chat/${roomId}`, { method: 'POST', data: { message } }),

  // Postings
  getPostings: (params?: { category?: string; dong?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient(`/postings${query ? `?${query}` : ''}`);
  },

  // Applicants
  getApplicants: () =>
    apiClient('/applicants'),

  // Resumes
  getResumes: () =>
    apiClient('/resumes'),

  createResume: (data: any) =>
    apiClient('/resumes', { method: 'POST', data }),

  // Partners
  getPartners: () =>
    apiClient('/partners'),
};

export default api;

/**
 * Backend API Entegrasyonu
 * Strict Anonymity: Oy, adayın voteCount'ını arttırır, kullanıcıya link kurulmaz
 */

import type {
  ApiResponse,
  ElectionResponse,
  CreateElectionRequest,
  Candidate,
  CreateCandidateRequest,
  UserResponse,
} from './types';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from './config';

// ========================================
// HELPER: Hata Mesajları Döndür
// ========================================

const handleApiError = (
  error: unknown,
  statusCode?: number
): string => {
  if (statusCode === HTTP_STATUS.FORBIDDEN) {
    return ERROR_MESSAGES.ALREADY_VOTED;
  }
  if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }
  if (statusCode === HTTP_STATUS.NOT_FOUND) {
    return ERROR_MESSAGES.ELECTION_NOT_FOUND;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// ========================================
// HELPER: API Request
// ========================================

const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || handleApiError(null, response.status);
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

/**
 * Kullanıcı giriş yapması
 */
export const loginUser = async (email: string, password: string): Promise<ApiResponse<{
  token: string;
  user: UserResponse;
}>> => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Yeni kullanıcı kaydı
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  surname: string
): Promise<ApiResponse<{ user: UserResponse }>> => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, surname }),
  });
};

/**
 * Mevcut kullanıcı bilgilerini al
 */
export const getCurrentUser = async (): Promise<ApiResponse<UserResponse>> => {
  return apiRequest('/auth/me', { method: 'GET' });
};

// ========================================
// ELECTION ENDPOINTS
// ========================================

/**
 * Yeni seçim oluştur (Yalnızca onaylı kullanıcılar)
 */
export const createElection = async (
  electionData: CreateElectionRequest
): Promise<ApiResponse<ElectionResponse>> => {
  return apiRequest('/elections', {
    method: 'POST',
    body: JSON.stringify(electionData),
  });
};

/**
 * Invite code ile seçimi getir
 * @param inviteCode - URL parametresi olarak gelen davet kodu
 */
export const getElectionByInviteCode = async (
  inviteCode: string
): Promise<ApiResponse<ElectionResponse>> => {
  return apiRequest(`/elections/invite/${inviteCode}`, { method: 'GET' });
};

/**
 * Seçim ID'si ile seçimi getir
 */
export const getElectionById = async (
  electionId: string
): Promise<ApiResponse<ElectionResponse>> => {
  return apiRequest(`/elections/${electionId}`, { method: 'GET' });
};

/**
 * Tüm seçimleri listele (Pagination desteği)
 */
export const listElections = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<{
  elections: ElectionResponse[];
  total: number;
  page: number;
  limit: number;
}>> => {
  return apiRequest(`/elections?page=${page}&limit=${limit}`, { method: 'GET' });
};

// ========================================
// CANDIDATE ENDPOINTS
// ========================================

/**
 * Seçime aday ekle
 */
export const addCandidate = async (
  electionId: string,
  candidateData: CreateCandidateRequest
): Promise<ApiResponse<Candidate>> => {
  return apiRequest(`/elections/${electionId}/candidates`, {
    method: 'POST',
    body: JSON.stringify(candidateData),
  });
};

/**
 * Seçimin adaylarını getir
 */
export const getCandidates = async (
  electionId: string
): Promise<ApiResponse<Candidate[]>> => {
  return apiRequest(`/elections/${electionId}/candidates`, { method: 'GET' });
};

// ========================================
// VOTING ENDPOINT (Strict Anonymity)
// ========================================

/**
 * Adaya oy ver
 *
 * ÖNEMLI: Strict Anonymity kuralı
 * - Sunucu, userId'yi kaydETMEZ
 * - Adayın voteCount'ı artar
 * - ElectionVoters tablosu, kullanıcının oy verip vermediğini takip eder (duplicate prevention)
 * - HTTP 403: Zaten oy vermişse
 *
 * @param electionId - Seçim ID'si
 * @param candidateId - Aday ID'si
 * @returns Güncellenmiş aday bilgileri
 */
export const voteForCandidate = async (
  electionId: string,
  candidateId: string
): Promise<ApiResponse<Candidate>> => {
  const response = await apiRequest<Candidate>(
    `/elections/${electionId}/candidates/${candidateId}/vote`,
    { method: 'POST' }
  );

  // HTTP 403 Forbidden: Zaten oy vermiş
  if (!response.success && response.statusCode === HTTP_STATUS.FORBIDDEN) {
    return {
      success: false,
      error: ERROR_MESSAGES.ALREADY_VOTED,
      statusCode: HTTP_STATUS.FORBIDDEN,
    };
  }

  return response;
};

// ========================================
// ELECTION RESULTS
// ========================================

/**
 * Seçim sonuçlarını getir (Tüm adaylar + oy sayıları)
 */
export const getElectionResults = async (
  electionId: string
): Promise<ApiResponse<{
  election: ElectionResponse;
  candidates: Candidate[];
  totalVotes: number;
}>> => {
  return apiRequest(`/elections/${electionId}/results`, { method: 'GET' });
};

/**
 * Seçim durumunu kontrol et
 */
export const checkElectionStatus = async (
  electionId: string
): Promise<ApiResponse<{
  status: string;
  isActive: boolean;
  isCompleted: boolean;
}>> => {
  return apiRequest(`/elections/${electionId}/status`, { method: 'GET' });
};

// ========================================
// ELECTION COMPLETION (Admin only)
// ========================================

/**
 * Seçimi kapat/tamamla (Creator/Admin yetkilendirmesi gerekir)
 */
export const completeElection = async (
  electionId: string
): Promise<ApiResponse<ElectionResponse>> => {
  return apiRequest(`/elections/${electionId}/complete`, {
    method: 'PATCH',
  });
};

// ========================================
// HELPER: Token Management
// ========================================

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
};

// ========================================
// HELPER: User Info
// ========================================

export const setCurrentUser = (user: UserResponse) => {
  localStorage.setItem('current_user', JSON.stringify(user));
};

export const getCurrentUserFromStorage = (): UserResponse | null => {
  const stored = localStorage.getItem('current_user');
  return stored ? JSON.parse(stored) : null;
};
/**
 * Backend API Entegrasyonu - MOCK SÜRÜMÜ
 * Gerçek backend olmadığı için tüm API çağrıları mock olarak simüle ediliyor
 * Strict Anonymity: Oy, adayın voteCount'ını arttırır, kullanıcıya link kurulmaz
 */

// Mock veriler için in-memory storage
const testElectionId = 'test-election-123';
const mockElections: any[] = [
  {
    id: testElectionId,
    creatorId: 'user-1',
    title: 'GDG on Campus Demo Seçimi',
    description: 'Bu bir test seçimidir. Geliştirme modunda bu kodu kullanarak sistemi test edebilirsiniz.',
    inviteCode: 'TEST-INVITE',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
    totalVotes: 0
  }
];

const mockCandidates: any[] = [
  { id: 'cand-1', electionId: testElectionId, name: 'Aday Ahmet', voteCount: 5 },
  { id: 'cand-2', electionId: testElectionId, name: 'Aday Ayşe', voteCount: 3 },
  { id: 'cand-3', electionId: testElectionId, name: 'Aday Mehmet', voteCount: 2 }
];

// Mock yardımcı fonksiyonları
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateInviteCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// Mock delay simülasyonu
const mockDelay = (ms: number = MOCK_API.DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API response wrapper
const mockApiResponse = <T>(data: T, success: boolean = true, error?: string, statusCode?: number): ApiResponse<T> => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : error,
  statusCode
});

import type {
  ApiResponse,
  ElectionResponse,
  CreateElectionRequest,
  Candidate,
  CreateCandidateRequest,
  UserResponse,
} from './types';
import { HTTP_STATUS, ERROR_MESSAGES, MOCK_API } from './config';

// ========================================
// MOCK AUTHENTICATION ENDPOINTS
// ========================================

/**
 * Kullanıcı giriş yapması - MOCK
 */
export const loginUser = async (email: string, password: string): Promise<ApiResponse<{
  token: string;
  user: UserResponse;
}>> => {
  await mockDelay();

  // Mock kullanıcı kontrolü
  if (email === 'test@example.com' && password === 'password') {
    const mockUser: UserResponse = {
      id: 'user-1',
      email,
      name: 'Test',
      surname: 'Kullanıcı',
      isApproved: true
    };
    return mockApiResponse({ token: 'mock-token-123', user: mockUser });
  }

  return mockApiResponse(undefined as any, false, 'Geçersiz email veya şifre', HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Yeni kullanıcı kaydı - MOCK
 */
export const registerUser = async (
  email: string,
  _password: string, // Kullanılmıyor, sadece interface için
  name: string,
  surname: string
): Promise<ApiResponse<{ user: UserResponse }>> => {
  await mockDelay();

  const mockUser: UserResponse = {
    id: generateId(),
    email,
    name,
    surname,
    isApproved: true
  };

  return mockApiResponse({ user: mockUser });
};

/**
 * Mevcut kullanıcı bilgilerini al - MOCK
 */
export const getCurrentUser = async (): Promise<ApiResponse<UserResponse>> => {
  await mockDelay();

  const mockUser: UserResponse = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test',
    surname: 'Kullanıcı',
    isApproved: true
  };

  return mockApiResponse(mockUser);
};

// ========================================
// MOCK ELECTION ENDPOINTS
// ========================================

/**
 * Yeni seçim oluştur - MOCK
 */
export const createElection = async (
  electionData: CreateElectionRequest
): Promise<ApiResponse<ElectionResponse>> => {
  await mockDelay();

  const newElection: ElectionResponse = {
    id: generateId(),
    creatorId: 'user-1', // Mock creator
    title: electionData.title || 'Yeni Seçim',
    description: electionData.description || '',
    inviteCode: generateInviteCode(),
    createdAt: new Date().toISOString(),
    expiresAt: electionData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün
    status: 'Active',
    candidates: [],
    totalVotes: 0
  };

  mockElections.push(newElection);

  // Mock adaylar ekle
  const mockCandidate1: Candidate = {
    id: generateId(),
    electionId: newElection.id,
    userId: null,
    name: 'Aday 1',
    voteCount: 0
  };

  const mockCandidate2: Candidate = {
    id: generateId(),
    electionId: newElection.id,
    userId: null,
    name: 'Aday 2',
    voteCount: 0
  };

  mockCandidates.push(mockCandidate1, mockCandidate2);
  newElection.candidates = [mockCandidate1, mockCandidate2];

  return mockApiResponse(newElection);
};

/**
 * Invite code ile seçimi getir - MOCK
 */
export const getElectionByInviteCode = async (
  inviteCode: string
): Promise<ApiResponse<ElectionResponse>> => {
  await mockDelay();

  const election = mockElections.find(e => e.inviteCode === inviteCode);

  if (!election) {
    return mockApiResponse(undefined as any, false, ERROR_MESSAGES.ELECTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  // Adayları ekle
  election.candidates = mockCandidates.filter(c => c.electionId === election.id);

  return mockApiResponse(election);
};

/**
 * Seçim ID'si ile seçimi getir - MOCK
 */
export const getElectionById = async (
  electionId: string
): Promise<ApiResponse<ElectionResponse>> => {
  await mockDelay();

  const election = mockElections.find(e => e.id === electionId);

  if (!election) {
    return mockApiResponse(undefined as any, false, ERROR_MESSAGES.ELECTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  election.candidates = mockCandidates.filter(c => c.electionId === election.id);

  return mockApiResponse(election);
};

/**
 * Tüm seçimleri listele - MOCK
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
  await mockDelay();

  const start = (page - 1) * limit;
  const end = start + limit;
  const elections = mockElections.slice(start, end);

  return mockApiResponse({
    elections,
    total: mockElections.length,
    page,
    limit
  });
};

// ========================================
// MOCK CANDIDATE ENDPOINTS
// ========================================

/**
 * Seçime aday ekle - MOCK
 */
export const addCandidate = async (
  electionId: string,
  candidateData: CreateCandidateRequest
): Promise<ApiResponse<Candidate>> => {
  await mockDelay();

  const newCandidate: Candidate = {
    id: generateId(),
    electionId,
    userId: candidateData.userId || null,
    name: candidateData.name,
    voteCount: 0
  };

  mockCandidates.push(newCandidate);

  return mockApiResponse(newCandidate);
};

/**
 * Seçimin adaylarını getir - MOCK
 */
export const getCandidates = async (
  electionId: string
): Promise<ApiResponse<Candidate[]>> => {
  await mockDelay();

  const candidates = mockCandidates.filter(c => c.electionId === electionId);

  return mockApiResponse(candidates);
};

// ========================================
// MOCK VOTING ENDPOINT (Strict Anonymity)
// ========================================

/**
 * Adaya oy ver - MOCK
 *
 * ÖNEMLI: Strict Anonymity kuralı
 * - userId hiç kaydedilmez
 * - Adayın voteCount'ı artar
 * - ElectionVoters tablosu, kullanıcının oy verip vermediğini takip eder (duplicate prevention)
 * - HTTP 403: Zaten oy vermişse (Mock: Rastgele %30 ihtimalle)
 *
 * @param electionId - Seçim ID'si
 * @param candidateId - Aday ID'si
 * @returns Güncellenmiş aday bilgileri
 */
export const voteForCandidate = async (
  electionId: string,
  candidateId: string
): Promise<ApiResponse<Candidate>> => {
  await mockDelay(MOCK_API.VOTE_DELAY_MS); // Oylama için daha uzun delay

  // Mock: Rastgele duplicate vote simülasyonu (%30 ihtimal)
  const isDuplicateVote = Math.random() < MOCK_API.DUPLICATE_VOTE_CHANCE;

  if (isDuplicateVote) {
    return mockApiResponse(undefined as any, false, ERROR_MESSAGES.ALREADY_VOTED, HTTP_STATUS.FORBIDDEN);
  }

  // Adayı bul ve oy sayısını artır
  const candidate = mockCandidates.find(c => c.id === candidateId && c.electionId === electionId);

  if (!candidate) {
    return mockApiResponse(undefined as any, false, 'Aday bulunamadı', HTTP_STATUS.NOT_FOUND);
  }

  // Oy sayısını artır (Strict Anonymity: userId kaydedilmez)
  candidate.voteCount += 1;

  return mockApiResponse(candidate);
};

// ========================================
// MOCK ELECTION RESULTS
// ========================================

/**
 * Seçim sonuçlarını getir - MOCK
 */
export const getElectionResults = async (
  electionIdOrCode: string
): Promise<ApiResponse<{
  election: ElectionResponse;
  candidates: Candidate[];
  totalVotes: number;
}>> => {
  await mockDelay();

  const election = mockElections.find(e => e.id === electionIdOrCode || e.inviteCode === electionIdOrCode);

  if (!election) {
    return mockApiResponse(undefined as any, false, ERROR_MESSAGES.ELECTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const candidates = mockCandidates.filter(c => c.electionId === election.id);
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return mockApiResponse({
    election,
    candidates,
    totalVotes
  });
};

/**
 * Seçim durumunu kontrol et - MOCK
 */
export const checkElectionStatus = async (
  electionId: string
): Promise<ApiResponse<{
  status: string;
  isActive: boolean;
  isCompleted: boolean;
}>> => {
  await mockDelay();

  const election = mockElections.find(e => e.id === electionId);

  if (!election) {
    return mockApiResponse(undefined as any, false, ERROR_MESSAGES.ELECTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isActive = election.status === 'Active';
  const isCompleted = election.status === 'Completed';

  return mockApiResponse({
    status: election.status,
    isActive,
    isCompleted
  });
};

// ========================================
// MOCK ELECTION COMPLETION
// ========================================

/**
 * Seçimi kapat/tammla - MOCK
 */
export const completeElection = async (
  electionId: string
): Promise<ApiResponse<ElectionResponse>> => {
  await mockDelay();

  const election = mockElections.find(e => e.id === electionId);

  if (!election) {
    return mockApiResponse(undefined as any, false, ERROR_MESSAGES.ELECTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  election.status = 'Completed';

  return mockApiResponse(election);
};

// ========================================
// MOCK HELPER: Token Management
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
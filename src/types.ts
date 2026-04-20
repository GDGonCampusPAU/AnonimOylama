/**
 * Backend Veritabanı Şeması - TypeScript Interface Tanımlamaları
 */

// ========================================
// ENUM TANIMLAR (Object Constants)
// ========================================

export const UserRoleEnum = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const ElectionStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
} as const;

export type UserRoleEnumType = typeof UserRoleEnum[keyof typeof UserRoleEnum];
export type ElectionStatusType = typeof ElectionStatus[keyof typeof ElectionStatus];

// ========================================
// USER ENTITY
// ========================================

export interface User {
  id: string; // UUID
  email: string;
  password: string;
  name: string;
  surname: string;
  isApproved: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  surname: string;
  isApproved: boolean;
}

// ========================================
// ROLE & USER ROLE
// ========================================

export interface Role {
  id: string;
  name: UserRoleEnumType;
}

export interface UserRoleRelation {
  userId: string;
  roleId: string;
}

// ========================================
// ELECTION ENTITY
// ========================================

export interface Election {
  id: string; // UUID
  creatorId: string; // User UUID
  title: string;
  description: string;
  inviteCode: string; // URL param (Unique)
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  status: ElectionStatusType;
  candidates: Candidate[];
}

export interface CreateElectionRequest {
  title: string;
  description?: string;
  expiresAt?: string;
}

export interface ElectionResponse {
  id: string;
  title: string;
  description: string;
  inviteCode: string;
  createdAt: string;
  expiresAt: string;
  status: ElectionStatusType;
  creatorId: string;
  candidates: Candidate[];
  totalVotes?: number;
}

// ========================================
// CANDIDATE ENTITY
// ========================================

export interface Candidate {
  id: string; // UUID
  electionId: string; // Election UUID
  userId?: string | null; // Nullable - eğer kullanıcı kendini aday gösterdiyse
  name: string;
  voteCount: number;
}

export interface CreateCandidateRequest {
  name: string;
  userId?: string;
}

export interface CandidateResponse extends Candidate {}

// ========================================
// ELECTION VOTER (Çift Oylama Önleme)
// ========================================

export interface ElectionVoter {
  userId: string; // User UUID
  electionId: string; // Election UUID
  votedAt: string; // ISO 8601
}

// ========================================
// API RESPONSE WRAPPER
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// ========================================
// UI STATE TYPES
// ========================================

export interface ElectionPageState {
  election: ElectionResponse | null;
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  hasVoted: boolean; // Kullanıcı oylama yaptı mı?
  alreadyVotedError: boolean; // HTTP 403 duplicate vote
}

export interface HomePageState {
  inviteCode: string;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
}

/**
 * Uygulama Konfigürasyonu ve Sabitler
 * Magic number kullanılmaz - tüm sabitler buradan gelir
 */

// ========================================
// API AYARLARI
// ========================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000, // ms
  RETRY_ATTEMPTS: 3,
} as const;

// ========================================
// AUTHENTICATION
// ========================================

export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'current_user',
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 gün
} as const;

// ========================================
// VALIDASYON RULES
// ========================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  INVITE_CODE_LENGTH: 6,
  INVITE_CODE_REGEX: /^[A-Z0-9]{6}$/,
  PASSWORD_MIN_LENGTH: 8,
  ELECTION_TITLE_MAX: 200,
  ELECTION_DESCRIPTION_MAX: 1000,
  CANDIDATE_NAME_MAX: 150,
} as const;

// ========================================
// UI CONSTANTS
// ========================================

export const UI = {
  LOADING_SPINNER_SIZE: 48, // px
  ANIMATION_DURATION: 300, // ms
  TOAST_DURATION: 5000, // ms
  DEFAULT_COLORS: {
    PRIMARY: '#3B82F6', // Mavi
    SECONDARY: '#8B5CF6', // Mor
    SUCCESS: '#10B981', // Yeşil
    ERROR: '#EF4444', // Kırmızı
    WARNING: '#F59E0B', // Sarı
  },
  CHART_COLORS: [
    '#3B82F6', // Mavi
    '#EF4444', // Kırmızı
    '#10B981', // Yeşil
    '#F59E0B', // Sarı
    '#8B5CF6', // Mor
    '#EC4899', // Pembe
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ],
} as const;

// ========================================
// HTTP STATUS CODES (Başlıklı Hata Yönetimi)
// ========================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403, // Zaten oy vermiş
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;

// ========================================
// ERROR MESSAGES
// ========================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısında hata. Lütfen tekrar deneyin.',
  UNAUTHORIZED: 'Yetkiniz yok. Lütfen giriş yapın.',
  ALREADY_VOTED: 'Bu seçimde zaten oy verdiniz. Her seçimde yalnızca bir kez oy verebilirsiniz.',
  ELECTION_NOT_FOUND: 'Seçim bulunamadı. Davet kodunu kontrol edin.',
  ELECTION_EXPIRED: 'Bu seçim sona ermiştir.',
  ELECTION_NOT_ACTIVE: 'Bu seçim henüz başlamadı.',
  INVALID_INVITE_CODE: 'Geçersiz davet kodu. Lütfen kontrol edin.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  UNKNOWN_ERROR: 'Bilinmeyen bir hata oluştu.',
} as const;

// ========================================
// SUCCESS MESSAGES
// ========================================

export const SUCCESS_MESSAGES = {
  ELECTION_CREATED: 'Seçim başarıyla oluşturuldu!',
  VOTE_SUBMITTED: 'Oyunuz kaydedildi. Teşekkürler!',
  CANDIDATE_ADDED: 'Aday başarıyla eklendi.',
} as const;

// ========================================
// ROUTES
// ========================================

export const ROUTES = {
  HOME: '/',
  ELECTION: '/election/:inviteCode',
  RESULTS: '/election/:inviteCode/results',
  ADMIN: '/admin',
} as const;

// ========================================
// MOCK API SETTINGS
// ========================================

export const MOCK_API = {
  DELAY_MS: 1000, // Mock API gecikme süresi
  VOTE_DELAY_MS: 1500, // Oylama için özel gecikme
  DUPLICATE_VOTE_CHANCE: 0.3, // Çift oylama simülasyonu ihtimali (30%)
} as const;

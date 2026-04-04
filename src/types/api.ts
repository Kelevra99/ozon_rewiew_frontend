export type UserRole = 'user' | 'admin' | 'superadmin';

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string | null;
  defaultTone?: string | null;
  toneNotes?: string | null;
  brandRules?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: UserDto;
};

export type RegisterRequest = {
  email: string;
  name: string;
  password: string;
};
export type RegisterResponse = {
  requiresEmailVerification: boolean;
  email: string;
  verificationEmailSent: boolean;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  ok: boolean;
  email: string;
};


export type ApiKeyItem = {
  id: string;
  name?: string | null;
  prefix?: string | null;
  createdAt?: string;
  lastUsedAt?: string | null;
  isActive?: boolean;
};

export type CreateApiKeyResponse = {
  apiKey?: ApiKeyItem;
  plainKey: string;
};

export type ExternalProvider = 'ozon' | 'wildberries' | 'yandex_market';

export type ExternalProviderCredentialItem = {
  id?: string | null;
  provider: ExternalProvider;
  isConfigured: boolean;
  maskedValue?: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastUsedAt?: string | null;
  lastValidatedAt?: string | null;
};

export type ProductItem = {
  id: string;
  article: string | null;
  name: string;
  brand?: string | null;
  model?: string | null;
  kit?: string | null;
  annotation?: string | null;
  tonePreset?: string | null;
  toneNotes?: string | null;
  productRules?: string | null;
  extra1Name?: string | null;
  extra1Value?: string | null;
  extra2Name?: string | null;
  extra2Value?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'canceled';

export type PaymentItem = {
  id: string;
  provider?: string | null;
  status?: PaymentStatus | string | null;
  amountMinor?: number | null;
  amountRub?: number | null;
  currency?: string | null;
  paymentUrl?: string | null;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  sbpPayload?: string | null;
  receiptEmail?: string | null;
  receiptPhone?: string | null;
  successUrl?: string | null;
  failUrl?: string | null;
  expiresAt?: string | null;
  errorMessage?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePaymentRequest = {
  amountRub: number;
  receiptEmail?: string;
  receiptPhone?: string;
};

export type ReviewMatchedProduct = {
  id: string;
  article?: string | null;
  name: string;
};

export type ReviewLogItem = {
  id: string;
  status?: string | null;
  marketplace?: string | null;
  productName?: string | null;
  matchedProduct?: ReviewMatchedProduct | null;
  reviewText?: string | null;
  generatedReply?: string | null;
  finalReply?: string | null;
  rating?: number | null;
  createdAt?: string;
};

export type PaginatedReviewHistoryResponse = {
  items: ReviewLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

export type WalletBalanceResponse = {
  balanceMinor?: number;
  balanceRub?: number;
  amountMinor?: number;
  amountRub?: number;
};

export type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
};

export type ProductImportPreviewSampleItem = {
  article: string;
  name: string;
  brand?: string | null;
  kit?: string | null;
  annotation?: string | null;
};

export type ProductImportPreviewResponse = {
  draftToken: string;
  sourceType: 'ozon_xlsx';
  totalRows: number;
  availableExtraColumns: string[];
  sample: ProductImportPreviewSampleItem[];
};

export type ProductImportCommitResponse = {
  draftToken: string;
  importId: string;
  importedRows: number;
};

export type DashboardDailyStat = {
  date: string;
  repliesCount: number;
  spentRub: number;
  avgRating: number;
};

export type DashboardDailyStatsResponse = {
  days: number;
  items: DashboardDailyStat[];
};

export type AdminDashboardDailyItem = {
  date: string;
  topupRub: number;
  chargedRub: number;
  openAiCostRub: number;
  grossProfitRub: number;
  repliesCount: number;
  paidPaymentsCount: number;
  promptLogsCount: number;
};

export type AdminDashboardSummaryResponse = {
  days: number;
  counts: {
    users: number;
    reviews: number;
    payments: number;
    promptLogs: number;
  };
  today: AdminDashboardDailyItem;
  items: AdminDashboardDailyItem[];
};

export type AdminMiniUser = {
  id: string;
  email: string;
  name: string | null;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  balanceMinor: number;
  balanceRub: number;
  productsCount: number;
  reviewsCount: number;
  totalTopupMinor: number;
  totalSpentMinor: number;
};


export type AdminSetUserPasswordRequest = {
  password: string;
};

export type AdminSetUserPasswordResponse = {
  ok: boolean;
  userId: string;
  email: string;
};

export type AdminReviewListItem = {
  id: string;
  status?: string | null;
  rating?: number | null;
  reviewText?: string | null;
  createdAt?: string;
  promptMode?: string | null;
  detectedProductName?: string | null;
  user?: AdminMiniUser | null;
  product?: ReviewMatchedProduct | null;
  usageLogs?: Array<{
    model?: string | null;
    createdAt?: string;
  }>;
  reviewCost?: {
    chargedRub?: number | string | null;
    openAiCostRub?: number | string | null;
    model?: string | null;
  } | null;
};

export type AdminPaymentListItem = {
  id: string;
  status?: PaymentStatus | string | null;
  provider?: string | null;
  amountMinor: number;
  currency?: string | null;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: AdminMiniUser | null;
};

export type AdminPromptLogItem = {
  id: string;
  userId: string;
  reviewLogId?: string | null;
  serviceTierCode: string;
  model: string;
  systemPrompt: string;
  assembledPrompt: string;
  generatedReply?: string | null;
  productContextJson?: unknown;
  createdAt: string;
  user?: AdminMiniUser | null;
  reviewLog?: {
    id: string;
    rating?: number | null;
    reviewText?: string | null;
    generatedReply?: string | null;
    createdAt?: string;
    user?: AdminMiniUser | null;
    product?: ReviewMatchedProduct | null;
    reviewCost?: {
      chargedRub?: number | string | null;
      openAiCostRub?: number | string | null;
    } | null;
  } | null;
};

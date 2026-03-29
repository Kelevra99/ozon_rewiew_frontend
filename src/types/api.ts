export type UserRole = 'user' | 'admin' | 'superadmin';

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive?: boolean;
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
  replyContextShort?: string | null;
  extra1Name?: string | null;
  extra1Value?: string | null;
  extra2Name?: string | null;
  extra2Value?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductContextModeItem = {
  code: 'standard' | 'advanced' | 'expert';
  title: string;
  openAiModel: string;
};

export type GenerateProductContextResponse = {
  productId: string;
  article: string;
  productName: string;
  replyContextShort: string;
  mode: 'standard' | 'advanced' | 'expert';
  model: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
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

export type ReviewLogItem = {
  id: string;
  status?: string | null;
  marketplace?: string | null;
  productName?: string | null;
  matchedProduct?: string | null;
  reviewText?: string | null;
  generatedReply?: string | null;
  finalReply?: string | null;
  rating?: number | null;
  createdAt?: string;
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

import crypto from "crypto";

export const DIDIT_STATUSES = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  APPROVED: "Approved",
  DECLINED: "Declined",
  IN_REVIEW: "In Review",
  RESUBMITTED: "Resubmitted",
  EXPIRED: "Expired",
  ABANDONED: "Abandoned",
  KYC_EXPIRED: "Kyc Expired",
} as const;

export type DiditStatus = (typeof DIDIT_STATUSES)[keyof typeof DIDIT_STATUSES];

export type AppKycStatus =
  | "NOT_STARTED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

type CreateDiditSessionParams = {
  vendorData: string;
  callbackUrl: string;
  workflowId?: string;
};

type RawDiditCreateSessionResponse = {
  session_id?: string;
  sessionId?: string;
  id?: string;
  verification_url?: string;
  verificationUrl?: string;
  url?: string;
  status?: string;
  expires_at?: string;
  expiresAt?: string;
  data?: {
    session_id?: string;
    sessionId?: string;
    id?: string;
    verification_url?: string;
    verificationUrl?: string;
    url?: string;
    status?: string;
    expires_at?: string;
    expiresAt?: string;
  };
  [key: string]: unknown;
};

export type DiditCreateSessionResponse = {
  session_id: string;
  verification_url: string;
  url: string;
  status?: string;
  expires_at?: string;
  raw: RawDiditCreateSessionResponse;
};

function getDiditBaseUrl() {
  return (
    process.env.DIDIT_VERIFICATION_BASE_URL ||
    process.env.DIDIT_BASE_URL ||
    "https://verification.didit.me"
  ).replace(/\/$/, "");
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function mapDiditStatusToAppKycStatus(
  diditStatus: string | null | undefined,
): AppKycStatus | null {
  switch (diditStatus) {
    case DIDIT_STATUSES.APPROVED:
      return "VERIFIED";
    case DIDIT_STATUSES.DECLINED:
      return "REJECTED";
    case DIDIT_STATUSES.IN_REVIEW:
      return "PENDING_REVIEW";
    case DIDIT_STATUSES.KYC_EXPIRED:
      return "NOT_STARTED";
    default:
      return null;
  }
}

export function resolveDiditKycFinalState(
  diditStatus: string | null | undefined,
): {
  providerStatus: string | null;
  appStatus: AppKycStatus;
  isVerified: boolean;
} {
  const providerStatus =
    typeof diditStatus === "string" && diditStatus.trim()
      ? diditStatus.trim()
      : null;

  const appStatus =
    mapDiditStatusToAppKycStatus(providerStatus) ?? "NOT_STARTED";

  return {
    providerStatus,
    appStatus,
    isVerified: appStatus === "VERIFIED",
  };
}

export function isDiditResumableStatus(status: string | null | undefined) {
  return (
    status === DIDIT_STATUSES.NOT_STARTED ||
    status === DIDIT_STATUSES.IN_PROGRESS ||
    status === DIDIT_STATUSES.RESUBMITTED
  );
}

export function isDiditInactiveStatus(status: string | null | undefined) {
  return (
    status === DIDIT_STATUSES.EXPIRED || status === DIDIT_STATUSES.ABANDONED
  );
}

export function isDiditRetryableStatus(status: string | null | undefined) {
  return (
    !status ||
    status === DIDIT_STATUSES.EXPIRED ||
    status === DIDIT_STATUSES.ABANDONED ||
    status === DIDIT_STATUSES.DECLINED ||
    status === DIDIT_STATUSES.KYC_EXPIRED
  );
}

export function isDiditActiveStatus(status: string | null | undefined) {
  return isDiditResumableStatus(status) || status === DIDIT_STATUSES.IN_REVIEW;
}

export function isDiditSessionStale(
  updatedAt: Date | string | null | undefined,
) {
  if (!updatedAt) return false;

  const timestamp =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : new Date(updatedAt).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const ageMs = Date.now() - timestamp;
  return ageMs > 30 * 60 * 1000;
}

function sortKeysDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {}) as T;
  }

  return value;
}

function shortenWholeNumberFloats<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => shortenWholeNumberFloats(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        shortenWholeNumberFloats(nested),
      ]),
    ) as T;
  }

  if (
    typeof value === "number" &&
    !Number.isInteger(value) &&
    value % 1 === 0
  ) {
    return Math.trunc(value) as T;
  }

  return value;
}

function verifyDiditJsonSignature(
  body: unknown,
  signature: string,
  secret: string,
) {
  const canonicalJson = JSON.stringify(
    sortKeysDeep(shortenWholeNumberFloats(body)),
  );

  const expected = crypto
    .createHmac("sha256", secret)
    .update(canonicalJson, "utf8")
    .digest("hex");

  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}

function verifyDiditRawSignature(
  rawBody: string,
  signature: string,
  secret: string,
) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}

function normalizeDiditCreateSessionResponse(
  payload: RawDiditCreateSessionResponse,
): DiditCreateSessionResponse {
  const sessionId =
    payload.session_id ??
    payload.sessionId ??
    payload.id ??
    payload.data?.session_id ??
    payload.data?.sessionId ??
    payload.data?.id;

  const url =
    payload.verification_url ??
    payload.verificationUrl ??
    payload.url ??
    payload.data?.verification_url ??
    payload.data?.verificationUrl ??
    payload.data?.url;

  const status = payload.status ?? payload.data?.status;
  const expiresAt =
    payload.expires_at ??
    payload.expiresAt ??
    payload.data?.expires_at ??
    payload.data?.expiresAt;

  if (!sessionId || !url) {
    throw new Error(
      `Didit session response is missing session_id or url: ${JSON.stringify(payload)}`,
    );
  }

  return {
    session_id: sessionId,
    verification_url: url,
    url,
    status,
    expires_at: expiresAt,
    raw: payload,
  };
}

export async function createDiditSession({
  vendorData,
  callbackUrl,
  workflowId,
}: CreateDiditSessionParams): Promise<DiditCreateSessionResponse> {
  const apiKey = getRequiredEnv("DIDIT_API_KEY");
  const resolvedWorkflowId = workflowId || getRequiredEnv("DIDIT_WORKFLOW_ID");

  const response = await fetch(`${getDiditBaseUrl()}/v3/session/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      workflow_id: resolvedWorkflowId,
      callback: callbackUrl,
      callback_method: "both",
      vendor_data: vendorData,
    }),
    cache: "no-store",
  });

  const text = await response.text();

  let parsed: RawDiditCreateSessionResponse;
  try {
    parsed = JSON.parse(text) as RawDiditCreateSessionResponse;
  } catch {
    throw new Error(
      `Didit create session returned non-JSON response: ${response.status} ${text}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Didit create session failed: ${response.status} ${JSON.stringify(parsed)}`,
    );
  }

  return normalizeDiditCreateSessionResponse(parsed);
}

export async function retrieveDiditSession(sessionId: string) {
  const apiKey = getRequiredEnv("DIDIT_API_KEY");

  const response = await fetch(
    `${getDiditBaseUrl()}/v3/session/${sessionId}/decision/`,
    {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Didit retrieve session failed: ${response.status} ${text}`,
    );
  }

  return response.json();
}

export function buildDiditRedirectUrl(sessionIdOrUrl: string) {
  if (sessionIdOrUrl.startsWith("http")) return sessionIdOrUrl;
  return `${getDiditBaseUrl()}/session/${sessionIdOrUrl}`;
}

export function verifyDiditWebhookSignature(params: {
  rawBody: string;
  parsedBody: unknown;
  signatureV2?: string | null;
  signatureSimple?: string | null;
  signatureRaw?: string | null;
  timestamp?: string | null;
}) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing environment variable: DIDIT_WEBHOOK_SECRET");
  }

  const {
    rawBody,
    parsedBody,
    signatureV2,
    signatureSimple,
    signatureRaw,
    timestamp,
  } = params;

  if (!timestamp) {
    return false;
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parsedTimestamp) > 300) {
    return false;
  }

  if (
    signatureV2 &&
    verifyDiditJsonSignature(parsedBody, signatureV2, secret)
  ) {
    return true;
  }

  if (
    signatureSimple &&
    typeof parsedBody === "object" &&
    parsedBody !== null &&
    !Array.isArray(parsedBody)
  ) {
    const body = parsedBody as Record<string, unknown>;
    const canonicalString = [
      String(body.timestamp ?? timestamp ?? ""),
      String(body.session_id ?? ""),
      String(body.status ?? ""),
      String(body.webhook_type ?? ""),
    ].join(":");

    const expected = crypto
      .createHmac("sha256", secret)
      .update(canonicalString, "utf8")
      .digest("hex");

    if (expected.length === signatureSimple.length) {
      return crypto.timingSafeEqual(
        Buffer.from(expected, "utf8"),
        Buffer.from(signatureSimple, "utf8"),
      );
    }
  }

  if (signatureRaw) {
    return verifyDiditRawSignature(rawBody, signatureRaw, secret);
  }

  return false;
}

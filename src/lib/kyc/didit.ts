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

type DiditCreateSessionResponse = {
  session_id: string;
  url: string;
  status?: string;
  expires_at?: string;
};

function getDiditBaseUrl() {
  return process.env.DIDIT_BASE_URL || "https://verification.didit.me";
}

function getDiditApiBaseUrl() {
  return process.env.DIDIT_API_BASE_URL || "https://api.didit.me";
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
  return (
    status === DIDIT_STATUSES.NOT_STARTED ||
    status === DIDIT_STATUSES.IN_PROGRESS ||
    status === DIDIT_STATUSES.RESUBMITTED ||
    status === DIDIT_STATUSES.IN_REVIEW
  );
}

export function isDiditSessionStale(
  updatedAt: Date | string | null | undefined,
) {
  if (!updatedAt) return false;

  const timestamp =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : new Date(updatedAt).getTime();

  const ageMs = Date.now() - timestamp;
  return ageMs > 30 * 60 * 1000;
}

export async function createDiditSession({
  vendorData,
  callbackUrl,
  workflowId,
}: CreateDiditSessionParams): Promise<DiditCreateSessionResponse> {
  const apiKey = getRequiredEnv("DIDIT_API_KEY");
  const resolvedWorkflowId = workflowId || getRequiredEnv("DIDIT_WORKFLOW_ID");

  const response = await fetch(`${getDiditApiBaseUrl()}/v2/session/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      workflow_id: resolvedWorkflowId,
      callback: callbackUrl,
      vendor_data: vendorData,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Didit create session failed: ${response.status} ${text}`);
  }

  return response.json();
}

export async function retrieveDiditSession(sessionId: string) {
  const apiKey = getRequiredEnv("DIDIT_API_KEY");

  const response = await fetch(
    `${getDiditApiBaseUrl()}/v2/session/${sessionId}/`,
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

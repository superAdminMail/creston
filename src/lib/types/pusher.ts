export type VerificationStatus =
  | "NOT_STARTED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type VerificationUpdatedEvent = {
  status: VerificationStatus;
};

"use client";

import { useState } from "react";
import { toast } from "sonner";

type KycStatus = "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

export default function KYCSection({
  initialStatus,
  userId,
}: {
  initialStatus: KycStatus;
  userId: string;
}) {
  const [status, setStatus] = useState<KycStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const startKYC = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/kyc/start", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!data?.url) {
        throw new Error("Failed to start verification");
      }

      // redirect to Didit
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error("Failed to start verification. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "NOT_STARTED") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Verify your identity to unlock full access.
        </p>

        <button
          onClick={startKYC}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Verify Identity"}
        </button>
      </div>
    );
  }

  if (status === "PENDING_REVIEW") {
    return (
      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-700 font-medium">
          ⏳ Verification in progress
        </p>
        <p className="text-sm text-yellow-600">
          This usually takes a few seconds. You can refresh this page.
        </p>
      </div>
    );
  }

  if (status === "VERIFIED") {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
        <p className="text-green-700 font-semibold">✅ Identity Verified</p>
        <p className="text-sm text-green-600">
          Your account is fully verified.
        </p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="space-y-3 p-4 rounded-lg bg-red-50 border border-red-200">
        <div>
          <p className="text-red-700 font-medium">❌ Verification failed</p>
          <p className="text-sm text-red-600">
            Your facial verification did not match your document.
          </p>
        </div>

        <button
          onClick={startKYC}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  return null;
}

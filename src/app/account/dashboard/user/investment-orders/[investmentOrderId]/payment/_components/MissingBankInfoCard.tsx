"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestInvestmentOrderBankInfo } from "@/actions/accounts/payments/requestInvestmentOrderBankInfo";

export default function MissingBankInfoCard({
  orderId,
  hasExistingRequest,
}: {
  orderId: string;
  hasExistingRequest: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [requestedLocal, setRequestedLocal] = useState(false);
  const bankInfoRequested = hasExistingRequest || requestedLocal;

  async function handleRequest() {
    setLoading(true);
    const result = await requestInvestmentOrderBankInfo(orderId);
    setLoading(false);

    if (result.ok) {
      setRequestedLocal(true);
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Bank info unavailable</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Bank transfer details are not currently available for this order. You
          can request private bank instructions from support or the admin team.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleRequest}
            disabled={loading || bankInfoRequested}
          >
            {bankInfoRequested
              ? "Request already sent"
              : "Request bank info"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

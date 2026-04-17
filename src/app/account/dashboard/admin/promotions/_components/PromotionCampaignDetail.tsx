import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnumLabel } from "@/lib/formatters/formatters";

import type { PromotionCampaignDetails } from "../_lib/getPromotionCampaignDetails";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function PromotionCampaignDetail({
  campaign,
}: {
  campaign: PromotionCampaignDetails;
}) {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{campaign.title}</CardTitle>
              {campaign.subject ? (
                <p className="text-sm text-muted-foreground">
                  Subject: {campaign.subject}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Created by{" "}
                {campaign.createdBy.name ||
                  campaign.createdBy.email ||
                  "Unknown"}{" "}
                - {formatDate(campaign.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {formatEnumLabel(campaign.channel)}
              </Badge>
              <Badge variant="outline">
                {formatEnumLabel(campaign.audienceType)}
              </Badge>
              <Badge>{formatEnumLabel(campaign.status)}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total deliveries" value={campaign.stats.total} />
            <StatCard label="Sent" value={campaign.stats.sent} />
            <StatCard label="Delivered" value={campaign.stats.delivered} />
            <StatCard label="Read" value={campaign.stats.read} />
            <StatCard label="Pending" value={campaign.stats.pending} />
            <StatCard label="Failed" value={campaign.stats.failed} />
            <StatCard label="Cancelled" value={campaign.stats.cancelled} />
            <StatCard
              label="Broadcast"
              value={campaign.sendToAllUsers ? "Yes" : "No"}
            />
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Campaign message
            </p>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {campaign.message}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Scheduled
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatDate(campaign.scheduledAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Started
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatDate(campaign.startedAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Completed
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatDate(campaign.completedAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Failed at
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatDate(campaign.failedAt)}
              </p>
            </div>
          </div>

          {campaign.failureMessage ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {campaign.failureMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Delivery history</CardTitle>
        </CardHeader>

        <CardContent>
          {campaign.deliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No deliveries were created for this campaign.
            </p>
          ) : (
            <div className="space-y-4">
              {campaign.deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="rounded-2xl border border-border/60 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {delivery.user.name || "Unnamed user"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.user.email ||
                          delivery.emailAddress ||
                          "No email"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {formatEnumLabel(delivery.channel)}
                      </Badge>
                      <Badge>{formatEnumLabel(delivery.status)}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {formatDate(delivery.createdAt)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email sent:</span>{" "}
                      {formatDate(delivery.emailSentAt)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivered:</span>{" "}
                      {formatDate(delivery.deliveredAt)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Read:</span>{" "}
                      {formatDate(delivery.readAt)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>{" "}
                      {formatDate(delivery.failedAt)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Notification:
                      </span>{" "}
                      {delivery.notification ? delivery.notification.title : "-"}
                    </div>
                  </div>

                  {delivery.failureMessage ? (
                    <p className="mt-3 text-sm text-destructive">
                      <span className="font-medium">Failure:</span>{" "}
                      {delivery.failureMessage}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

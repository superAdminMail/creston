"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import {
  PromotionAudienceType,
  PromotionChannel,
  type UserRole,
} from "@/generated/prisma";
import { promotionTypeSchema } from "@/lib/zodValidations/promotion";

import {
  CreatePromotionCampaignActionState,
  createPromotionCampaignAction,
} from "@/actions/admin/promotions/createPromotionCampaignAction";

type PromotionUserOption = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type RecentCampaign = {
  id: string;
  title: string;
  subject: string | null;
  audienceType: string;
  channel: string;
  status: string;
  promoCode: string | null;
  rewardEnabled: boolean;
  rewardAmount: string;
  rewardCurrency: string;
  maxRedemptions: number | null;
  redemptionCount: number;
  createdAt: string;
  completedAt: string | null;
  createdBy: string;
  deliveryCount: number;
};

type Props = {
  siteName: string;
  users: PromotionUserOption[];
  recentCampaigns: RecentCampaign[];
};

const initialState: CreatePromotionCampaignActionState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send promotion"}
    </Button>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function PromotionCampaignForm({
  siteName,
  users,
  recentCampaigns,
}: Props) {
  const [state, formAction] = useActionState(
    createPromotionCampaignAction,
    initialState,
  );
  const [inviteMode, setInviteMode] = useState(false);

  const userOptions = useMemo(() => {
    return users.map((user) => ({
      ...user,
      label: `${user.name || "Unnamed user"} (${user.email})`,
    }));
  }, [users]);

  function buildInviteLink(campaign: { promoCode: string | null }) {
    if (!campaign.promoCode) {
      return null;
    }

    return `/auth/get-started?promo=${encodeURIComponent(campaign.promoCode)}`;
  }

  async function copyInviteLink(campaign: { promoCode: string | null }) {
    const link = buildInviteLink(campaign);

    if (!link || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied.");
  }

  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${state.campaignId ?? ""}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.campaignId, state.message, state.status]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <Card className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-lg sm:text-xl">Send promotion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send a promotional message to one user by email or push a broadcast
            to all users in-app or by email.
          </p>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
          <form action={formAction} className="space-y-5">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Campaign title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Spring bonus update"
                required
              />
            </div>

            <input
              type="hidden"
              name="rewardEnabled"
              value={inviteMode ? "true" : "false"}
            />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Invite link campaign
                  </p>
                  <p className="text-xs text-slate-400">
                    Turn this on to create a promo code users can redeem after
                    signup.
                  </p>
                </div>

                <Switch checked={inviteMode} onCheckedChange={setInviteMode} />
              </div>
            </div>

            {inviteMode ? (
              <div className="grid gap-4 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="promoCode" className="text-sm font-medium">
                    Promo code
                  </label>
                  <Input
                    id="promoCode"
                    name="promoCode"
                    placeholder="SAVE100"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="rewardAmount" className="text-sm font-medium">
                    Reward amount
                  </label>
                  <Input
                    id="rewardAmount"
                    name="rewardAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="100"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="rewardCurrency"
                    className="text-sm font-medium"
                  >
                    Currency
                  </label>
                  <Input
                    id="rewardCurrency"
                    name="rewardCurrency"
                    defaultValue="USD"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="maxRedemptions" className="text-sm font-medium">
                    Max redemptions
                  </label>
                  <Input
                    id="maxRedemptions"
                    name="maxRedemptions"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Unlimited"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="startsAt" className="text-sm font-medium">
                    Starts at
                  </label>
                  <Input
                    id="startsAt"
                    name="startsAt"
                    type="datetime-local"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="expiresAt" className="text-sm font-medium">
                    Expires at
                  </label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="datetime-local"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            ) : null}

            {!inviteMode ? (
              <div className="grid gap-2">
              <label htmlFor="promotionType" className="text-sm font-medium">
                Promotion type
              </label>
              <Select name="promotionType" defaultValue="ANNOUNCEMENT">
                <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue placeholder="Choose promotion type" />
                </SelectTrigger>
                <SelectContent>
                  {promotionTypeSchema.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This type is stored with the campaign metadata and used for
                notification presentation.
              </p>
            </div>
            ) : (
              <input type="hidden" name="promotionType" value="SYSTEM" />
            )}

            {!inviteMode ? (
              <div className="grid gap-2">
              <label htmlFor="channel" className="text-sm font-medium">
                Channel
              </label>
              <Select name="channel" defaultValue={PromotionChannel.IN_APP}>
                <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue placeholder="Choose channel" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value={PromotionChannel.IN_APP}>In-app</SelectItem>
                <SelectItem value={PromotionChannel.EMAIL}>Email</SelectItem>
              </SelectContent>
            </Select>
            </div>
            ) : (
              <input type="hidden" name="channel" value={PromotionChannel.IN_APP} />
            )}

            {!inviteMode ? (
              <div className="grid gap-2">
              <label htmlFor="audienceType" className="text-sm font-medium">
                Audience
              </label>
              <Select
                name="audienceType"
                defaultValue={PromotionAudienceType.SINGLE_USER}
              >
                <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue placeholder="Choose audience" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value={PromotionAudienceType.SINGLE_USER}>
                  Single user
                </SelectItem>
                <SelectItem value={PromotionAudienceType.BROADCAST_ALL_USERS}>
                  Broadcast to all users
                </SelectItem>
              </SelectContent>
            </Select>
            </div>
            ) : (
              <input
                type="hidden"
                name="audienceType"
                value={PromotionAudienceType.BROADCAST_ALL_USERS}
              />
            )}

            {!inviteMode ? (
              <div className="grid gap-2">
              <label htmlFor="userId" className="text-sm font-medium">
                Select user
              </label>
              <Select name="userId">
                <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue placeholder="Choose a user for single-user sends" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This field is required only when the audience is set to single
                user.
              </p>
            </div>
            ) : null}

            <div className="grid gap-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Email subject
              </label>
              <Input
                id="subject"
                name="subject"
                placeholder={`Limited-time ${siteName} promotion update`}
              />
              <p className="text-xs text-muted-foreground">
                Required for email campaigns. Optional for in-app campaigns.
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={8}
                placeholder="Write the promotion message that users will receive."
                required
              />
            </div>

            {state.message ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  state.status === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {state.message}
              </div>
            ) : null}

            <div className="flex items-center justify-end">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-lg sm:text-xl">Recent campaigns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor recently created promotional sends and their delivery scope.
          </p>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
          {recentCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No campaigns have been created yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{campaign.title}</p>
                      {campaign.subject ? (
                        <p className="text-sm text-slate-400">
                          {campaign.subject}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-500">
                        Created by {campaign.createdBy} -{" "}
                        {formatDate(campaign.createdAt)}
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
                      {campaign.rewardEnabled ? (
                        <Badge className="border-blue-400/20 bg-blue-400/10 text-blue-200">
                          Invite
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Deliveries:</span>{" "}
                      {campaign.deliveryCount}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      {formatDate(campaign.completedAt)}
                    </div>
                    {campaign.rewardEnabled ? (
                      <>
                        <div>
                          <span className="text-muted-foreground">
                            Promo code:
                          </span>{" "}
                          {campaign.promoCode ?? "-"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Rewards redeemed:
                          </span>{" "}
                          {campaign.redemptionCount}
                          {campaign.maxRedemptions != null
                            ? ` / ${campaign.maxRedemptions}`
                            : ""}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Reward amount:
                          </span>{" "}
                          {campaign.rewardAmount} {campaign.rewardCurrency}
                        </div>
                            <div className="flex items-center justify-end">
                              {campaign.promoCode ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl border-white/10 bg-white/[0.03]"
                                  onClick={() => copyInviteLink(campaign)}
                                >
                                  Copy invite link
                                </Button>
                              ) : null}
                            </div>
                            {campaign.promoCode ? (
                              <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 md:col-span-2">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                  Signup link
                                </p>
                                <p className="mt-2 break-all text-sm text-white/90">
                                  {buildInviteLink(campaign) ?? "-"}
                                </p>
                              </div>
                            ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

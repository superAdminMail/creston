"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createConversationAction } from "@/actions/inbox/createConversationAction";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { NewConversation } from "@/lib/types/chat.types";
import { useCurrentUserQuery } from "@/stores/useCurrentUserQuery";
import { getSupportIssueTypeLabel } from "@/lib/support/supportConversationView";
import {
  supportFormSchema,
  SupportFormValues,
} from "@/lib/zodValidations/support";

type Props = {
  onCreated: (conversation: NewConversation) => void;
  onClose: () => void;
};

export default function NewConversationModal({ onCreated, onClose }: Props) {
  const { data: user } = useCurrentUserQuery();
  const [isPending, startTransition] = useTransition();

  const role = user?.role?.toLowerCase() ?? "user";

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      issueType: undefined,
      referenceId: "",
      message: "",
    },
  });

  const ISSUE_LABEL: Record<string, string> = {
    user: "Inv Order ID (optional)",
    super_admin: "Inv Order ID (Optional)",
    admin: "Support ID Issue (Optional)",
    moderator: "Support ID Issue (Optional)",
  };

  const ISSUE_PLACEHOLDER: Record<string, string> = {
    user: "e.g INV-001",
    super_admin: "e.g INV-203",
    admin: "e.g SUP-124",
    moderator: "e.g SUP-134",
  };

  function onSubmit(values: SupportFormValues) {
    startTransition(async () => {
      const issueLabel = getSupportIssueTypeLabel(values.issueType);
      const subject = values.referenceId
        ? `${issueLabel} • ${values.referenceId}`
        : issueLabel;

      const res = await createConversationAction({
        subject,
        message: values.message,
      });

      if (!res?.ok) {
        toast.error(res?.error ?? "Failed to submit ticket");
        return;
      }

      toast.success("Support ticket submitted");

      onCreated(res.conversation);
      onClose();
    });
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 text-white/[0.85]"
      >
        {/* NAME */}
        <Controller
          control={form.control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Full Name</FieldLabel>

              <FieldContent>
                <Input
                  placeholder="John Doe"
                  {...field}
                  className="bg-white/[0.04] border-white/10 focus:border-blue-400"
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        {/* EMAIL */}
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Email Address</FieldLabel>

              <FieldContent>
                <Input
                  type="email"
                  {...field}
                  className="bg-white/[0.04] border-white/10 focus:border-blue-400"
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        {/* ISSUE TYPE */}
        <Controller
          control={form.control}
          name="issueType"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Type of Issue</FieldLabel>

              <FieldContent>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white/[0.04] border-white/10">
                    <SelectValue placeholder="Choose issue type" />
                  </SelectTrigger>

                  <SelectContent className="px-2 py-2">
                    <SelectItem value="payments">Payments</SelectItem>
                    <SelectItem value="investment_inquiries">
                      Investment Inquiries
                    </SelectItem>
                    <SelectItem value="account_issues">
                      Account Issues
                    </SelectItem>
                    <SelectItem value="technical_issues">
                      Technical Issues
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        {/* REFERENCE */}
        <Controller
          control={form.control}
          name="referenceId"
          render={({ field }) => (
            <Field>
              <FieldLabel>
                {ISSUE_LABEL[role] ?? "Reference ID (Optional)"}
              </FieldLabel>

              <FieldContent>
                <Input
                  placeholder={ISSUE_PLACEHOLDER[role] ?? "Enter reference ID"}
                  {...field}
                  className="bg-white/[0.04] border-white/10 focus:border-blue-400"
                />
              </FieldContent>
            </Field>
          )}
        />

        {/* MESSAGE */}
        <Controller
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Describe your issue</FieldLabel>

              <FieldContent>
                <Textarea
                  rows={5}
                  {...field}
                  className="bg-white/[0.04] border-white/10 focus:border-blue-400"
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="destructive" onClick={onClose}>
            Cancel
          </Button>

          <Button disabled={isPending} className="bg-[var(--brand-blue)]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

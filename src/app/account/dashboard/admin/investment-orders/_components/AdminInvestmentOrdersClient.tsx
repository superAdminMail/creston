"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import {
  ArrowRight,
  Ban,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Trash2,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { pauseAdminInvestmentOrder } from "@/actions/admin/investment-order/pauseAdminInvestmentOrder";
import { resumeAdminInvestmentOrder } from "@/actions/admin/investment-order/resumeAdminInvestmentOrder";
import type {
  AdminInvestmentOrdersData,
  AdminInvestmentOrderListItem,
} from "@/actions/admin/investment-order/getAdminInvestmentOrders";
import { cancelAdminInvestmentOrder } from "@/actions/admin/investment-order/cancelAdminInvestmentOrder";
import { deleteAdminInvestmentOrder as rejectAdminInvestmentOrder } from "@/actions/admin/investment-order/deleteAdminInvestmentOrder";
import {
  createInitialFormState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AdminOperationsShell,
  type AdminOperationsStat,
} from "../../_components/AdminOperationsShell";
import { AdminResponsiveCollectionShell } from "../../_components/AdminResponsiveCollectionShell";
import { InvestmentOrderRuntimeStatusDialog } from "./InvestmentOrderRuntimeStatusDialog";

const orderActionDialogSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required before submitting this action."),
  adminNotes: z.string().optional(),
});

type OrderActionFieldName = "orderId" | "reason" | "adminNotes";
const initialOrderActionState = createInitialFormState<OrderActionFieldName>();
function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300";
    case "PENDING_CONFIRMATION":
    case "PAID":
    case "PARTIALLY_PAID":
      return "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300";
    case "CANCELLED":
    case "REJECTED":
      return "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300";
    default:
      return "border-slate-200/80 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";
  }
}

function getRuntimeStatusClasses(status: string) {
  switch (status) {
    case "PAUSED":
      return "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300";
    case "ONGOING":
    case "ACTIVE":
      return "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300";
    case "COMPLETED":
    case "CLOSED":
      return "border-slate-200/80 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";
    default:
      return "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300";
  }
}

function OrderActionDialog({
  orderId,
  title,
  description,
  submitLabel,
  reasonLabel,
  reasonPlaceholder,
  adminNotesPlaceholder,
  destructive = false,
  action,
  initialState,
  icon,
}: {
  orderId: string;
  title: string;
  description: string;
  submitLabel: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  adminNotesPlaceholder: string;
  destructive?: boolean;
  action: typeof rejectAdminInvestmentOrder | typeof cancelAdminInvestmentOrder;
  initialState: FormActionState<OrderActionFieldName>;
  icon: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientReasonError, setClientReasonError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (state.status === "success") {
      const timer = window.setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [router, state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          variant={destructive ? "destructive" : "default"}
          onSelect={(event) => event.preventDefault()}
        >
          {icon}
          {submitLabel}
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="border-border/60 bg-white/95 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:max-w-lg dark:border-white/10 dark:bg-slate-950/95 dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-4"
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            const parsed = orderActionDialogSchema.safeParse({
              reason: formData.get("reason"),
              adminNotes: formData.get("adminNotes"),
            });

            if (!parsed.success) {
              event.preventDefault();
              setClientReasonError(
                parsed.error.flatten().fieldErrors.reason?.[0] ??
                  "A reason is required before submitting this action.",
              );
              return;
            }

            setClientReasonError(null);
          }}
        >
          <input type="hidden" name="orderId" value={orderId} />

          <Field
            data-invalid={
              Boolean(state.fieldErrors?.reason?.length) || undefined
            }
          >
            <FieldLabel className="text-slate-700 dark:text-slate-200">
              {reasonLabel}
            </FieldLabel>
            <FieldContent>
              <Textarea
                name="reason"
                placeholder={reasonPlaceholder}
                className="min-h-24 rounded-2xl border-border/60 bg-white/90 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                onChange={() => {
                  if (clientReasonError) {
                    setClientReasonError(null);
                  }
                }}
              />
              {clientReasonError ? (
                <FieldError errors={[{ message: clientReasonError }]} />
              ) : null}
              {state.fieldErrors?.reason ? (
                <FieldError
                  errors={state.fieldErrors.reason.map((message) => ({
                    message,
                  }))}
                />
              ) : null}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-slate-700 dark:text-slate-200">
              Admin notes
            </FieldLabel>
            <FieldContent>
              <Textarea
                name="adminNotes"
                placeholder={adminNotesPlaceholder}
                className="min-h-24 rounded-2xl border-border/60 bg-white/90 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
              />
            </FieldContent>
          </Field>

          {state.status === "error" && state.message ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">
              {state.message}
            </p>
          ) : null}

          <DialogFooter className="border-border/60 bg-transparent px-0 pb-0 pt-2 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-2xl border-border/60 bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className={cn(
                "rounded-2xl",
                destructive
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-amber-600 hover:bg-amber-500",
              )}
            >
              {pending ? "Submitting..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrderActions({ order }: { order: AdminInvestmentOrderListItem }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl border-border/60 bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-2xl border border-border/60 bg-white/96 p-1 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/95 dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      >
        <DropdownMenuItem asChild>
          <Link href={`/account/dashboard/admin/investment-orders/${order.id}`}>
            <ArrowRight className="h-4 w-4" />
            View order
          </Link>
        </DropdownMenuItem>

        {order.canCancel ? (
          <OrderActionDialog
            orderId={order.id}
            title="Cancel investment order"
            description="Add the cancellation reason and any supporting notes before marking this pending-payment order as cancelled."
            submitLabel="Cancel order"
            reasonLabel="Cancellation reason"
            reasonPlaceholder="Explain why this order is being cancelled."
            adminNotesPlaceholder="Add optional admin context for this cancellation."
            action={cancelAdminInvestmentOrder}
            initialState={initialOrderActionState}
            icon={<Ban className="h-4 w-4" />}
          />
        ) : null}

        {order.canPause ? (
          <InvestmentOrderRuntimeStatusDialog
            orderId={order.id}
            title="Pause investment order"
            description="Pause this confirmed investment order to stop accrual until it is resumed."
            submitLabel="Pause order"
            pendingLabel="Pausing order..."
            action={pauseAdminInvestmentOrder}
            trigger={
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <PauseCircle className="h-4 w-4" />
                Pause order
              </DropdownMenuItem>
            }
            icon={<PauseCircle className="h-4 w-4" />}
            buttonClassName="bg-amber-600 hover:bg-amber-500"
            showUpgradeFields
          />
        ) : null}

        {order.canResume ? (
          <InvestmentOrderRuntimeStatusDialog
            orderId={order.id}
            title="Resume investment order"
            description="Resume this paused investment order so accrual can continue."
            submitLabel="Resume order"
            pendingLabel="Resuming order..."
            action={resumeAdminInvestmentOrder}
            trigger={
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <PlayCircle className="h-4 w-4" />
                Resume order
              </DropdownMenuItem>
            }
            icon={<PlayCircle className="h-4 w-4" />}
            buttonClassName="bg-emerald-600 hover:bg-emerald-500"
          />
        ) : null}

        {order.canDelete ? (
          <OrderActionDialog
            orderId={order.id}
            title="Reject investment order"
            description="Add the rejection reason and any supporting notes before marking this pending-payment order as rejected."
            submitLabel="Reject order"
            reasonLabel="Rejection reason"
            reasonPlaceholder="Explain why this order is being rejected."
            adminNotesPlaceholder="Add optional admin context for this rejection."
            destructive
            action={rejectAdminInvestmentOrder}
            initialState={initialOrderActionState}
            icon={<Trash2 className="h-4 w-4" />}
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminInvestmentOrdersClient({
  data,
}: {
  data: AdminInvestmentOrdersData;
}) {
  const stats: AdminOperationsStat[] = [
    {
      title: "Total orders",
      value: String(data.summary.totalOrders),
      hint: "All platform investment orders",
    },
    {
      title: "Ready for review",
      value: String(data.summary.pendingOrders),
      hint: "Orders still awaiting confirmation",
    },
    {
      title: "Confirmed",
      value: String(data.summary.confirmedOrders),
      hint: "Orders already moved into live status",
    },
    {
      title: "Order volume",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(data.summary.totalVolume),
      hint: "Total principal across all orders",
    },
  ];

  return (
    <AdminOperationsShell
      title="Investment Orders"
      description="Review and manage pending and confirmed orders from investors."
      stats={stats}
      showTitleIcon={false}
    >
      <Alert className="rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
        <Wallet className="h-4 w-4" />
        <AlertTitle>
          Use the action menu to manage each order lifecycle.
        </AlertTitle>
      </Alert>

      <AdminResponsiveCollectionShell
        items={data.orders}
        getItemKey={(order) => order.id}
        emptyState={
          <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardContent className="space-y-3 p-8">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                No investment orders found
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                Orders created by investors will appear here for review and
                confirmation.
              </p>
            </CardContent>
          </Card>
        }
        columns={[
          {
            key: "investor",
            header: "Investor",
            render: (order) => (
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {order.investorName}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {order.investorEmail}
                </p>
              </div>
            ),
          },
          {
            key: "order",
            header: "Order",
            render: (order) => (
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {order.planName}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {order.investmentName} | {order.tierLabel} |{" "}
                  {order.modelLabel}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (order) => (
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    getStatusClasses(order.status),
                  )}
                >
                  {order.statusLabel}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    getRuntimeStatusClasses(order.runtimeStatus),
                  )}
                >
                  {order.runtimeStatusLabel}
                </span>
              </div>
            ),
          },
          {
            key: "amount",
            header: "Amount",
            render: (order) => (
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {order.amount}
              </span>
            ),
          },
          {
            key: "account",
            header: "Account",
            render: (order) => (
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {order.accountName}
              </span>
            ),
          },
          {
            key: "created",
            header: "Created",
            render: (order) => (
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {order.createdAtLabel}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (order) => (
              <div className="flex justify-end">
                <OrderActions order={order} />
              </div>
            ),
          },
        ]}
      />
    </AdminOperationsShell>
  );
}

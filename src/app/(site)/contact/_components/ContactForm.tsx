"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  createContactConversationAction,
  type ContactConversationActionState,
} from "@/actions/contact/createContactConversationAction";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
  );
}

type ContactFormProps = {
  defaultEmail?: string;
  defaultName?: string;
};

export function ContactForm({
  defaultEmail = "",
  defaultName = "",
}: ContactFormProps) {
  const [state, formAction] = useActionState<
    ContactConversationActionState,
    FormData
  >(createContactConversationAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label className="text-xs text-slate-400">Full Name</label>
        <input
          type="text"
          name="fullName"
          // defaultValue={defaultName}
          placeholder="Your name"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-400"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400">Email Address</label>
        <input
          type="email"
          name="email"
          defaultValue={defaultEmail}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-400"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400">Message</label>
        <textarea
          name="message"
          rows={5}
          placeholder="How can we help you?"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-400"
        />
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-red-300">{state.message}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

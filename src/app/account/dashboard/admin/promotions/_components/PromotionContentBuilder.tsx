"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PromotionHighlight = {
  title: string;
  description: string;
};

type PromotionStep = {
  title: string;
  description: string;
};

type PromotionTerm = {
  title: string;
  description: string;
};

export function PromotionContentBuilder() {
  const [description, setDescription] = useState("");

  const [highlights, setHighlights] = useState<PromotionHighlight[]>([]);

  const [steps, setSteps] = useState<PromotionStep[]>([]);

  const [terms, setTerms] = useState<PromotionTerm[]>([]);

  function addHighlight() {
    setHighlights((current) => [
      ...current,
      {
        title: "",
        description: "",
      },
    ]);
  }

  function removeHighlight(index: number) {
    setHighlights((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateHighlight(
    index: number,
    field: keyof PromotionHighlight,
    value: string,
  ) {
    setHighlights((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        title: "",
        description: "",
      },
    ]);
  }

  function removeStep(index: number) {
    setSteps((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateStep(
    index: number,
    field: keyof PromotionStep,
    value: string,
  ) {
    setSteps((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addTerm() {
    setTerms((current) => [
      ...current,
      {
        title: "",
        description: "",
      },
    ]);
  }

  function removeTerm(index: number) {
    setTerms((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateTerm(
    index: number,
    field: keyof PromotionTerm,
    value: string,
  ) {
    setTerms((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-blue-400/20 bg-blue-400/[0.04] p-4 sm:p-5">
      <input type="hidden" name="description" value={description} />

      <input
        type="hidden"
        name="highlights"
        value={JSON.stringify(highlights)}
      />

      <input
        type="hidden"
        name="steps"
        value={JSON.stringify(
          steps.map((step, index) => ({
            number: String(index + 1).padStart(2, "0"),
            title: step.title,
            description: step.description,
          })),
        )}
      />

      <input type="hidden" name="terms" value={JSON.stringify(terms)} />

      <div>
        <p className="text-sm font-semibold text-white">Promotion content</p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Build the canonical content for this campaign. The same content powers
          user notifications, email delivery, admin previews, and the public
          offer page when the campaign is published.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="promotionDescription"
          className="text-sm font-medium text-white"
        >
          Description
        </label>

        <Textarea
          id="promotionDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          placeholder="Describe the promotion, opportunity, announcement, or update in a clear and compelling way."
          className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
        />

        <p className="text-xs text-slate-500">
          This is the primary content for the campaign.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Highlights</p>

            <p className="text-xs text-slate-500">
              Optional benefits, features, or key points.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHighlight}
            className="rounded-xl border-white/10 bg-white/[0.03]"
          >
            <Plus className="mr-1.5 size-4" />
            Add highlight
          </Button>
        </div>

        {highlights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
            <p className="text-xs text-slate-500">No highlights added.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-200/80">
                    Highlight {index + 1}
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHighlight(index)}
                    className="size-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Remove highlight ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="mt-3 grid gap-3">
                  <Input
                    value={highlight.title}
                    onChange={(event) =>
                      updateHighlight(index, "title", event.target.value)
                    }
                    placeholder="Highlight title"
                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />

                  <Textarea
                    value={highlight.description}
                    onChange={(event) =>
                      updateHighlight(index, "description", event.target.value)
                    }
                    rows={3}
                    placeholder="Explain this highlight"
                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">How it works</p>

            <p className="text-xs text-slate-500">
              Add the steps users or visitors should follow.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStep}
            className="rounded-xl border-white/10 bg-white/[0.03]"
          >
            <Plus className="mr-1.5 size-4" />
            Add step
          </Button>
        </div>

        {steps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
            <p className="text-xs text-slate-500">No steps added.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10 text-xs font-semibold text-blue-200">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-200/80">
                        Step {index + 1}
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                        className="size-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                        aria-label={`Remove step ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-3 grid gap-3">
                      <Input
                        value={step.title}
                        onChange={(event) =>
                          updateStep(index, "title", event.target.value)
                        }
                        placeholder="Step title"
                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                      />

                      <Textarea
                        value={step.description}
                        onChange={(event) =>
                          updateStep(index, "description", event.target.value)
                        }
                        rows={3}
                        placeholder="Explain what the user needs to do."
                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Terms & conditions</p>

            <p className="text-xs text-slate-500">
              Optional terms, eligibility rules, restrictions, or important
              information.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTerm}
            className="rounded-xl border-white/10 bg-white/[0.03]"
          >
            <Plus className="mr-1.5 size-4" />
            Add term
          </Button>
        </div>

        {terms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
            <p className="text-xs text-slate-500">No terms added.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {terms.map((term, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-200/80">
                    Term {index + 1}
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTerm(index)}
                    className="size-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Remove term ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="mt-3 grid gap-3">
                  <Input
                    value={term.title}
                    onChange={(event) =>
                      updateTerm(index, "title", event.target.value)
                    }
                    placeholder="Term title"
                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />

                  <Textarea
                    value={term.description}
                    onChange={(event) =>
                      updateTerm(index, "description", event.target.value)
                    }
                    rows={4}
                    placeholder="Describe the applicable term or condition."
                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

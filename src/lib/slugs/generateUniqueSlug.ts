import { prisma } from "@/lib/prisma";
import { slugify } from "./slugify";

type SupportedSlugModel = "investment" | "investmentPlan";

type GenerateUniqueSlugInput = {
  value: string;
  model: SupportedSlugModel;
  excludeId?: string;
};

export async function generateUniqueSlug({
  value,
  model,
  excludeId,
}: GenerateUniqueSlugInput): Promise<string> {
  const base = slugify(value);

  if (!base) {
    throw new Error("A valid slug source value is required.");
  }

  let candidate = base;
  let counter = 2;

  while (true) {
    const existing =
      model === "investment"
        ? await prisma.investment.findFirst({
            where: {
              slug: candidate,
              ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
            select: { id: true },
          })
        : await prisma.investmentPlan.findFirst({
            where: {
              slug: candidate,
              ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
            select: { id: true },
          });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

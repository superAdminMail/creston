"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { normalizePhoneToE164 } from "@/lib/formatters/phone";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { updateSuperAdminInvestorSchema } from "@/lib/zodValidations/update-super-admin-investor";

export type UpdateSuperAdminInvestorFieldName =
  | "name"
  | "username"
  | "phoneNumber"
  | "dateOfBirth"
  | "country"
  | "state"
  | "city"
  | "addressLine1"
  | "kycStatus"
  | "isVerified";

export type UpdateSuperAdminInvestorState =
  FormActionState<UpdateSuperAdminInvestorFieldName> & {
    redirectHref?: string;
  };

export async function updateSuperAdminInvestor(
  investorId: string,
  _prevState: UpdateSuperAdminInvestorState,
  formData: FormData,
): Promise<UpdateSuperAdminInvestorState> {
  try {
    const { userId } = await requireSuperAdminAccess();

    const parsed = updateInvestorSchema.safeParse({
      name: formData.get("name"),
      username: formData.get("username"),
      phoneNumber: formData.get("phoneNumber"),
      dateOfBirth: formData.get("dateOfBirth"),
      country: formData.get("country"),
      state: formData.get("state"),
      city: formData.get("city"),
      addressLine1: formData.get("addressLine1"),
      kycStatus: formData.get("kycStatus"),
      isVerified: formData.get("isVerified") === "true",
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted investor fields.",
      ) as UpdateSuperAdminInvestorState;
    }

    const investor = await prisma.investorProfile.findUnique({
      where: { id: investorId },
      select: {
        id: true,
        phoneNumber: true,
        dateOfBirth: true,
        country: true,
        state: true,
        city: true,
        addressLine1: true,
        kycStatus: true,
        isVerified: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!investor) {
      return createErrorFormState("Investor profile not found.") as UpdateSuperAdminInvestorState;
    }

    const normalizedPhoneNumber =
      parsed.data.phoneNumber && parsed.data.phoneNumber.trim()
        ? normalizePhoneToE164({
            nationalNumber: parsed.data.phoneNumber,
            country: parsed.data.country,
          })
        : null;
    const nextDateOfBirth = parsed.data.dateOfBirth
      ? new Date(parsed.data.dateOfBirth)
      : null;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: investor.user.id },
        data: {
          name: parsed.data.name,
          username: parsed.data.username || null,
        },
      }),
      prisma.investorProfile.update({
        where: { id: investorId },
        data: {
          phoneNumber: normalizedPhoneNumber,
          dateOfBirth: nextDateOfBirth,
          country: parsed.data.country || null,
          state: parsed.data.state || null,
          city: parsed.data.city || null,
          addressLine1: parsed.data.addressLine1 || null,
          kycStatus: parsed.data.kycStatus,
          isVerified: parsed.data.isVerified,
        },
      }),
    ]);

    await logAuditEvent({
      actorUserId: userId,
      action: "investor-profile.updated",
      entityType: "InvestorProfile",
      entityId: investorId,
      description: `Updated investor profile ${parsed.data.name}.`,
      metadata: {
        previous: investor,
        next: {
          name: parsed.data.name,
          username: parsed.data.username,
          phoneNumber: parsed.data.phoneNumber,
          dateOfBirth: parsed.data.dateOfBirth,
          country: parsed.data.country,
          state: parsed.data.state,
          city: parsed.data.city,
          addressLine1: parsed.data.addressLine1,
          kycStatus: parsed.data.kycStatus,
          isVerified: parsed.data.isVerified,
        },
      },
    });

    revalidatePath("/account/dashboard/super-admin/investors");
    revalidatePath(`/account/dashboard/super-admin/investors/${investorId}`);

    return {
      status: "success",
      message: "Investor profile updated successfully.",
      redirectHref: `/account/dashboard/super-admin/investors/${investorId}`,
    };
  } catch (error) {
    console.error(error);

    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Something went wrong while updating this investor profile.",
      ),
    ) as UpdateSuperAdminInvestorState;
  }
}

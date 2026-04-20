import PlatformWalletsClient from "@/app/account/dashboard/_components/PlatformWalletsClient";
import SavingsBankInfoRequestForm from "@/app/account/dashboard/admin/payment-methods/_components/SavingsBankInfoRequestForm";
import { getPlatformPaymentMethods } from "@/lib/services/platform-wallets/getPlatformWallets";
import type { ReactNode } from "react";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function PlatformWalletsAdminPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const wallets = await getPlatformPaymentMethods();

  const requestKind = single(params.requestKind);
  const savingsAccountId = single(params.savingsAccountId);
  const requesterName = single(params.requesterName);
  const requesterEmail = single(params.requesterEmail);
  const savingsProductName = single(params.savingsProductName);
  const currency = single(params.currency);

  const requestPanel: ReactNode =
    requestKind === "SAVINGS_FUNDING_BANK_INFO" &&
    savingsAccountId &&
    savingsProductName &&
    currency ? (
      <div className="mb-6">
        <SavingsBankInfoRequestForm
          request={{
            savingsAccountId,
            requesterName,
            requesterEmail,
            savingsProductName,
            currency,
          }}
        />
      </div>
    ) : null;

  return (
    <>
      {requestPanel}
      <PlatformWalletsClient
        roleLabel="Admin"
        wallets={wallets.map((wallet) => ({
          id: wallet.id,
          label: wallet.label,
          type: wallet.type,
          providerName: wallet.providerName,
          accountName: wallet.accountName,
          currency: wallet.currency,
          country: wallet.country,
          instructions: wallet.instructions,
          notes: wallet.notes,
          isActive: wallet.isActive,
          isPrivate: wallet.isPrivate,
          isDefault: wallet.isDefault,
          sortOrder: wallet.sortOrder,
          verificationStatus: wallet.verificationStatus,
          bankName: wallet.bankName,
          bankCode: wallet.bankCode,
          accountNumber: wallet.accountNumber,
          iban: wallet.iban,
          swiftCode: wallet.swiftCode,
          routingNumber: wallet.routingNumber,
          branchName: wallet.branchName,
          cryptoAsset: wallet.cryptoAsset,
          cryptoNetwork: wallet.cryptoNetwork,
          walletAddress: wallet.walletAddress,
          walletTag: wallet.walletTag,
          createdAt: wallet.createdAt.toISOString(),
        }))}
      />
    </>
  );
}

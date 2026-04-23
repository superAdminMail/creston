import PlatformWalletsClient from "@/app/account/dashboard/_components/PlatformWalletsClient";
import { getPlatformPaymentMethods } from "@/lib/services/platform-wallets/getPlatformWallets";

export const dynamic = "force-dynamic";

export default async function SuperAdminPaymentMethodsPage() {
  const paymentMethods = await getPlatformPaymentMethods();

  return (
    <PlatformWalletsClient
      roleLabel="Super Admin"
      wallets={paymentMethods.map((wallet) => ({
        id: wallet.id,
        label: wallet.label,
        type: wallet.type,
        providerName: wallet.providerName,
        accountName: wallet.accountName,
        reference: wallet.reference,
        bankAddress: wallet.bankAddress,
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
  );
}

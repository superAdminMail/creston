import PlatformWalletsClient from "@/app/account/dashboard/_components/PlatformWalletsClient";
import { getPlatformPaymentMethods } from "@/lib/services/platform-wallets/getPlatformWallets";

export default async function PlatformWalletsAdminPage() {
  const wallets = await getPlatformPaymentMethods();

  return (
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
  );
}

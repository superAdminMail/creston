"use client";

import QRCode from "react-qr-code";

type CryptoQRCodeProps = {
  address: string;
  amount?: number;
};

export default function CryptoQRCode({ address, amount }: CryptoQRCodeProps) {
  const value = amount
    ? `bitcoin:${address}?amount=${amount}`
    : `bitcoin:${address}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-xl">
        <QRCode value={value} size={180} />
      </div>

      <p className="text-xs text-muted-foreground break-all text-center">
        {address}
      </p>
    </div>
  );
}

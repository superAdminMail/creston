type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentoReturnPage({ searchParams }: Props) {
  const params = await searchParams;
  const status =
    single(params.OrderStatus) ?? single(params.orderStatus) ?? "processing";

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Payment submitted</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We received your payment redirect with status: <strong>{status}</strong>
        .
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Your order will update automatically after secure verification.
      </p>
    </main>
  );
}

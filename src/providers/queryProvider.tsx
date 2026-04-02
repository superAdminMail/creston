"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children} <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default QueryProvider;

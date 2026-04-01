'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Wagmi config will be added when Privy App ID is set
// import { PrivyProvider } from '@privy-io/react-auth'
// import { WagmiProvider } from '@privy-io/wagmi'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'placeholder-app-id'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  // TODO: Wire up PrivyProvider + WagmiProvider once NEXT_PUBLIC_PRIVY_APP_ID is set
  // See: https://docs.privy.io/guide/react/quickstart
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

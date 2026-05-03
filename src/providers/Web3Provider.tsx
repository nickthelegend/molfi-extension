import { BaseError } from 'viem'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, base, polygon } from '@wagmi/core/chains'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const projectId = '22260d6680223859f9b07dadfafce02d'

const metadata = {
  name: 'Molfi Extension',
  description: 'AI-Native Crypto Trading Ecosystem',
  url: 'https://molfi.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const ogChain = {
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Scan', url: 'https://scan.0g.ai' },
  },
} as const;

const networks = [ogChain, mainnet, arbitrum, base, polygon]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as [any, ...any[]],
  projectId,
  metadata,
  defaultNetwork: base,
  features: {
    analytics: false,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    emailShowWallets: true,
  },
  allWallets: 'HIDE', // Helps avoid loading too many external assets in extension
})

// Ensure BaseError is initialized for inheritance
if (BaseError) { /* No-op */ }

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

'use client'

import * as React from 'react'

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  polygon,
  polygonMumbai
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy'

const projectId = (process.env.NEXT_PUBLIC_WALLECTCONNECT_PROJECTID) as string;
const ALCHEMY_API_KEY_MATIC = (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_MATIC) as string;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    // polygon,
    polygonMumbai,
    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [polygonMumbai] : []),
  ],
  [alchemyProvider({apiKey: ALCHEMY_API_KEY_MATIC})]
);

const { wallets } = getDefaultWallets({
  appName: 'GearFight',
  projectId,
  chains,
});

const demoAppInfo = {
  appName: 'Rainbowkit Demo',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function WagmiProviders({ 
    children 
  }: { 
  children: React.ReactNode 
  }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo} initialChain={polygonMumbai}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
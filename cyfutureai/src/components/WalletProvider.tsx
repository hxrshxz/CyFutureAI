import React, { useMemo } from "react";
import type { ReactNode } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import the wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

const SolanaWalletProvider = ({ children }: SolanaWalletProviderProps) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // Memoize the endpoint to avoid recalculating it on every render
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Memoize the wallets array to avoid re-instantiating wallet adapters on every render
  // Prioritize Phantom wallet to avoid MetaMask Solana snap crashes
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(), // Phantom first - most reliable for Solana
      new SolflareWalletAdapter(), // Solflare as backup
    ],
    // The dependency array is empty, so this is only created once
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Exporting with React.memo prevents the component from re-rendering if its props (children) do not change.
export default React.memo(SolanaWalletProvider);

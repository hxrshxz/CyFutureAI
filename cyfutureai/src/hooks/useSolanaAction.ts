import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";

interface SolanaActionResult {
  signature: string | null;
  error: Error | null;
}

interface SolanaAction {
  sendTransaction: (memo: string) => Promise<SolanaActionResult>;
  requestAirdrop: () => Promise<SolanaActionResult>;
  isSending: boolean;
}

export const useSolanaAction = (): SolanaAction => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction: walletSendTransaction } = useWallet();
  const [isSending, setIsSending] = useState(false);

  const sendActionTransaction = useCallback(
    async (memo: string): Promise<SolanaActionResult> => {
      if (!publicKey) {
        const error = new Error("Wallet Not Connected. Please connect your wallet to proceed.");
        return { signature: null, error };
      }

      setIsSending(true);

      try {
        const balance = await connection.getBalance(publicKey);
        if (balance < 5000) { // Need at least 0.000005 SOL for transaction fee
          const error = new Error("Insufficient SOL balance. Please request a free airdrop first.");
          return { signature: null, error };
        }

        const transaction = new Transaction().add(createMemoInstruction(memo));
        const signature = await walletSendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");

        return { signature, error: null };
      } catch (err) {
        return { signature: null, error: err as Error };
      } finally {
        setIsSending(false);
      }
    },
    [publicKey, connection, walletSendTransaction]
  );

  const requestAirdrop = useCallback(async (): Promise<SolanaActionResult> => {
    if (!publicKey) {
      const error = new Error("Wallet Not Connected. Please connect your wallet to proceed.");
      return { signature: null, error };
    }

    setIsSending(true);

    try {
      const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, "confirmed");
      return { signature, error: null };
    } catch (err) {
      return { signature: null, error: err as Error };
    } finally {
      setIsSending(false);
    }
  }, [publicKey, connection]);

  return {
    sendTransaction: sendActionTransaction,
    requestAirdrop,
    isSending,
  };
};
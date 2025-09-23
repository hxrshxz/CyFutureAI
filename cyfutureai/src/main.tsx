import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import SolanaWalletProvider from "./components/WalletProvider.tsx";

// Import CSS files
import "./index.css";
import "./App.css";

// Polyfill for Buffer used by Solana web3.js
import { Buffer } from "buffer";
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
       {" "}
    <SolanaWalletProvider>
            <App />   {" "}
    </SolanaWalletProvider>
     {" "}
  </StrictMode>
);

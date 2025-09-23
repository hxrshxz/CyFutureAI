// src/App.tsx
import SolanaWalletProvider from "./components/WalletProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import AIAccountant  from "./AIAccountant";
import "./App.css";
import './index.css'

function App() {
  return (
    <ErrorBoundary>
      <SolanaWalletProvider>
        <Toaster position="bottom-right" richColors />
        <AIAccountant />
      </SolanaWalletProvider>
    </ErrorBoundary>
  );
}

export default App;

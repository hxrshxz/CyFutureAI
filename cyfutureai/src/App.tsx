// src/App.tsx
import { useState } from "react";
import SolanaWalletProvider from "./components/WalletProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import { AIAccountant } from "./AIAccountant";
import LandingPage from "./components/landing/LandingPage";
import "./App.css";
import './index.css'

type AppView = 'landing' | 'app';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  return (
    <ErrorBoundary>
      <SolanaWalletProvider>
        <Toaster position="bottom-right" richColors />
        {currentView === 'landing' ? (
          <LandingPage onGetStarted={() => setCurrentView('app')} />
        ) : (
          <AIAccountant />
        )}
      </SolanaWalletProvider>
    </ErrorBoundary>
  );
}

export default App;

// src/App.tsx
import { useState } from "react";
import SolanaWalletProvider from "./components/WalletProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import Dashboard from "./components/Dashboard";
import AIAccountant from "./AIAccountant";
import LandingPage from "./components/landing/LandingPage";
import "./App.css";
import "./index.css";
import { Login } from "./components/Login";

type AppView = "landing" | "login" | "dashboard" | "ai";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("landing");

  const handleGetStarted = () => {
    setCurrentView("login");
  };

  const handleLogin = () => {
    setCurrentView("dashboard");
  };

  const handleNavigateToAI = () => {
    setCurrentView("ai");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} />;
      case "login":
        return <Login onLogin={handleLogin} />;
      case "dashboard":
        return <Dashboard onNavigateToAI={handleNavigateToAI} />;
      case "ai":
        return (
          <div className="relative">
            <div className="absolute top-4 left-4 z-50">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white/90 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <AIAccountant embedded={false} />
          </div>
        );
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <ErrorBoundary>
      <SolanaWalletProvider>
        <Toaster position="bottom-right" richColors />
        {renderView()}
      </SolanaWalletProvider>
    </ErrorBoundary>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Bot,
  Database,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  BarChart3,
  Receipt,
  Wallet,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  FileImage,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaAction } from "../hooks/useSolanaAction";
import { useIpfs } from "../hooks/useIpfs";
import AIAccountant from "../AIAccountant";

interface InvoiceData {
  id: string;
  fileName: string;
  uploadTime: string;
  status: "processing" | "completed" | "error";
  extractedData?: {
    invoice_number: string;
    vendor_name: string;
    total_amount: number;
    date: string;
  };
  ipfsHash?: string;
  solanaSignature?: string;
}

interface DashboardProps {
  onNavigateToAI: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToAI }) => {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "upload" | "processing" | "ai"
  >("dashboard");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  const { connected } = useWallet();
  const { sendTransaction, requestAirdrop, getBalance, isSending } =
    useSolanaAction();
  const { uploadFile, uploadJson, isUploading } = useIpfs();

  // Update balance
  const updateBalance = async () => {
    if (connected) {
      const newBalance = await getBalance();
      setBalance(newBalance);
    }
  };

  useEffect(() => {
    updateBalance();
  }, [connected, getBalance]);

  // Mock data for demonstration
  const dashboardStats = [
    {
      title: "Total Invoices",
      value: invoices.length.toString(),
      icon: Receipt,
      color: "text-blue-500",
      change: "+12%",
    },
    {
      title: "This Month",
      value: "₹2,45,680",
      icon: TrendingUp,
      color: "text-green-500",
      change: "+8.5%",
    },
    {
      title: "Processing Queue",
      value: invoices
        .filter((inv) => inv.status === "processing")
        .length.toString(),
      icon: Clock,
      color: "text-orange-500",
      change: "0",
    },
    {
      title: "IPFS Stored",
      value: invoices.filter((inv) => inv.ipfsHash).length.toString(),
      icon: Database,
      color: "text-purple-500",
      change: "+100%",
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentView("upload");
    }
  };

  const processInvoice = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    const newInvoice: InvoiceData = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      uploadTime: new Date().toISOString(),
      status: "processing",
    };

    setInvoices((prev) => [...prev, newInvoice]);
    setCurrentView("processing");

    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock extracted data
      const mockExtractedData = {
        invoice_number: `INV-${Math.floor(Math.random() * 10000)}`,
        vendor_name: "Sample Vendor Ltd.",
        total_amount: Math.floor(Math.random() * 50000) + 1000,
        date: new Date().toISOString().split("T")[0],
      };

      // Upload to IPFS
      let ipfsHash: string | null = null;
      if (selectedFile) {
        ipfsHash = await uploadFile(selectedFile);
        if (ipfsHash) {
          // Also upload extracted data as JSON
          await uploadJson(mockExtractedData);
        }
      }

      // Store on Solana blockchain
      let solanaSignature: string | null = null;
      if (connected) {
        const transactionData = JSON.stringify({
          type: "INVOICE_PROCESSED",
          fileName: selectedFile.name,
          ipfsHash: ipfsHash,
          extractedData: mockExtractedData,
          timestamp: new Date().toISOString(),
        });

        const { signature } = await sendTransaction(transactionData);
        solanaSignature = signature;
      }

      // Update invoice with results
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === newInvoice.id
            ? {
                ...inv,
                status: "completed" as const,
                extractedData: mockExtractedData,
                ipfsHash: ipfsHash || undefined,
                solanaSignature: solanaSignature || undefined,
              }
            : inv
        )
      );
    } catch (error) {
      console.error("Processing error:", error);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === newInvoice.id ? { ...inv, status: "error" as const } : inv
        )
      );
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
    }
  };

  const handleAirdrop = async () => {
    const { signature, error } = await requestAirdrop();
    if (signature) {
      console.log("Airdrop successful:", signature);
      await updateBalance();
    } else {
      console.error("Airdrop failed:", error);
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your invoices with AI, IPFS, and blockchain technology
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>{balance.toFixed(4)} SOL</span>
          </div>
          {connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAirdrop}
              disabled={isSending}
            >
              {isSending ? "Requesting..." : "Get Free SOL"}
            </Button>
          )}
          <WalletMultiButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600">{stat.change}</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setCurrentView("upload")}
        >
          <CardContent className="p-6 text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Invoice</h3>
            <p className="text-gray-600">Process new invoices with AI</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={onNavigateToAI}
        >
          <CardContent className="p-6 text-center">
            <Bot className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-gray-600">Chat with your AI accountant</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setCurrentView("processing")}
        >
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">View Reports</h3>
            <p className="text-gray-600">Analytics and insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No invoices uploaded yet</p>
              <Button className="mt-4" onClick={() => setCurrentView("upload")}>
                Upload Your First Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices
                .slice(-5)
                .reverse()
                .map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <FileImage className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{invoice.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.uploadTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          invoice.status === "completed"
                            ? "default"
                            : invoice.status === "processing"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {invoice.status === "completed" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {invoice.status === "processing" && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {invoice.status === "error" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {invoice.status}
                      </Badge>
                      {invoice.extractedData && (
                        <span className="text-sm font-medium">
                          ₹{invoice.extractedData.total_amount.toLocaleString()}
                        </span>
                      )}
                      {invoice.ipfsHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://gateway.pinata.cloud/ipfs/${invoice.ipfsHash}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUploadView = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Upload Invoice</h2>
        <p className="text-gray-600">
          Select an invoice file to process with AI
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Choose invoice file</p>
              <p className="text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </label>
          </div>

          {selectedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  onClick={processInvoice}
                  disabled={isProcessing || isUploading}
                >
                  {isProcessing ? "Processing..." : "Process Invoice"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <Bot className="h-8 w-8 text-blue-500 mx-auto" />
          <h3 className="font-semibold">AI Processing</h3>
          <p className="text-sm text-gray-600">Extract data automatically</p>
        </div>
        <div className="space-y-2">
          <Database className="h-8 w-8 text-purple-500 mx-auto" />
          <h3 className="font-semibold">IPFS Storage</h3>
          <p className="text-sm text-gray-600">Decentralized file storage</p>
        </div>
        <div className="space-y-2">
          <ShieldCheck className="h-8 w-8 text-green-500 mx-auto" />
          <h3 className="font-semibold">Blockchain Proof</h3>
          <p className="text-sm text-gray-600">Immutable transaction record</p>
        </div>
      </div>
    </div>
  );

  const renderProcessingView = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Processing Queue</h2>
          <p className="text-gray-600">Track your invoice processing status</p>
        </div>
        <Button onClick={() => setCurrentView("dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-semibold">{invoice.fileName}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(invoice.uploadTime).toLocaleString()}
                    </p>
                    {invoice.extractedData && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Invoice #:</span>
                          <p className="font-medium">
                            {invoice.extractedData.invoice_number}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <p className="font-medium">
                            {invoice.extractedData.vendor_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium">
                            ₹
                            {invoice.extractedData.total_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">
                            {invoice.extractedData.date}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      invoice.status === "completed"
                        ? "default"
                        : invoice.status === "processing"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {invoice.status}
                  </Badge>
                  <div className="flex gap-2">
                    {invoice.ipfsHash && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://gateway.pinata.cloud/ipfs/${invoice.ipfsHash}`,
                            "_blank"
                          )
                        }
                      >
                        <Database className="h-4 w-4 mr-1" />
                        IPFS
                      </Button>
                    )}
                    {invoice.solanaSignature && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/tx/${invoice.solanaSignature}?cluster=devnet`,
                            "_blank"
                          )
                        }
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Blockchain
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === "dashboard" && renderDashboardView()}
            {currentView === "upload" && renderUploadView()}
            {currentView === "processing" && renderProcessingView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;

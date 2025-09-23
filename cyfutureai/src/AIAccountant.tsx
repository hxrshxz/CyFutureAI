import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaAction } from "./hooks/useSolanaAction";
import graphMonthly from './assets/graph-monthly.png';

import {
  Search, Camera, Bot, FileText, Wallet, 
  ShieldCheck, CheckCircle, AlertTriangle, ShoppingCart, BarChart2,
  DollarSign, FileDown, Zap
} from "lucide-react";

// --- Types ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

interface ExtractedData {
  invoice_number: string;
  invoice_date: string;
  total_amount: string;
  total_tax?: string;
  vendor_gstin?: string;
  [key: string]: any;
}

interface ExtractedDataTableProps {
  data: ExtractedData | null;
  fileHash: string;
  dataHash: string;
  txSignature: string;
}

interface FileDropProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  appState: string;
}

// --- Helper Functions ---
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

async function generateHash(data: BufferSource): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Toast Notification Component ---
const Toast = ({ message, type, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-800';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertTriangle : Bot;
  
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      exit={{ y: 100, opacity: 0 }} 
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-4 rounded-lg shadow-2xl text-white ${bgColor}`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-lg font-medium">{message}</span>
    </motion.div>
  );
};

// --- Invoice Skeleton with Staggered Animation ---
const InvoiceSkeleton = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring" as const, 
        stiffness: 100 
      } 
    }
  };

  return (
    <motion.div
      className="bg-white/80 p-4 rounded-xl border border-slate-200/80 w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-start mb-6">
        <motion.div className="bg-sky-100 rounded-md h-8 w-1/4" variants={itemVariants} />
        <motion.div className="bg-sky-100 rounded-md h-5 w-2/5" variants={itemVariants} />
      </div>
      <div className="space-y-3">
        <motion.div className="bg-sky-100 rounded-md h-4 w-3/4" variants={itemVariants} />
        <motion.div className="bg-sky-100 rounded-md h-4 w-2/3" variants={itemVariants} />
      </div>
      <div className="mt-8 space-y-3">
        <motion.div className="bg-sky-100 rounded-md h-5 w-4/5" variants={itemVariants} />
        <motion.div className="bg-sky-100 rounded-md h-5 w-3/5 opacity-80" variants={itemVariants} />
        <motion.div className="bg-sky-100 rounded-md h-5 w-2/5 opacity-60" variants={itemVariants} />
      </div>
    </motion.div>
  );
};

// --- Extracted Data Display Component ---
const ExtractedDataTable = ({ data, fileHash, dataHash, txSignature }: ExtractedDataTableProps) => (
  <div className="bg-white/80 p-5 rounded-xl border border-slate-200/80 w-full text-slate-800 max-w-xl">
    <div className="flex justify-between mb-4">
      <h3 className="text-lg font-semibold">Extracted Data</h3>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-600 font-medium">Blockchain Secured</span>
      </div>
    </div>
    
    <div className="space-y-4">
      {data && Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between border-b border-slate-100 pb-2">
          <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
          <span className="text-sm">{value}</span>
        </div>
      ))}
      
      <div className="pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">File Hash</span>
          <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">{fileHash}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Data Hash</span>
          <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">{dataHash}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Solana Transaction</span>
          <a 
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer" 
            className="text-xs font-mono text-blue-500 hover:underline truncate max-w-[200px]"
          >
            {txSignature}
          </a>
        </div>
      </div>
    </div>
  </div>
);

// --- File Drop Component ---
const FileDrop = ({ onFileSelect, isProcessing, appState }: FileDropProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageButtonClick = () => fileInputRef.current?.click();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };
  
  return (
    <div className="bg-white/80 p-8 rounded-xl border border-slate-200/80 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="bg-slate-50 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-sky-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Upload Invoice</h3>
        <p className="text-slate-500 text-sm mt-1">
          Upload an invoice to extract and secure its data
        </p>
      </div>
      
      <div 
        className={`border-2 border-dashed border-slate-300 rounded-lg p-8 text-center transition-all ${isProcessing ? 'opacity-50' : 'hover:border-sky-400 cursor-pointer'}`}
        onClick={isProcessing ? undefined : handleImageButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
          <Camera className="h-12 w-12 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">
              {isProcessing ? 'Processing...' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-slate-500">
              Supports JPG, PNG, PDF (max 10MB)
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button 
          className="w-full"
          onClick={handleImageButtonClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <motion.div
                className="mr-2 h-4 w-4 border-2 border-slate-200 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processing...
            </>
          ) : appState === 'ERROR' ? 'Try Again' : 'Select Invoice'}
        </Button>
      </div>
    </div>
  );
};

// --- MAIN AI ACCOUNTANT APPLICATION ---
export const AIAccountant = () => {
  // State
  const [appState, setAppState] = useState<
    'IDLE' | 'EXTRACTING' | 'PREVIEW' | 'SECURING' | 'SUCCESS' | 'ERROR'
  >('IDLE');
  
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [dataHash, setDataHash] = useState<string>('');
  const [txSignature, setTxSignature] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error' | 'info', visible: boolean}>({ 
    message: '', type: 'info', visible: false 
  });
  
  // Hooks
  const { sendTransaction, isSending } = useSolanaAction();
  
  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastInfo({ message, type, visible: true });
  };

  // Test transaction function
  const handleTestTransaction = async () => {
    if (isSending) return;
    
    try {
      showToast('Sending test transaction...', 'info');
      const result = await sendTransaction('CyFutureAI - Test Transaction - ' + new Date().toISOString());
      
      if (result.signature) {
        showToast(`Test transaction successful! Signature: ${result.signature}`, 'success');
        console.log('Test transaction signature:', result.signature);
      } else if (result.error) {
        showToast(`Test transaction failed: ${result.error.message}`, 'error');
        console.error('Test transaction error:', result.error);
      } else {
        showToast('Test transaction failed or was cancelled', 'error');
      }
    } catch (error) {
      console.error('Test transaction error:', error);
      showToast(`Test transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };
  
  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    setAppState('EXTRACTING');
    
    try {
      // Read file and generate hash
      const fileBuffer = await file.arrayBuffer();
      const hash = await generateHash(new Uint8Array(fileBuffer));
      setFileHash(hash);
      
      // Extract details using AI
      await handleExtractDetails(file);
    } catch (error: unknown) {
      setAppState('ERROR');
      const errorMsg = error instanceof Error ? error.message : 'Failed to process the file';
      setErrorMessage(errorMsg);
      showToast(`Error: ${errorMsg}`, 'error');
    }
  };
  
  // Extract details from invoice image using AI
  const handleExtractDetails = async (file: File) => {
    try {
      // Generate AI model
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      // Prepare the image for model input
      const imageParts = [await fileToGenerativePart(file)];
      
      // Prompt with instructions to extract data
      const prompt = `
        Extract the following information from this invoice image:
        - invoice_number
        - invoice_date
        - total_amount (just the number)
        - vendor_name
        - vendor_gstin (if available)
        - total_tax (if available)
        
        Return ONLY a valid JSON object with these fields, no other text.
      `;
      
      // Generate content from the model
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      // Convert response to JSON
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON in response");
      
      const data = JSON.parse(jsonMatch[0]) as ExtractedData;
      
      // Hash the extracted data
      const dataStr = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataStr);
      // Cast to BufferSource to fix TypeScript error
      const hash = await generateHash(dataBuffer as BufferSource);
      
      // Update state with extracted data
      setExtractedData(data);
      setDataHash(hash);
      setAppState('PREVIEW');
    } catch (error: unknown) {
      setAppState('ERROR');
      const errorMsg = error instanceof Error ? error.message : 'AI extraction failed';
      setErrorMessage(`AI extraction failed: ${errorMsg}`);
      showToast("Failed to extract data from image", 'error');
    }
  };
  
  // Secure the data on blockchain  
  const handleSecureOnBlockchain = async () => {
    try {
      setAppState('SECURING');
      
      // Create data to store on blockchain
      const dataStr = JSON.stringify({
        fileHash,
        dataHash,
        invoiceNumber: extractedData?.invoice_number,  
        date: new Date().toISOString()
      });
      
      // Send transaction to Solana using earth-credits-hub-32 interface
      const result = await sendTransaction(dataStr);
      if (result.signature) {
        setTxSignature(result.signature);
        setAppState('SUCCESS');
        showToast("Invoice data secured on blockchain!", 'success');
      } else {
        throw new Error(result.error?.message || "Failed to get transaction signature");
      }
    } catch (error: unknown) {
      setAppState('ERROR');
      const errorMsg = error instanceof Error ? error.message : 'Transaction failed';
      setErrorMessage(`Transaction failed: ${errorMsg}`);
      showToast("Failed to secure data on blockchain", 'error');
    }
  };
  
  // --- Statistics Values (Mock Data) ---
  const stats = [
    { 
      label: 'Monthly Spending', 
      value: extractedData ? parseFloat(extractedData.total_amount || "0") : 0,
      icon: BarChart2,
      change: '+12.5%',
      changeType: 'increase',
      formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`
    },
    { 
      label: 'Tax Paid', 
      value: extractedData ? parseFloat(extractedData.total_tax || "0") : 0,
      icon: DollarSign,
      change: '+5.2%',
      changeType: 'increase',
      formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`
    },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-semibold text-slate-800">AI Accountant</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  className="w-64 pr-8 pl-10 py-2 text-sm"
                />
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              
              <div className="h-6 w-[1px] bg-slate-200"></div>
              
              <Button
                onClick={handleTestTransaction}
                disabled={isSending}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Test Transaction
                  </>
                )}
              </Button>
              
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload/Process */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Invoice Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Upload Section */}
                  <div>
                    {(appState === 'IDLE' || appState === 'ERROR') && (
                      <FileDrop 
                        onFileSelect={handleFileSelect}
                        isProcessing={isSending || appState === 'EXTRACTING' as any}
                        appState={appState}
                      />
                    )}
                    
                    {appState === 'EXTRACTING' && <InvoiceSkeleton />}
                    
                    {(appState === 'PREVIEW' || appState === 'SECURING' || appState === 'SUCCESS') && extractedData && (
                      <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 w-full max-w-md">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-slate-800">Invoice Preview</h3>
                          <Badge variant="outline" className="text-xs">
                            {appState === 'PREVIEW' ? 'Ready to Secure' : 
                             appState === 'SECURING' ? 'Securing...' : 'Secured'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-slate-500">Invoice Number</p>
                              <p className="font-semibold">{extractedData?.invoice_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Date</p>
                              <p>{extractedData?.invoice_date}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-500">Amount</p>
                            <p className="text-xl font-bold text-slate-800">
                              ₹{parseFloat(extractedData?.total_amount || "0").toLocaleString('en-IN')}
                            </p>
                          </div>
                          
                          {extractedData?.vendor_gstin && (
                            <div>
                              <p className="text-xs text-slate-500">GSTIN</p>
                              <p className="font-mono">{extractedData.vendor_gstin}</p>
                            </div>
                          )}
                        </div>
                        
                        {appState === 'PREVIEW' && (
                          <Button 
                            className="w-full mt-5"
                            onClick={handleSecureOnBlockchain}
                            disabled={isSending}
                          >
                            <Wallet className="h-4 w-4 mr-2" />
                            Secure on Blockchain
                          </Button>
                        )}
                        
                        {appState === 'SECURING' && (
                          <div className="w-full mt-5 p-2 bg-slate-100 rounded-md flex items-center justify-center">
                            <motion.div
                              className="mr-2 h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="text-sm text-slate-600">Securing on Blockchain...</span>
                          </div>
                        )}
                        
                        {appState === 'SUCCESS' && (
                          <div className="w-full mt-5 p-2 bg-green-50 rounded-md flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-sm text-green-600">Successfully Secured</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Extracted Data Section */}
                  <div>
                    {appState === 'SUCCESS' && extractedData && (
                      <ExtractedDataTable 
                        data={extractedData}
                        fileHash={fileHash}
                        dataHash={dataHash}
                        txSignature={txSignature}
                      />
                    )}
                    
                    {appState === 'ERROR' && (
                      <div className="bg-red-50 p-5 rounded-xl border border-red-100 text-red-700">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold mb-1">Error Processing Invoice</h3>
                            <p className="text-sm">{errorMessage}</p>
                          </div>
                        </div>
                        <p className="text-xs text-red-600 mt-3">
                          Try uploading a different invoice image or check your wallet connection.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {appState === 'SUCCESS' && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 pb-0">
                    <h3 className="text-xl font-semibold text-slate-800 mb-1">Transaction Successful</h3>
                    <p className="text-sm text-slate-500">
                      Your invoice data has been securely recorded on the Solana blockchain
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="rounded-md bg-green-50 p-4 border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Invoice #{extractedData?.invoice_number} Secured</p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            <a 
                              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline inline-flex items-center"
                            >
                              View on Solana Explorer
                              <FileDown className="h-3 w-3 ml-1" />
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 p-6">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setAppState('IDLE');
                        setExtractedData(null);
                        setFileHash('');
                        setDataHash('');
                        setTxSignature('');
                      }}
                    >
                      Process Another Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg border border-slate-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center">
                          <stat.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <Badge variant={stat.changeType === 'increase' ? 'default' : 'destructive'} className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">
                        {stat.formatter(stat.value)}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Graph */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Monthly Spending</h4>
                    <Badge variant="outline" className="text-xs">Last 6 months</Badge>
                  </div>
                  
                  <div className="relative h-[180px] overflow-hidden rounded-md border border-slate-200">
                    <img 
                      src={graphMonthly} 
                      alt="Monthly spending graph" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Activity</h4>
                  
                  <div className="space-y-3">
                    {['Invoice #INV-2023', 'Tax Payment', 'Vendor Payment'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          i === 0 ? 'bg-blue-100 text-blue-600' : 
                          i === 1 ? 'bg-green-100 text-green-600' : 
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {i === 0 ? <FileText className="h-4 w-4" /> : 
                           i === 1 ? <DollarSign className="h-4 w-4" /> : 
                           <ShoppingCart className="h-4 w-4" />}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item}</p>
                          <p className="text-xs text-slate-500">
                            {i === 0 ? '3 hours ago' : i === 1 ? 'Yesterday' : '3 days ago'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastInfo.visible && (
          <Toast
            message={toastInfo.message}
            type={toastInfo.type}
            onDismiss={() => setToastInfo({ ...toastInfo, visible: false })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAccountant;

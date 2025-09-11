"use client";

import { useState, type ChangeEvent } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSolanaAction } from './hooks/useSolanaAction';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './App.css';

// --- Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- Type Definitions ---
interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_gstin: string;
  taxable_amount: number;
  total_tax: number;
  total_amount: number;
}

type AppState = 'IDLE' | 'EXTRACTING' | 'PREVIEW' | 'SECURING' | 'SUCCESS' | 'ERROR';

// --- AI & Hashing Helpers ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
}

async function generateHash(data: ArrayBuffer | Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const App = () => {
  // --- State Management ---
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [txSignature, setTxSignature] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // --- Solana Hook ---
  const { sendTransaction, requestAirdrop, isSending } = useSolanaAction();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetState(true, `${file.name} selected.`);
    }
  };

  const resetState = (keepFile = false, message = '') => {
      if (!keepFile) setSelectedFile(null);
      setAppState('IDLE');
      setExtractedData(null);
      setFileHash('');
      setTxSignature('');
      setErrorMessage('');
      setStatusMessage(message);
  }

  const handleExtractDetails = async () => {
    if (!selectedFile) return setErrorMessage('Please select a file.');
    setAppState('EXTRACTING');
    setStatusMessage('Step 1/3: Hashing file...');
    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileHash(await generateHash(buffer));

      setStatusMessage('Step 2/3: Extracting data with Gemini AI...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = await fileToGenerativePart(selectedFile);
      const prompt = `From the attached invoice, extract the following fields and return ONLY a single, clean JSON object with no extra text or markdown: "invoice_number", "invoice_date" (YYYY-MM-DD), "vendor_gstin", "taxable_amount" (number), "total_tax" (number), "total_amount" (number).`;
      const result = await model.generateContent([prompt, imagePart]);
      const jsonText = result.response.text().trim().replace(/```json|```/g, "");
      setExtractedData(JSON.parse(jsonText));
      setAppState('PREVIEW');
      setStatusMessage('Review extracted data.');
    } catch (err: any) {
      setErrorMessage(`AI Extraction Failed: ${err.message}`);
      setAppState('ERROR');
    }
  };

const handleSecureOnBlockchain = async () => {
  if (!extractedData || !fileHash) return setErrorMessage('Data is missing.');
  setAppState('SECURING');
  setStatusMessage('Step 3/3: Preparing transaction...');
  try {
    const dataToHash = JSON.stringify(extractedData, Object.keys(extractedData).sort());
    const dataBuffer = new TextEncoder().encode(dataToHash);
    const dataHash = await generateHash(dataBuffer);

    const memoPayload = JSON.stringify({
      invoiceNumber: extractedData.invoice_number,
      fileHash,
      dataHash,
    });

    setStatusMessage('Please confirm transaction in your wallet...');
    const { signature, error } = await sendTransaction(memoPayload);
    
    if (error) throw error;

      if (signature) {
        setTxSignature(signature);
        setAppState('SUCCESS');
        setStatusMessage('Success! Invoice secured on Solana.');
      } else {
        throw new Error("Transaction failed to return a signature.");
      }
    } catch (err: any) {
      setErrorMessage(`Blockchain Error: ${err.message}`);
      setAppState('ERROR');
    }
  };

  const handleAirdrop = async () => {
      setStatusMessage("Requesting 1 SOL from the devnet faucet...");
      const { error } = await requestAirdrop();
      if (error) {
          setErrorMessage(error.message);
          setAppState('ERROR');
      } else {
          setStatusMessage("Airdrop successful! You can now send a transaction.");
      }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <button onClick={handleAirdrop} disabled={isSending} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:bg-slate-400">
            {isSending ? 'Processing...' : 'Get Free SOL (Devnet)'}
        </button>
        <WalletMultiButton />
      </div>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">AI Accountant</h1>
          <p className="text-slate-500 mt-2">Secure invoices on the Solana blockchain with AI.</p>
        </div>

        {appState === 'IDLE' && (
          <>
            <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload an invoice</span></p>
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
              </label>
              {selectedFile && <p className="text-sm text-slate-600 mt-2">{statusMessage}</p>}
            </div>
            <button onClick={handleExtractDetails} disabled={!selectedFile || isSending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-slate-400">
              Extract & Analyze Invoice
            </button>
          </>
        )}

        {(appState === 'EXTRACTING' || appState === 'SECURING') && (
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
            <p className="text-sm font-medium text-blue-700">{statusMessage}</p>
          </div>
        )}

        {appState === 'PREVIEW' && extractedData && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-amber-800">Review Extracted Data</h3>
            <pre className="text-xs text-amber-900 bg-white p-3 rounded-md overflow-x-auto">
              <code>{JSON.stringify(extractedData, null, 2)}</code>
            </pre>
            <p className="text-xs text-slate-500 break-words">
              <strong>File Fingerprint (SHA-256):</strong><br/> {fileHash}
            </p>
            <button onClick={handleSecureOnBlockchain} disabled={isSending} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-slate-400">
              {isSending ? 'Securing...' : 'Confirm & Secure on Solana'}
            </button>
          </div>
        )}

        {appState === 'SUCCESS' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center space-y-4">
            <h3 className="text-lg font-semibold text-green-800">✅ Invoice Secured!</h3>
            <p className="text-sm text-green-700 break-words">
              Your invoice's digital fingerprints are recorded on the Solana devnet.
              <a href={`https://solscan.io/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-green-900 block mt-2">
                View Transaction on Solscan
              </a>
            </p>
            <button onClick={() => resetState()} className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
              Process Another Invoice
            </button>
          </div>
        )}

        {appState === 'ERROR' && (
          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
            <p className="text-sm font-medium text-red-700 break-words">{errorMessage}</p>
            <button onClick={() => resetState(true)} className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
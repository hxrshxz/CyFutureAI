"use client";

import { useState, type ChangeEvent } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";
import './App.css';

// Add global declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- Configuration ---
// SECURE: Load variables from .env.local file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Polygon Amoy Testnet Configuration (Recommended for easy faucet access)
const REQUIRED_CHAIN_ID = '0x13882'; // 80002 in hex
const REQUIRED_NETWORK_NAME = 'Polygon Amoy Testnet';

// The ABI should be updated if you change your smart contract's functions or events.
// This ABI matches the final InvoiceRegistry.sol contract.
const CONTRACT_ABI:any = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "invoiceNumber",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "fileHash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "dataHash",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "InvoiceStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_invoiceNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_fileHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_dataHash",
				"type": "string"
			}
		],
		"name": "storeInvoice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "invoices",
		"outputs": [
			{
				"internalType": "string",
				"name": "invoiceNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "fileHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "dataHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

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

// --- AI & File Helpers ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
}

async function generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hash = ethers.sha256(new Uint8Array(buffer));
    return hash;
}

/**
 * Checks if the user is on the correct blockchain network and prompts them to switch if not.
 */
async function checkAndSwitchNetwork(): Promise<boolean> {
    if (!window.ethereum) return false;
    try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== REQUIRED_CHAIN_ID) {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: REQUIRED_CHAIN_ID }],
            });
        }
        return true;
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            try {
                // This will add the network if the user doesn't have it.
                // It is configured for Polygon Amoy but can be changed for any EVM network.
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: REQUIRED_CHAIN_ID,
                            chainName: REQUIRED_NETWORK_NAME,
                            rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                            blockExplorerUrls: ['https://www.oklink.com/amoy'],
                        },
                    ],
                });
                return true;
            } catch (addError) {
                console.error("Failed to add the network", addError);
                return false;
            }
        }
        console.error("Failed to switch network", switchError);
        return false;
    }
}

/**
 * Parses complex ethers.js errors to find the root cause.
 * @param {any} error - The error object from a catch block.
 * @returns {string} - A simplified, user-friendly error message.
 */
function parseBlockchainError(error: any): string {
    // For transactions reverted with a specific reason string (the best case)
    if (error.reason) {
        return error.reason;
    }
    // For transactions reverted without a reason (e.g., require(false))
    if (error.code === 'CALL_EXCEPTION') {
        return 'The transaction was rejected by the smart contract. This often means the invoice number already exists or another rule was broken.';
    }
    // For user-rejected transactions in their wallet
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        return 'Transaction was rejected in your wallet.';
    }
    // Fallback for other errors
    return error.message || 'An unknown blockchain error occurred.';
}


export const App = () => {
  // --- State Management ---
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetState(true, `${file.name} selected.`);
    }
  };

  const resetState = (keepFile = false, message = '') => {
      if (!keepFile) {
        setSelectedFile(null);
      }
      setAppState('IDLE');
      setExtractedData(null);
      setFileHash('');
      setTxHash('');
      setErrorMessage('');
      setStatusMessage(message);
  }

  // --- Workflow Step 1: Extraction ---
  const handleExtractDetails = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an invoice file first.');
      setAppState('ERROR');
      return;
    }
    
    setAppState('EXTRACTING');
    setErrorMessage('');
    setStatusMessage('Step 1/3: Hashing original document...');
    
    try {
      const originalFileHash = await generateFileHash(selectedFile);
      setFileHash(originalFileHash);

      setStatusMessage('Step 2/3: Extracting data with Gemini AI...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = await fileToGenerativePart(selectedFile);
      
      const prompt = `From the attached invoice image, extract the following fields and return ONLY a single, clean JSON object with no extra text, explanations, or markdown: , if a field is missing, use an empty string or zero as appropriate.
        - "invoice_number": string
        - "invoice_date": "YYYY-MM-DD"
        - "vendor_gstin": string (must be 15 characters)
        - "taxable_amount": number
        - "total_tax": number
        - "total_amount": number`;

      const result = await model.generateContent([prompt, imagePart]);
      const jsonText = result.response.text().trim().replace(/```json|```/g, "");
      const data: InvoiceData = JSON.parse(jsonText);

      setExtractedData(data);
      setAppState('PREVIEW');
      setStatusMessage('Extraction complete. Please review the details below.');

    } catch (err: any) {
      console.error("Extraction Error:", err);
      setErrorMessage(`AI Extraction Failed: ${err.message}. Please try another document.`);
      setAppState('ERROR');
    }
  };

  // --- Workflow Step 2: Securing on Blockchain ---
  const handleSecureOnBlockchain = async () => {
    if (!extractedData || !fileHash) {
      setErrorMessage('Extracted data is missing. Please restart the process.');
      setAppState('ERROR');
      return;
    }
    
    setAppState('SECURING');
    setErrorMessage('');
    setStatusMessage('Step 3/3: Preparing blockchain transaction...');

    try {
      if (!window.ethereum) throw new Error("A web3 wallet (like Phantom or MetaMask) is not installed.");
      
      setStatusMessage(`Please connect to ${REQUIRED_NETWORK_NAME}...`);
      const isNetworkCorrect = await checkAndSwitchNetwork();
      if (!isNetworkCorrect) {
          throw new Error(`Please switch to the ${REQUIRED_NETWORK_NAME} in your wallet.`);
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const dataToHash = JSON.stringify(extractedData, Object.keys(extractedData).sort());
      const dataHash = ethers.sha256(ethers.toUtf8Bytes(dataToHash));

      setStatusMessage('Please confirm the transaction in your wallet...');
      const transaction = await contract.storeInvoice(
        extractedData.invoice_number,
        fileHash,
        dataHash
      );

      setStatusMessage('Waiting for blockchain confirmation...');
      await transaction.wait();

      setTxHash(transaction.hash);
      setAppState('SUCCESS');
      setStatusMessage('Success! Your invoice is permanently secured.');

    } catch (err: any) {
      console.error("Blockchain Error:", err);
      const friendlyErrorMessage = parseBlockchainError(err);
      setErrorMessage(`Blockchain Error: ${friendlyErrorMessage}`);
      setAppState('ERROR');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">AI Accountant</h1>
          <p className="text-slate-500 mt-2">The intelligent way to process & secure your financial documents.</p>
        </div>

        {/* --- IDLE State: File Upload --- */}
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
            <button
              onClick={handleExtractDetails}
              disabled={!selectedFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              Extract & Analyze Invoice
            </button>
          </>
        )}

        {/* --- EXTRACTING or SECURING State: Loading Indicator --- */}
        {(appState === 'EXTRACTING' || appState === 'SECURING') && (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                <p className="text-sm font-medium text-blue-700">{statusMessage}</p>
            </div>
        )}

        {/* --- PREVIEW State: Show Extracted Data and Confirm Button --- */}
        {appState === 'PREVIEW' && extractedData && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Please Review Extracted Data</h3>
            <pre className="text-xs text-amber-900 bg-white p-3 rounded-md overflow-x-auto">
              <code>{JSON.stringify(extractedData, null, 2)}</code>
            </pre>
            <p className="text-xs text-slate-500 break-words">
                <strong>Original File Fingerprint (SHA-256):</strong><br/> {fileHash}
            </p>
            <button
              onClick={handleSecureOnBlockchain}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
            >
              Confirm & Secure on Blockchain
            </button>
          </div>
        )}

        {/* --- SUCCESS State: Show Transaction Link --- */}
        {appState === 'SUCCESS' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center space-y-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Invoice Secured!</h3>
            <p className="text-sm text-green-700 break-words">
              Your invoice's digital fingerprints are permanently recorded on the blockchain.
              <a href={`https://www.oklink.com/amoy/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-green-900 block mt-2">
                View Transaction on Polygon Explorer
              </a>
            </p>
            <button onClick={() => resetState()} className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
                Process Another Invoice
            </button>
          </div>
        )}

        {/* --- ERROR State: Show Error Message --- */}
        {appState === 'ERROR' && (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                <button onClick={() => resetState(true)} className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
                    Try Again
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
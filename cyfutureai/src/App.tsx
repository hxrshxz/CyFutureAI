"use client"; // Add this if you are using Next.js App Router

import { useState, type ChangeEvent, type FC } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';

// --- Configuration ---
// IMPORTANT: For the hackathon, you must replace these with your actual keys.
// In a real production app, never expose your API key in the frontend code.
const GEMINI_API_KEY = "AIzaSyDXExWHkiAeuBGqmXCSPU6CkFPNaAZUREA"; // Replace with your Gemini API Key
const N8N_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL";

// --- Initialize the Gemini AI Client ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- Define the structure of the data we expect from the AI ---
interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_gstin: string;
  taxable_amount: number;
  total_tax: number;
  total_amount: number;
}

/**
 * A browser-friendly function to convert a File object into the format
 * required by the Gemini API.
 */
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const App = () => {
  // --- State Management with TypeScript Types ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedData(null); 
      setError('');
    }
  };

  const handleProcessInvoice = async () => {
    if (!selectedFile) {
      setError('Please select an invoice file first.');
      return;
    }
    if (!GEMINI_API_KEY) {
      setError("Error: Gemini API Key is missing.");
      return;
    }

    setIsLoading(true);
    setError('');
    setExtractedData(null);
    setStatusMessage('Step 1/3: Preparing file for AI analysis...');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = await fileToGenerativePart(selectedFile);
      
      const prompt = `
        From the attached invoice image, extract the following fields and return ONLY a single, clean JSON object with no extra text, explanations, or markdown formatting:
        - "invoice_number": string
        - "invoice_date": "YYYY-MM-DD"
        - "vendor_gstin": string (must be 15 characters)
        - "taxable_amount": float
        - "total_tax": float
        - "total_amount": float
      `;

      setStatusMessage('Step 2/3: Extracting data with Gemini AI...');
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const jsonText = response.text().trim().replace(/```json|```/g, "");
      const data: InvoiceData = JSON.parse(jsonText);
      setExtractedData(data);
      
      setStatusMessage('Step 3/3: Sending data to Reconciliation Agent...');
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!n8nResponse.ok) {
        throw new Error(`The n8n workflow responded with an error! Status: ${n8nResponse.status}`);
      }

      setStatusMessage('✅ Success! The invoice data was processed and sent.');

    } catch (err: any) {
      console.error(err);
      setError(`An error occurred: ${err.message}. Check the console for details.`);
      setStatusMessage('Process failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">AI Accountant</h1>
          <p className="text-slate-500 mt-2">The intelligent way to process your financial documents.</p>
        </div>

        {/* --- File Input --- */}
        <div className="flex flex-col items-center justify-center w-full">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload an invoice</span></p>
              <p className="text-xs text-slate-500">PDF, PNG, JPG, or WEBP</p>
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
          </label>
          {selectedFile && <p className="text-sm text-slate-600 mt-2">Selected: <span className="font-medium">{selectedFile.name}</span></p>}
        </div>

        {/* --- Process Button --- */}
        <button
          onClick={handleProcessInvoice}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : ' Extract & Process Invoice'}
        </button>

        {/* --- Status & Results Area --- */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-700">{statusMessage}</p>
            </div>
          )}
          {error && (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          {extractedData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Extraction Successful</h3>
              <pre className="text-xs text-green-900 bg-white p-3 rounded-md overflow-x-auto">
                <code>{JSON.stringify(extractedData, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
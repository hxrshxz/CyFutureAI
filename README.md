CyFuture AI: Decentralized Invoice Processing

🚀 Live Demo
Check out the live deployed version of our application: https://blockledger-cyfuture.vercel.app/




CyFuture AI is a next-generation financial processing platform that leverages Artificial Intelligence, decentralized storage (IPFS), and the Solana blockchain to offer a secure, transparent, and intelligent way to manage invoices.

We transform unstructured invoices into structured, verifiable data, secured with an immutable on-chain record. Our platform not only automates data entry but also provides an AI-powered assistant to derive meaningful insights from your financial documents.

✨ Key Features
AI-Powered Data Extraction: Upload any invoice (PDF or image), and our Google Gemini-powered vision model will intelligently parse and extract key information like invoice number, vendor, total amount, and date.

Decentralized Storage: Every uploaded invoice and its extracted data is stored on the InterPlanetary File System (IPFS) via Pinata, ensuring your documents are tamper-proof, censorship-resistant, and always accessible.

Blockchain-Verified Transactions: Each processed invoice generates a unique transaction on the Solana Devnet. This transaction includes the IPFS hash, creating an immutable, publicly verifiable proof of the document's existence and its processed state.

Interactive Dashboard: A clean and modern interface to view key financial stats, manage the invoice processing queue, and track the status of each document from upload to blockchain confirmation.


Conversational AI Accountant: Chat with your data! Our AI assistant can answer questions, summarize expenses, and provide insights based on the invoices you've processed.

Multi-Language and Voice Support: Interact with the AI assistant using typed commands or voice in multiple languages, including English, Hindi, and more.

1. The Landing Page
A sleek and modern entry point to the application.

<img width="1318" height="714" alt="Screenshot 2025-09-26 at 2 50 06 AM" src="https://github.com/user-attachments/assets/ce9f9e4e-54ec-4d62-a7d2-fa97fa7bcbb8" />
<img width="1179" height="602" alt="Screenshot 2025-09-26 at 2 52 49 AM" src="https://github.com/user-attachments/assets/6a237a1b-682f-40c0-8f1c-79951d65e352" />
<img width="554" height="405" alt="Screenshot 2025-09-26 at 2 53 28 AM" src="https://github.com/user-attachments/assets/fcfa0c0d-fe97-4e29-9dd9-1d550cbe3589" />


How It Works - The Technology Stack
Our platform integrates several cutting-edge technologies to create a seamless and secure workflow.

The processing pipeline is as follows:

Invoice Upload: The user uploads an invoice (PDF or image) through our React-based frontend.

AI Data Extraction: The invoice is sent to the Google Gemini 1.5 Flash API. The multimodal model analyzes the image and returns a structured JSON object containing the extracted financial data.

Decentralized Storage (IPFS):

The original invoice file is uploaded to IPFS via the Pinata service.

The AI-extracted JSON data is also uploaded to IPFS as a separate file.

Blockchain Proof (Solana):

The user connects their Solana wallet (like Phantom or Solflare).

A new transaction is created on the Solana Devnet.

This transaction contains the IPFS hash (CID) of the invoice data stored in its memo field.

This action creates an immutable, on-chain record that acts as a timestamped proof of the invoice's processing.

Data Visualization & Interaction: The processed data populates the dashboard and becomes queryable through the AI Accountant interface, allowing the user to gain insights from their verified financial documents.

Tech Stack:
Frontend: React, Vite, TypeScript, Tailwind CSS

AI & Machine Learning: Google Gemini 1.5 Flash API

Decentralized Storage: IPFS (via Pinata)

Blockchain: Solana

UI Components: shadcn/ui, Framer Motion for animations

Wallet Integration: Solana Wallet Adapter 


Of course! Here's a professional README draft for your hackathon project. I've structured it with placeholders for screenshots so you can easily add them in.

CyFuture AI: Decentralized Invoice Processing
CyFuture AI is a next-generation financial processing platform that leverages Artificial Intelligence, decentralized storage (IPFS), and the Solana blockchain to offer a secure, transparent, and intelligent way to manage invoices.

We transform unstructured invoices into structured, verifiable data, secured with an immutable on-chain record. Our platform not only automates data entry but also provides an AI-powered assistant to derive meaningful insights from your financial documents.

✨ Key Features
AI-Powered Data Extraction: Upload any invoice (PDF or image), and our Google Gemini-powered vision model will intelligently parse and extract key information like invoice number, vendor, total amount, and date.

Decentralized Storage: Every uploaded invoice and its extracted data is stored on the InterPlanetary File System (IPFS) via Pinata, ensuring your documents are tamper-proof, censorship-resistant, and always accessible.

Blockchain-Verified Transactions: Each processed invoice generates a unique transaction on the Solana Devnet. This transaction includes the IPFS hash, creating an immutable, publicly verifiable proof of the document's existence and its processed state.

Interactive Dashboard: A clean and modern interface to view key financial stats, manage the invoice processing queue, and track the status of each document from upload to blockchain confirmation.

Conversational AI Accountant: Chat with your data! Our AI assistant can answer questions, summarize expenses, and provide insights based on the invoices you've processed.

Multi-Language and Voice Support: Interact with the AI assistant using typed commands or voice in multiple languages, including English, Hindi, and more.

📸 Screenshots
A picture is worth a thousand words. Here’s a glimpse of CyFuture AI in action.

1. The Landing Page
A sleek and modern entry point to the application.
`



`

2. The Main Dashboard
An at-a-glance overview of your financial data, recent activities, and quick actions.
``

3. The Invoice Processing Queue
Track the status of each invoice as it moves through the AI extraction, IPFS upload, and Solana transaction pipeline.
``

4. The AI Accountant in Action
Engage in a conversation with your data. Ask a question and get an instant, AI-generated response.
``

⚙️ How It Works - The Technology Stack
Our platform integrates several cutting-edge technologies to create a seamless and secure workflow.

The processing pipeline is as follows:

Invoice Upload: The user uploads an invoice (PDF or image) through our React-based frontend.

AI Data Extraction: The invoice is sent to the Google Gemini 1.5 Flash API. The multimodal model analyzes the image and returns a structured JSON object containing the extracted financial data.

Decentralized Storage (IPFS):

The original invoice file is uploaded to IPFS via the Pinata service.

The AI-extracted JSON data is also uploaded to IPFS as a separate file.

Blockchain Proof (Solana):

The user connects their Solana wallet (like Phantom or Solflare).

A new transaction is created on the Solana Devnet.

This transaction contains the IPFS hash (CID) of the invoice data stored in its memo field.

This action creates an immutable, on-chain record that acts as a timestamped proof of the invoice's processing.

Data Visualization & Interaction: The processed data populates the dashboard and becomes queryable through the AI Accountant interface, allowing the user to gain insights from their verified financial documents.

Tech Stack:
Frontend: React, Vite, TypeScript, Tailwind CSS

AI & Machine Learning: Google Gemini 1.5 Flash API

Decentralized Storage: IPFS (via Pinata)

Blockchain: Solana

UI Components: shadcn/ui, Framer Motion for animations

Wallet Integration: Solana Wallet Adapter

🚀 Getting Started
Follow these instructions to get a local copy up and running.

Prerequisites
Node.js (v18.0.0 or higher)

npm or yarn package manager

A Solana wallet extension in your browser (Phantom is recommended).

API keys for Google Gemini and Pinata.

Installation & Setup
Clone the repository:

Bash

git clone https://github.com/your-username/cyfutureai.git
cd cyfutureai
Install dependencies:

Bash

npm install
# or
yarn install
Set up environment variables:
Create a .env file in the root of the cyfutureai directory and add the following variables. You can get these from their respective platforms:

Code snippet

# Your Google Gemini API Key
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Your Pinata JWT for IPFS uploads
VITE_PINATA_JWT="YOUR_PINATA_JWT"
Run the development server:

Bash

npm run dev
# or
yarn dev
The application should now be running on http://localhost:5173.

Get Devnet SOL:

Once the app is running, connect your Solana wallet.

Ensure your wallet is set to the Devnet.

Use the "Get Free SOL" button in the dashboard or a public faucet to get some Devnet SOL for paying transaction fees.



🔮 Future Improvements
This project was built for a hackathon, but there are many ways it could be expanded:

Smart Contract Integration: Move beyond memo-based transactions to store invoice hashes in a more structured on-chain program (smart contract) for advanced querying and verification.

Batch Processing: Allow users to upload and process hundreds of invoices in a single batch.

Deployment with Kubernetes: Containerize the different services (frontend, AI processing worker, blockchain service) and deploy them on a Kubernetes cluster. This would provide improved scalability, resilience, and automated management for handling a high volume of requests.

Advanced Analytics: Implement more complex financial reports, trend analysis, and anomaly detection based on the aggregated invoice data.

Automated Payments: Integrate with Solana Pay or other crypto payment rails to enable one-click bill payments directly from the dashboard.

Mainnet Deployment: Prepare the application for a Solana Mainnet launch with robust error handling and security audits.

👥 Authors

1) Harsh Kumar
2) Devansh



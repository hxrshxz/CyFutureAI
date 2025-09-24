"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Bot, User, X, TrendingUp, ArrowDown, ArrowUp } from "lucide-react";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import ListeningIndicator from "./components/ai/ListeningIndicator";
import GeminiShimmerEffect from "./components/ai/GeminiShimmerEffect";
import Toast from "./components/ai/Toast";
import INGRESCommandBar from "./components/ai/CommandBar";
import { MemoizedStatCard } from "./components/ai/StatCard";
import AnimatedMarkdownMessage from "./components/ai/AnimatedMarkdownMessage";
import HydrogeologicalAnalysisChart from "./components/ai/HydrogeologicalAnalysisChart";

type ChatMessage = {
  id: number;
  type: string;
  text?: string;
  component?: React.ReactNode;
};

// --- Main INGRES Assistant Component ---
const AIAccountant = ({ embedded = false }: { embedded?: boolean }) => {
  const [view, setView] = useState("dashboard");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const handleFakeMapAnalysis = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setView("chat");

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: "user",
      text: `Analyzing map: ${file.name}`,
    };

    setChatHistory((previousChatHistory) => [
      ...previousChatHistory,
      userMessage,
    ]);

    setIsThinking(true);

    setTimeout(() => {
      const graphMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "bot",
        component: <HydrogeologicalAnalysisChart />,
      };

      setChatHistory((previousChatHistory) => [
        ...previousChatHistory,
        graphMessage,
      ]);
      setIsThinking(false);
    }, 4000);

    if (event.target) {
      event.target.value = "";
    }
  };
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeYear, setActiveYear] = useState("Latest (2025)");
  const [language, setLanguage] = useState("en-US");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState({
    message: "",
    type: "info",
    visible: false,
  });

  const [isCoPilotMode, setIsCoPilotMode] = useState(false);
  const [isListeningForFollowUp, setIsListeningForFollowUp] = useState(false);
  const [showListeningIndicator, setShowListeningIndicator] = useState(false);

  const {
    text: voiceText,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
  } = useSpeechRecognition({ lang: language });

  const speakText = (text: string, onEnd?: () => void) => {
    if (!isCoPilotMode) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice;
    if (language.startsWith("en")) {
      const preferredVoiceNames = [
        "Google UK English Female",
        "Microsoft Aria Online (Natural)",
        "Microsoft Libby Online (Natural)",
        "Apple Samantha",
        "Apple Moira",
        "Daniel",
        "Samantha",
        "Karen",
        "Google US English",
        "Alex",
      ];
      for (const voiceName of preferredVoiceNames) {
        const voice = voices.find((v) => v.name === voiceName);
        if (voice) {
          selectedVoice = voice;
          break;
        }
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (voice) =>
            (voice.name.toLowerCase().includes("natural") ||
              voice.name.toLowerCase().includes("premium") ||
              voice.name.toLowerCase().includes("enhanced")) &&
            voice.lang.startsWith("en")
        );
      }
    } else if (language.startsWith("hi")) {
      const preferredHindiVoices = [
        "Google हिन्दी",
        "Microsoft Swara Online (Natural)",
        "Lekha",
      ];
      for (const voiceName of preferredHindiVoices) {
        const voice = voices.find((v) => v.name === voiceName);
        if (voice) {
          selectedVoice = voice;
          break;
        }
      }
    }
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) =>
        voice.lang.startsWith(language.split("-")[0])
      );
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    text = text.replace(/([.,!?;:])/g, "$1 ");
    text = text.replace(/\n\n/g, ".\n\n");
    text = text.replace(
      /\b(critical|severe|important|significant|Over-Exploited|Critical|Safe)\b/g,
      " $1 "
    );
    text = text.replace(/(\d+)%/g, "$1 percent");
    text = text.replace(/(\d+)\.(\d+)/g, "$1 point $2");
    text = text.replace(/(\d{4})-(\d{4})/g, "$1 to $2");
    const sentences = text.split(/(?<=[.!?])\s+/);
    const processedSentences = sentences.map((sentence, index) => {
      if (index > 0 && index % 10 === 0) {
        const fillers = ["Now, ", "So, ", "Well, ", "You see, ", "Actually, ", "Essentially, "];
        const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
        return randomFiller + sentence;
      }
      return sentence;
    });
    utterance.text = processedSentences.join(" ");
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
        loadVoices();
        return () => {
          window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (voiceText) setInputValue(voiceText);
  }, [voiceText]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      setShowListeningIndicator(false);
      setIsListeningForFollowUp(false);
      if (isCoPilotMode && voiceText) {
        setInputValue(voiceText);
        setTimeout(() => {
          handleChatSubmit(voiceText);
        }, 300);
      }
    } else {
      if (isCoPilotMode) {
        speakText("I'm listening now. How can I assist with your financial data analysis?", () => {
          startListening();
          setShowListeningIndicator(true);
        });
      } else {
        startListening();
        setShowListeningIndicator(true);
      }
    }
  };
  const handleLanguageChange = () => setLanguage((prev) => (prev === "en-US" ? "hi-IN" : "en-US"));

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatHistory, isThinking]);

  useEffect(() => {
    if (voiceText) {
      setInputValue(voiceText);
      if (isCoPilotMode && isListeningForFollowUp && voiceText.trim().length > 5) {
        stopListening();
        setShowListeningIndicator(false);
        setIsListeningForFollowUp(false);
        handleChatSubmit(voiceText);
      }
    }
  }, [voiceText, isCoPilotMode, isListeningForFollowUp]);

  useEffect(() => {
    if (isCoPilotMode) {
      speakText("Voice assistant activated. I'll provide detailed spoken responses to help you analyze financial data.");
    }
  }, [isCoPilotMode]);

  // --- 🔧 THIS ENTIRE FUNCTION IS CORRECTED ---
  const handleChatSubmit = async (text: string) => {
    if (!text.trim()) return;
    setView("chat");
    setChatHistory((prev) => [...prev, { id: Date.now(), type: "user", text }]);
    setInputValue("");
    setIsThinking(true);

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `You are an AI assistant for CyFuture AI, a financial analysis tool. Your knowledge base is general financial data. Based on this data, answer the user's question. Be concise and helpful. Use Markdown for formatting (e.g., **bold** for emphasis, lists). User's question: "${text}"`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const aiResponseText = response.text();
          const aiResponse = { id: Date.now() + 1, type: "ai", text: aiResponseText };

          // FIX: Update history and stop thinking in the same step
          setChatHistory((prev) => [...prev, aiResponse]);
          setIsThinking(false);

        } catch (error) {
          console.error("Error calling Gemini API:", error);
          const aiResponse = { id: Date.now() + 1, type: "ai", text: "Sorry, I encountered an error while connecting to the AI service. The model may be overloaded. Please try again later." };
          
          // FIX: Update history and stop thinking in the same step
          setChatHistory((prev) => [...prev, aiResponse]);
          setIsThinking(false);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const aiResponse = { id: Date.now() + 1, type: "ai", text: "I can provide detailed data for financial analysis. (Note: Gemini API key not configured. Please set up your VITE_GEMINI_API_KEY in the .env.local file)." };
        
        // FIX: Update history and stop thinking in the same step
        setChatHistory((prev) => [...prev, aiResponse]);
        setIsThinking(false);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      const errorResponse = {
        id: Date.now() + 1,
        type: "ai",
        component: (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-red-700">Sorry, I encountered an error</h3>
            </div>
            <p className="text-red-600">I was unable to process your request. Please try again later or rephrase your question.</p>
          </div>
        ),
      };
      
      // FIX: Update history and stop thinking in the same step
      setChatHistory((prev) => [...prev, errorResponse]);
      setIsThinking(false);
    }
  };

  const iconMap: { [key: string]: React.ElementType } = { TrendingUp, ArrowDown, ArrowUp, User };

  const stats = useMemo(() => [
    { title: "Total Revenue", value: 660000, icon: iconMap["TrendingUp"], iconColor: "text-green-500", change: "+5.2%" },
    { title: "Total Expenses", value: 150000, icon: iconMap["ArrowDown"], iconColor: "text-red-500", change: "+2.1%" },
    { title: "Net Profit", value: 510000, icon: iconMap["ArrowUp"], iconColor: "text-green-500", change: "+6.8%" },
    { title: "New Customers", value: 3461, icon: iconMap["User"], iconColor: "text-sky-500", change: "+0.5%" },
  ], []);

  const commonCommandBarProps = {
    inputValue,
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
    onSubmit: () => handleChatSubmit(inputValue),
    isListening,
    onMicClick: handleMicClick,
    hasSpeechSupport: hasRecognitionSupport,
    language,
    onLanguageChange: handleLanguageChange,
    activeYear: activeYear,
    onYearChange: setActiveYear,
    isCoPilotMode,
    onCoPilotModeChange: setIsCoPilotMode,
    showListeningIndicator,
    isListeningForFollowUp,
  };

  const suggestedPrompts = [
    { title: "Get Revenue Details", text: "Show the revenue for the last quarter", description: "Fetch a detailed visual report for revenue." },
    { title: "List Top Expenses", text: "List all top expenses in the last month", description: "Filter and view expenses by category and state." },
    { title: "Compare Two Quarters", text: "Compare revenue in Q1 and Q2 over the last 5 years.", description: "Analyze historical trends between two quarters." },
    { title: "Predict Future Trends", text: "Forecast the revenue for the next 6 months", description: "Use predictive analytics to see future possibilities." },
    { title: "Get AI Recommendations", text: "What can we do to reduce expenses in marketing?", description: "Receive actionable advice based on current data." },
  ];

  const renderDashboard = () => (
    <div className={`container mx-auto px-4 pt-8 pb-24 ${embedded ? "mt-0" : "mt-10"}`}>
      <div className="relative text-center max-w-4xl mx-auto">
        {!embedded && <div className="absolute top-0 right-0 -mr-8 mt-4 w-32 h-32 bg-sky-400/30 rounded-full blur-3xl animate-pulse"></div>}
        <h1 className={`font-bold text-slate-800 ${embedded ? "text-3xl" : "text-5xl md:text-7xl"}`}>CyFuture AI Assistant</h1>
        <p className="text-xl text-slate-600 max-w-2xl mt-4 mx-auto">Your intelligent command center for India's financial data.</p>
      </div>
      <div className="mt-12">
        <INGRESCommandBar {...commonCommandBarProps} onFileSelect={handleFakeMapAnalysis} />
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-6xl mx-auto"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <MemoizedStatCard stat={stat} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  const renderChatView = () => (
    <div className={`flex items-center justify-center min-h-screen p-4 ${embedded ? "p-2" : "md:p-6"}`}>
      <Card className={`w-full flex flex-col shadow-2xl rounded-2xl ${embedded ? "h-full max-w-none bg-slate-800/90 border-slate-700" : "max-w-5xl h-[calc(100vh-1rem)] bg-white/60 backdrop-blur-xl border-white/30"}`}>
        <CardHeader className={`flex flex-row items-center justify-between ${embedded ? "border-slate-700 bg-slate-800/50" : "border-slate-200/80"}`}>
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-xl">AI Data Analyst</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { setView("dashboard"); setChatHistory([]); }}>
              <X className="h-4 w-4 mr-2" /> End Chat
            </Button>
          </div>
        </CardHeader>
        
        <CardContent ref={chatContainerRef} className={`flex-grow overflow-y-auto min-h-0 space-y-6 ${embedded ? "p-3" : "p-6"}`}>
          {chatHistory.length === 0 && (
            <motion.div variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="pt-4 pb-8 text-center">
              <motion.h3 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-lg font-semibold text-slate-700 mb-4">
                Try one of these sample queries...
              </motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedPrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    onClick={() => handleChatSubmit(prompt.text)}
                    className={`p-4 rounded-lg text-left text-sm font-medium border shadow-sm hover:shadow-md ${embedded ? "bg-slate-700/50 text-slate-200 border-slate-600 hover:bg-slate-600/50" : "bg-white/60 text-slate-800 hover:bg-slate-100/80"}`}
                  >
                    <p className="font-semibold">{prompt.title}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {chatHistory.map((msg) => {
              const isGraphMessage = !!msg.component;

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 ${msg.type === "user" ? "ml-auto justify-end" : "mr-auto"} w-full`}
                >
                  {msg.type !== "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-purple-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-sky-600" />
                    </div>
                  )}

                  <div className={isGraphMessage ? "w-full" : "max-w-2xl"}>
                    {msg.type === "user" ? (
                      <div className="bg-purple-500 text-white p-3 rounded-2xl rounded-br-lg shadow-sm">
                        <p className="text-base">{msg.text}</p>
                      </div>
                    ) : msg.component ? (
                      msg.component
                    ) : (
                      <div className={`p-4 rounded-2xl rounded-bl-lg border shadow-sm ${embedded ? "bg-slate-700/50 text-slate-200 border-slate-600" : "bg-white text-slate-800"}`}>
                        <AnimatedMarkdownMessage text={msg.text || ""} />
                      </div>
                    )}
                  </div>

                  {msg.type === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              );
            })}
            {isThinking && <GeminiShimmerEffect />}
          </AnimatePresence>
        </CardContent>
        <CardContent className={`${embedded ? "border-slate-700 bg-slate-800/50" : "border-slate-200/80"} pt-4`}>
          <INGRESCommandBar {...commonCommandBarProps} onFileSelect={handleFakeMapAnalysis} />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen text-slate-900 font-sans isolate ${embedded ? "bg-slate-900" : "bg-slate-100"}`}>
      {!embedded && (
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute -top-1/4 left-0 h-[800px] w-[800px] bg-purple-200/30 rounded-full blur-3xl filter animate-blob"></div>
          <div className="absolute -top-1/3 right-0 h-[800px] w-[800px] bg-sky-200/30 rounded-full filter animate-blob animation-delay-2000"></div>
        </div>
      )}
      <AnimatePresence>
        {toast.visible && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, visible: false })} />}
      </AnimatePresence>

      <AnimatePresence>
        {showListeningIndicator && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
            <ListeningIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {view === "dashboard" ? renderDashboard() : renderChatView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIAccountant;
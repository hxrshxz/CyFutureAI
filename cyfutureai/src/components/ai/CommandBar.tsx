import { motion } from "framer-motion";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, Mic, Camera, Languages, Volume2, VolumeX } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AnimatePresence } from "framer-motion";

const INGRESCommandBar = ({
  inputValue,
  onInputChange,
  onSubmit,
  isListening,
  onMicClick,
  hasSpeechSupport,
  language,
  onLanguageChange,
  activeYear,
  onYearChange,
  isCoPilotMode,
  onCoPilotModeChange,
  onFileSelect,
}: any) => {
  const placeholders = useMemo(
    () =>
      language === "en-US"
        ? [
            "Show data for last quarter...",
            "List all critical expenses...",
            "Compare Q1 and Q2...",
            "Why is revenue declining in retail?",
            "What caused the spike in marketing spend?",
            "Show budget impact on revenue...",
            "Explain expense causes in operations...",
            "Compare revenue of 2020-2024...",
            "What policy changes can improve profit?",
            "How do marketing patterns affect revenue?",
          ]
        : [
            "पिछली तिमाही का डेटा दिखाएं...",
            "सभी महत्वपूर्ण खर्चों की सूची बनाएं...",
          ],
    [language]
  );
  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholders[0]);

  useEffect(() => {
    const interval = setInterval(
      () =>
        setCurrentPlaceholder(
          (p) =>
            placeholders[(placeholders.indexOf(p) + 1) % placeholders.length]
        ),
      4000
    );
    return () => clearInterval(interval);
  }, [placeholders]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice type setter for Co-Pilot Mode
  function setVoiceType(value: string): void {
    // This function is passed as a prop to INGRESCommandBar,
    // so it should update the parent's voiceType state.
    // In the parent (INGRESAssistant), setVoiceType is a useState setter.
    // Here, we expect it to be provided via props, so just call the prop.
    // If you need to handle local state, you can add useState here.
    // But in this context, it's a prop function, so do nothing here.
    // (This placeholder is not needed in INGRESCommandBar itself.)
    // If you want to support local state, uncomment below:
    // setVoiceType(value);
    // Otherwise, this will be provided by parent.
  }
  return (
    <motion.div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-sky-400 rounded-3xl blur-lg opacity-30"></div>
        <div className="relative bg-white/70 backdrop-blur-xl  border border-white/40 rounded-2xl shadow-lg p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-full flex items-center">
              <Search className="h-6 w-6 text-slate-500 absolute left-3" />
              <AnimatePresence mode="wait">
                {!inputValue && !isListening && (
                  <motion.p
                    key={currentPlaceholder}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-12 text-base text-slate-600 pointer-events-none"
                  >
                    {currentPlaceholder}
                  </motion.p>
                )}
              </AnimatePresence>
              <Input
                value={inputValue}
                onChange={onInputChange}
                className="w-full bg-transparent border-none text-xl h-auto py-4 pl-12 pr-12 text-slate-900 focus-visible:ring-0"
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              />
              {hasSpeechSupport && (
                <button
                  onClick={onMicClick}
                  className={`absolute right-3 p-2 rounded-full transition-all duration-200 ${
                    isListening
                      ? "bg-green-100 shadow-md"
                      : "hover:bg-slate-200/60"
                  }`}
                >
                  <Mic
                    className={`h-6 w-6 ${
                      isListening
                        ? "text-green-600 animate-pulse"
                        : "text-slate-500"
                    }`}
                  />
                </button>
              )}
            </div>
            <Button
              onClick={onSubmit}
              className="px-4 py-2 rounded-lg text-white [background:linear-gradient(90deg,#3b82f6_0%,#2563eb_100%)]"
            >
              Submit
            </Button>
          </div>

          {/* Popular queries suggestion buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 hover:bg-white text-purple-700 border-purple-200"
              onClick={() => {
                const query = "Compare Q1 and Q2";
                onInputChange({ target: { value: query } } as any);
                onSubmit();
              }}
            >
              Compare Q1 & Q2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 hover:bg-white text-blue-700 border-blue-200"
              onClick={() => {
                const query = "What can we do to reduce expenses in marketing?";
                onInputChange({ target: { value: query } } as any);
                onSubmit();
              }}
            >
              Expense recommendations
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 hover:bg-white text-emerald-700 border-emerald-200"
              onClick={() => {
                const query = "Show budget impact on revenue";
                onInputChange({ target: { value: query } } as any);
                onSubmit();
              }}
            >
              Budget Impact
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 hover:bg-white text-amber-700 border-amber-200"
              onClick={() => {
                const query = "What policy changes can improve profit?";
                onInputChange({ target: { value: query } } as any);
                onSubmit();
              }}
            >
              Policy Recommendations
            </Button>
          </div>

          <div className="flex items-center justify-between pl-2 pr-1">
            <div className="flex items-center gap-2">
              {/* <select
                  value={activeYear}
                  onChange={(e) => onYearChange(e.target.value)}
                  className="rounded-full bg-slate-200/70 px-4 py-1.5 text-sm font-medium text-slate-700 border-none focus:ring-0"
                >
                  <option>Latest (2025)</option>
                  <option>2024</option>
                  <option>2023</option>
                </select> */}
              {hasSpeechSupport && (
                <Button
                  variant="ghost"
                  className="h-auto px-3 py-1.5 rounded-lg"
                  onClick={onLanguageChange}
                >
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-slate-700" />
                    <select
                      value={language}
                      onChange={(e) => onLanguageChange(e.target.value)}
                      className="rounded-lg bg-slate-200/70 px-3 py-1.5 text-sm font-medium text-slate-700 border-none focus:ring-0"
                    >
                      <option value="en-US">English</option>
                      <option value="hi-IN">Hindi</option>
                      <option value="bn-IN">Bengali</option>
                      <option value="gu-IN">Gujarati</option>
                      <option value="ta-IN">Tamil</option>
                      <option value="te-IN">Telugu</option>
                      <option value="mr-IN">Marathi</option>
                      <option value="kn-IN">Kannada</option>
                      <option value="ml-IN">Malayalam</option>
                      <option value="pa-IN">Punjabi</option>
                      <option value="ur-IN">Urdu</option>
                    </select>
                  </div>
                </Button>
              )}

              {/* Co-Pilot Mode toggle */}
              <Button
                variant={isCoPilotMode ? "default" : "ghost"}
                className={`h-auto px-3 py-1.5 rounded-lg ${
                  isCoPilotMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "text-slate-700 hover:bg-slate-200/70"
                }`}
                onClick={() => onCoPilotModeChange(!isCoPilotMode)}
              >
                <div className="flex items-center gap-2">
                  {isCoPilotMode ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  <span>Co-Pilot {isCoPilotMode ? "On" : "Off"}</span>
                </div>
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onFileSelect}
            />
            <Button
              variant="ghost"
              className="h-auto px-3 py-1.5 rounded-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              <span>Analyze Invoice</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default INGRESCommandBar;

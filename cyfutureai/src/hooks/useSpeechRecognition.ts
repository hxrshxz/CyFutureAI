import { useState, useMemo, useRef, useEffect } from "react";

export const useSpeechRecognition = ({ lang }: { lang: string }) => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const hasRecognitionSupport = useMemo(
    () =>
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    []
  );

  useEffect(() => {
    if (!hasRecognitionSupport) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal)
          finalTranscript += event.results[i][0].transcript;
      }
      setText(finalTranscript);
    };
    recognition.onend = () => setIsListening(false);
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [lang, hasRecognitionSupport]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  return {
    text,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
  };
};

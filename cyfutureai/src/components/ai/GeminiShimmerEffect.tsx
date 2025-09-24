import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BrainCircuit } from "lucide-react";

const GeminiShimmerEffect = () => {
  const thinkingPhrases = [
    "Connecting to data source...",
    "Analyzing financial data...",
    "Processing invoice data...",
    "Identifying patterns...",
    "Generating insights...",
  ];
  const shimmerLines = [
    { width: "95%", delay: 0 },
    { width: "100%", delay: 0.1 },
    { width: "90%", delay: 0.2 },
    { width: "75%", delay: 0.3 },
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex(
        (prevIndex) => (prevIndex + 1) % thinkingPhrases.length
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const lineVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-3 max-w-2xl mr-auto"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft"
      >
        <BrainCircuit className="w-5 h-5 text-white" />
      </motion.div>
      <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-soft space-y-3 w-full max-w-md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {shimmerLines.map((line, index) => (
            <motion.div
              key={index}
              variants={lineVariants}
              className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]"
              style={{ width: line.width, animationDelay: `${line.delay}s` }}
            />
          ))}
        </motion.div>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex space-x-1">
            <motion.div
              className="w-1.5 h-1.5 bg-purple-400/60 rounded-full"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-purple-400/60 rounded-full"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1,
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-purple-400/60 rounded-full"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </div>
          <div className="text-xs text-slate-600 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPhraseIndex}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="block"
              >
                {thinkingPhrases[currentPhraseIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GeminiShimmerEffect;

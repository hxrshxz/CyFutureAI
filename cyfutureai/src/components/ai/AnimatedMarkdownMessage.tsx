import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AnimatedMarkdownMessage = ({ text }: { text: string }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // --- 1. Create a clean, plain-text version of the message for animation ---
  const plainText = useMemo(() => {
    // This regex removes common markdown characters like *, _, #, `, [, ], (, )
    // to prevent them from showing during the animation.
    return text.replace(/[*_#`[\]()]/g, "");
  }, [text]);

  // When the text content changes, reset the animation state
  useEffect(() => {
    setAnimationComplete(false);
  }, [text]);

  return (
    <AnimatePresence mode="wait">
      {!animationComplete ? (
        <motion.div
          key="animating"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* <TextGenerateEffect
              // --- 2. Animate the CLEAN text ---
              words={plainText}
              onAnimationComplete={() => setAnimationComplete(true)}
            /> */}
        </motion.div>
      ) : (
        <motion.div
          key="formatted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
        >
          {/* --- 3. Display the ORIGINAL text with formatting --- */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedMarkdownMessage;

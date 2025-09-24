"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// This is the corrected, simplified component.
// It removes the complex state logic that was preventing rendering.
const AnimatedMarkdownMessage = ({ text }: { text: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="prose prose-slate max-w-none prose-p:leading-relaxed"
    >
      {/* This now directly renders the markdown text.
        It's clean, reliable, and provides a smooth fade-in effect.
      */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </motion.div>
  );
};

export default AnimatedMarkdownMessage;
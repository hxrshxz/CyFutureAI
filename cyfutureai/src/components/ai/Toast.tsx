import { motion } from "framer-motion";
import { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

const Toast = ({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: string;
  onDismiss: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-slate-800";
  const Icon =
    type === "success" ? CheckCircle : type === "error" ? AlertTriangle : Info;
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-4 rounded-lg shadow-2xl text-white ${bgColor}`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-lg font-medium">{message}</span>
    </motion.div>
  );
};

export default Toast;

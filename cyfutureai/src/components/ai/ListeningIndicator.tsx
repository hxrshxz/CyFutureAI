import { Mic } from "lucide-react";

const ListeningIndicator = () => {
  return (
    <div className="fixed bottom-24 right-24 z-50 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping"></div>
        <div className="relative rounded-full bg-green-600 p-4 flex items-center justify-center shadow-lg">
          <Mic className="h-6 w-6 text-white" />
        </div>
      </div>
      <span className="ml-3 font-medium text-green-600 bg-white/80 px-3 py-1 rounded-full shadow-sm">
        Listening...
      </span>
    </div>
  );
};

export default ListeningIndicator;

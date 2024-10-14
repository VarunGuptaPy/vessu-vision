import React from "react";
import { Zap } from "lucide-react";

interface ModelSelectorProps {
  model: "llama" | "claude";
  setModel: (model: "llama" | "claude") => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ model, setModel }) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setModel(model === "llama" ? "claude" : "llama")}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300 ${
          model === "llama"
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        <Zap size={16} />
        <span>{model === "claude" ? "Claude" : "Llama"}</span>
      </button>
    </div>
  );
};

export default ModelSelector;

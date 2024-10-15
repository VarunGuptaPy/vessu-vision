import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchPage from "./components/SearchPage";
import ResultsPage from "./components/ResultsPage";
import ResultsProPage from "./components/ResultsProPage";
import ModelSelector from "./components/ModelSelector";
import "katex/dist/katex.min.css";
import PricingPage from "./components/PricingPage";

function App() {
  const [model, setModel] = useState<"claude" | "llama">("claude");

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <ModelSelector model={model} setModel={setModel} />
        <Routes>
          <Route path="/" element={<SearchPage model={model} />} />
          <Route
            path="/results"
            element={<ResultsPage model={model} setModel={setModel} />}
          />
          <Route path="/pricing-page" element={<PricingPage />} />
          <Route
            path="/pro-results"
            element={<ResultsProPage model={model} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

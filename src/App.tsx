import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import SearchPage from './components/SearchPage'
import ResultsPage from './components/ResultsPage'
import ResultsProPage from './components/ResultsProPage'
import ModelSelector from './components/ModelSelector'
import 'katex/dist/katex.min.css'

function App() {
  const [model, setModel] = useState<'llama' | 'claude'>('llama')

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <ModelSelector model={model} setModel={setModel} />
        <Routes>
          <Route path="/" element={<SearchPage model={model} />} />
          <Route path="/results" element={<ResultsPage model={model} />} />
          <Route path="/pro-results" element={<ResultsProPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
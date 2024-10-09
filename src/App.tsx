import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import SearchPage from './components/SearchPage'
import ResultsPage from './components/ResultsPage'
import 'katex/dist/katex.min.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
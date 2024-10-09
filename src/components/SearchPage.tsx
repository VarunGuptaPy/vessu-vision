import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Zap, X } from 'lucide-react'

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [showProPopup, setShowProPopup] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/results?q=${encodeURIComponent(query)}`)
    }
  }

  const showProComingSoon = () => {
    setShowProPopup(true)
    setTimeout(() => setShowProPopup(false), 3000)
  }

  const inspirationTopics = [
    "Latest AI breakthroughs",
    "Gaganyaan mission updates",
    "ChatGPT canvas features",
    "HelpingAI by Abhay Koul"
  ]

  const handleInspirationClick = (topic: string) => {
    setQuery(topic)
    handleSearch({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-teal-300 via-blue-400 to-purple-400 text-transparent bg-clip-text animate-gradient">Vessu Vision</h1>
        <form onSubmit={handleSearch} className="w-full mb-8 relative">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What will you discover today?"
              className="w-full bg-slate-800 text-white border-2 border-slate-700 rounded-full py-4 px-6 pr-32 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300 group-hover:border-teal-400"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={showProComingSoon}
                className="flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300 bg-slate-700 text-slate-300 hover:bg-teal-500 hover:text-white"
              >
                <Zap size={16} />
                <span>Pro</span>
              </button>
              <button type="submit" className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full p-2 transition duration-300 shadow-lg">
                <Search size={20} />
              </button>
            </div>
          </div>
        </form>
        {showProPopup && (
          <div className="fixed top-4 right-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center">
            <span className="mr-2">Pro mode coming soon!</span>
            <button onClick={() => setShowProPopup(false)} className="text-white hover:text-slate-200">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="mt-8">
          <p className="text-slate-100 mb-4 text-lg font-semibold">Need some inspiration? Discover these:</p>
          <div className="grid grid-cols-2 gap-4">
            {inspirationTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleInspirationClick(topic)}
                className="bg-gradient-to-r from-teal-400 to-blue-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
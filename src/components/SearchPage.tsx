import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent | string) => {
    e.preventDefault()
    const searchQuery = typeof e === 'string' ? e : query
    if (searchQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const inspirationTopics = [
    "AI breakthroughs",
    "Space exploration",
    "Quantum computing",
    "Renewable energy"
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Discover Alpha</h1>
      <form onSubmit={handleSearch} className="w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What will you discover today?"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-full py-3 px-6 pr-12 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </form>
      <div className="mt-8">
        <h2 className="text-lg mb-4">Need some inspiration? Discover these:</h2>
        <div className="grid grid-cols-2 gap-4">
          {inspirationTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleSearch(topic)}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
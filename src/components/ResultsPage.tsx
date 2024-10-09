import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface SearchResult {
  answer: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds
const TIMEOUT = 60000 // 60 seconds

const fetchWithTimeout = (url: string, options: RequestInit, timeout = TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ]) as Promise<Response>
}

const ResultsPage: React.FC = () => {
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const location = useLocation()
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '')

  const fetchResults = async (retryAttempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchWithTimeout(`https://oevortex-webscout-api.hf.space/api/AI_search_google?q=${encodeURIComponent(query)}&model=gpt-4o-mini&max_results=5&safesearch=moderate&region=wt-wt&max_chars=6000&system_prompt=You%20are%20an%20advanced%20AI%20chatbot.%20Provide%20the%20best%20answer%20to%20the%20user%20based%20on%20Google%20search%20results.`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (!data || !data.answer) {
        throw new Error('Invalid response format')
      }
      setResult(data)
      setRetryCount(0) // Reset retry count on successful fetch
    } catch (error: any) {
      console.error('Error fetching results:', error)
      if (retryAttempt < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryAttempt + 1} of ${MAX_RETRIES}`)
        setTimeout(() => fetchResults(retryAttempt + 1), RETRY_DELAY * (retryAttempt + 1))
        setRetryCount(retryAttempt + 1)
      } else {
        setError(`An error occurred while fetching results: ${error.message}. Please try again later.`)
        setRetryCount(0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [query])

  const formatAnswer = (answer: string) => {
    const formattedAnswer = answer.replace(/(\d+)\.\s+/g, '$1. ')
    return formattedAnswer
      .replace(/\*\*(.*?)\*\*/g, '**$1**')
      .replace(/\*(.*?)\*/g, '*$1*')
  }

  const handleRetry = () => {
    fetchResults()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchResults()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
            <ArrowLeft className="mr-2" size={20} />
            Back to Search
          </Link>
          <h1 className="text-2xl font-bold text-white">Discover Alpha</h1>
        </div>
        <form onSubmit={handleSearch} className="mb-8">
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
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          {loading ? (
            <p className="text-blue-400">Uncovering knowledge... {retryCount > 0 && `(Retry attempt ${retryCount})`}</p>
          ) : error ? (
            <div>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <RefreshCw className="mr-2" size={16} />
                Retry
              </button>
            </div>
          ) : result ? (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{formatAnswer(result.answer)}</ReactMarkdown>
            </div>
          ) : (
            <p>No discoveries found. Try a different query!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
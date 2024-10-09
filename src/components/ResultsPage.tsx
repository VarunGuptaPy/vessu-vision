import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const fetchResults = async (retryAttempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = `https://oevortex-webscout-api.hf.space/api/AI_search_google?q=${encodeURIComponent(query)}&model=gpt-4o-mini&max_results=10&safesearch=moderate&region=wt-wt&max_chars=6000&system_prompt=You%20are%20an%20advanced%20AI%20chatbot.%20Provide%20the%20best%20answer%20to%20the%20user%20based%20on%20Google%20search%20results.`
      console.log(`Fetching results from: ${apiUrl}`)
      
      const response = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (!data || !data.answer) {
        throw new Error('Invalid response format')
      }
      
      setResult(data)
      setRetryCount(0)
    } catch (error: any) {
      console.error('Error fetching results:', error)
      let errorMessage = `An error occurred while fetching results: ${error.message || 'Unknown error'}`
      if (error instanceof TypeError) {
        errorMessage += '. This might be due to a network issue or CORS policy.'
      }
      if (retryAttempt < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryAttempt + 1} of ${MAX_RETRIES}`)
        setTimeout(() => fetchResults(retryAttempt + 1), RETRY_DELAY * (retryAttempt + 1))
        setRetryCount(retryAttempt + 1)
      } else {
        setError(`${errorMessage}. Please try again later.`)
        setRetryCount(0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      fetchResults()
    }
  }, [query])

  const handleRetry = () => {
    fetchResults()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center transition duration-300">
            <ArrowLeft className="mr-2" size={20} />
            Back to Search
          </Link>
        </div>
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              readOnly
              className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-full py-4 px-6 pr-12 focus:outline-none cursor-not-allowed opacity-70 shadow-inner"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Search className="text-gray-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 mb-8 shadow-xl border border-gray-600">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-blue-400 text-lg font-semibold">Uncovering knowledge... {retryCount > 0 && `(Retry attempt ${retryCount})`}</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500 mb-4 text-lg">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition duration-300 flex items-center mx-auto"
              >
                <RefreshCw className="mr-2" size={18} />
                Retry
              </button>
            </div>
          ) : result ? (
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {result.answer}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-center text-lg">No discoveries found. Try a different query!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
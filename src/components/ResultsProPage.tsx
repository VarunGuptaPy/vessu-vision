import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Search, Zap } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'

const ResultsProPage: React.FC = () => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    setResult('')

    try {
      const response = await fetch(`https://abhaykoul-aisearchengineapi.hf.space/v2/search?prompt=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('ReadableStream not supported')
      }

      const decoder = new TextDecoder()
      let markdown = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim()
            if (content && content !== '[DONE]') {
              markdown += formatContent(content) + '\n\n'
            }
          }
        })
        setResult(markdown)
      }
    } catch (error: any) {
      console.error('Error fetching results:', error)
      setError(`An error occurred while fetching results: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content: string): string => {
    // Replace <i></i> with ** for bold in Markdown
    content = content.replace(/<i>(.*?)<\/i>/g, '**$1**')
    
    // Remove 'data:' prefix if present
    content = content.replace(/^data:\s*/, '')

    // Convert <i></i> headers to Markdown headers
    content = content.replace(/<i>(.*?)<\/i>/g, '### $1')

    return content
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
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Zap size={16} />
            <span>Pro</span>
          </div>
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
          {loading && !result && (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-blue-400 text-lg font-semibold">Uncovering advanced knowledge...</p>
            </div>
          )}
          {error && (
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
          )}
          {result && (
            <ReactMarkdown
              className="prose prose-invert prose-lg max-w-none"
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {result}
            </ReactMarkdown>
          )}
          {!loading && !error && !result && (
            <p className="text-center text-lg">No advanced discoveries found. Try a different query!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsProPage
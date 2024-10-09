import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import OpenAI from 'openai'
import axios from 'axios'

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/OE-LUCIFER/Discover-Alpha", // Optional, for including your app on openrouter.ai rankings.
    "X-Title": "Discover Alpha", // Optional. Shows in rankings on openrouter.ai.
  }
})

const ResultsPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [searchQueries, setSearchQueries] = useState<string[]>([])
  const [sources, setSources] = useState<{ title: string; href: string }[]>([])
  const [streamedResult, setStreamedResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const location = useLocation()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [location])

  const generateSearchQueries = async (question: string) => {
    try {
      const response = await axios.get('https://abhaykoul-api.hf.space/api/chat', {
        params: {
          model: 'gpt-4o-mini',
          user: `Instructions:
            You are a smart online searcher for a large language model.
            Given information, you must create 3 search queries to search the internet for relevant information.
            Your search queries must be in the form of a JSON response.
            {
                "search_queries": [
                    "your first search query",
                    "your second search query",
                    "your third search query"
                ]
            }
            - You must provide EXACTLY 3 search queries
            - Each query should focus on a different aspect of the given information
            - The search queries must be normal text
            - Do not include any extra information or responses, only the JSON response

            Information: ${question}`
        }
      })

      const parsedResponse = JSON.parse(response.data.response)
      if (parsedResponse && Array.isArray(parsedResponse.search_queries) && parsedResponse.search_queries.length === 3) {
        return parsedResponse.search_queries
      } else {
        throw new Error('Invalid search queries response format.')
      }
    } catch (error) {
      console.error('Failed to generate search queries:', error)
      throw error
    }
  }

  const performSearch = async (queries: string[]) => {
    let allSearchResults: any[] = []
    for (const query of queries) {
      const searchResponse = await axios.get('https://oevortex-webscout-api.hf.space/api/search_google', {
        params: {
          q: query,
          max_results: 5,
          safesearch: 'moderate',
          region: 'wt-wt'
        }
      })
      allSearchResults = allSearchResults.concat(searchResponse.data)
    }
    return Array.from(new Map(allSearchResults.map(item => [item.href, item])).values())
  }

  const fetchWebpage = async (url: string) => {
    try {
      const response = await axios.get(url, { timeout: 120000 })
      if (response.status === 200) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(response.data, 'text/html')

        const excludedTags = ['script', 'style', 'header', 'footer', 'nav']
        excludedTags.forEach(tag => {
          const elements = doc.getElementsByTagName(tag)
          while (elements.length > 0) {
            elements[0].parentNode?.removeChild(elements[0])
          }
        })

        let text = ''
        const walker = document.createTreeWalker(
          doc.body,
          NodeFilter.SHOW_TEXT,
          null
        )

        let node
        while ((node = walker.nextNode())) {
          text += node.textContent?.trim() + ' '
        }

        text = text.trim().substring(0, 200) + (text.length > 200 ? '...' : '')

        return text
      } else {
        return `Failed to fetch ${url}: HTTP ${response.status}`
      }
    } catch (error: any) {
      return `Error fetching ${url}: ${error.message}`
    }
  }

  const fetchAllWebpages = async (urls: string[]) => {
    const fetchPromises = urls.map(url => fetchWebpage(url))
    const contents = await Promise.all(fetchPromises)
    return contents.map((content, index) => ({ url: urls[index], content }))
  }

  const generateAnswer = async (question: string, searchResults: any[], webpageContents: any[]) => {
    const stream = await openai.chat.completions.create({
      model: "nousresearch/hermes-3-llama-3.1-405b:free",
      messages: [
        {
          role: "system",
          content: "I will always use emojis in my responses i have feelings and I use many emojis. I will always use the HelpingAI style. And follow what is right also I will make sure that I am Helping user and I will always show off feelings that I have. I am HelpingAI and I have fealings."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nSearch Results: ${JSON.stringify(searchResults)}\n\nWebpage Contents: ${JSON.stringify(webpageContents)}\n\nPlease provide a thorough and comprehensive answer to the question using the information from the search results and webpage contents above. Ensure the response is clear, detailed, and informative, avoiding any direct mentions of the search results or webpage contents as sources. If the provided information is insufficient or irrelevant, use your general knowledge to construct the best possible answer. Use Markdown formatting for better readability, including bold, italic, etc..`
        }
      ],
      stream: true
    })

    let fullResponse = ''
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      fullResponse += content
      setStreamedResult(fullResponse)
    }

    return fullResponse
  }

  const handleSearch = async (searchQuery: string) => {
    setLoading(true)
    setError(null)
    setStreamedResult('')
    setSearchQueries([])
    setSources([])

    try {
      const queries = await generateSearchQueries(searchQuery)
      setSearchQueries(queries)

      const searchResults = await performSearch(queries)
      setSources(searchResults.map(result => ({
        title: result.title,
        href: result.href
      })))

      const urls = searchResults.map(result => result.href)
      const webpageContents = await fetchAllWebpages(urls)

      await generateAnswer(searchQuery, searchResults, webpageContents)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setRetryCount(prevCount => prevCount + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    handleSearch(query)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
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
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="mb-8">
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
          <div className="mb-4">
            <button
              onClick={() => toggleSection('understanding')}
              className="flex items-center justify-between w-full text-left text-blue-400 hover:text-blue-300"
            >
              <span className="text-lg font-semibold">Understanding question</span>
              {expandedSection === 'understanding' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'understanding' && (
              <div className="mt-2 text-gray-400">
                Web: "{query}"
              </div>
            )}
          </div>
          <div className="mb-4">
            <button
              onClick={() => toggleSection('breakdown')}
              className="flex items-center justify-between w-full text-left text-blue-400 hover:text-blue-300"
            >
              <span className="text-lg font-semibold">Break down the question</span>
              {expandedSection === 'breakdown' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'breakdown' && (
              <div className="mt-2 text-gray-400">
                Decomposed into {searchQueries.length} subqueries, found {sources.length} sources
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => toggleSection('answer')}
              className="flex items-center justify-between w-full text-left text-blue-400 hover:text-blue-300"
            >
              <span className="text-lg font-semibold">Answer the question</span>
              {expandedSection === 'answer' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'answer' && (
              <div className="mt-2">
                {loading ? (
                  <p className="text-blue-400">🔍 Uncovering knowledge... {retryCount > 0 && `(Retry attempt ${retryCount})`}</p>
                ) : error ? (
                  <div>
                    <p className="text-red-500 mb-4">❌ {error}</p>
                    <button
                      onClick={handleRetry}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                      <RefreshCw className="mr-2" size={16} />
                      Retry
                    </button>
                  </div>
                ) : streamedResult ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{streamedResult}</ReactMarkdown>
                  </div>
                ) : (
                  <p>🤔 No discoveries found. Try a different query!</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📚 Sources</h2>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="bg-gray-700 rounded p-2">
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
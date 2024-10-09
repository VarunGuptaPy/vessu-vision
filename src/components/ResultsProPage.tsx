import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'

const ResultsProPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
            <ArrowLeft className="mr-2" size={20} />
            Back to Search
          </Link>
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Zap size={16} />
            <span>Pro</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 mb-8 shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold mb-4 text-center">Pro Search Coming Soon!</h2>
          <p className="text-center">
            We're working hard to bring you an enhanced search experience with our Pro version.
            Stay tuned for updates and exciting new features!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResultsProPage
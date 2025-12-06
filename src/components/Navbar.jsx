import React from 'react'
import { Link } from 'react-router-dom'
const Navbar = () => {
  return (
          <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              🧠 Brainstorm
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/board" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                <span>🎯</span> Idea Board
              </Link>
              <Link 
                to="/archive" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                <span>📁</span> Archive
              </Link>
            </div>
          </div>
        </div>
      </nav>
  )
}

export default Navbar
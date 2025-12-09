 
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-yellow-100 shadow-lg border-b border-black-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
            <img src="/brainstorm.png" alt="BrainStorm Logo" className="h-8 w-auto" />
            <span>Brainstorm</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/board" 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-bold px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              <span>🎯</span> Idea Board
            </Link>
            <Link 
              to="/archive" 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-bold px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              <span>📁</span> Archive
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-yellow-200 focus:outline-none"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Absolute positioned overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-yellow-100 border-b-2 border-black shadow-lg animate-fadeIn z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-2">
            <Link 
              to="/board" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-bold px-4 py-3 rounded-lg hover:bg-blue-50 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>🎯</span> Idea Board
            </Link>
            <Link 
              to="/archive"
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-bold px-4 py-3 rounded-lg hover:bg-blue-50 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>📁</span> Archive
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
 
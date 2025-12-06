import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useIdeas } from "../context/IdeasContext";

const GridCard = ({ idea }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 hover:border-blue-200 bg-gradient-to-br from-white to-gray-50"
      onClick={() => navigate(`/idea/${idea.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
          {idea.title}
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {idea.description && (
        <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
          {idea.description}
        </p>
      )}
      
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {idea.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              +{idea.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 font-medium">
          {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'Recently'}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/idea/${idea.id}`);
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const ListItem = ({ idea }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-200 bg-gradient-to-r from-white to-gray-50"
      onClick={() => navigate(`/idea/${idea.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
              {idea.title}
            </h3>
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recently'}
            </span>
          </div>
          
          {idea.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {idea.description}
            </p>
          )}
          
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {idea.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200"
                >
                  #{tag}
                </span>
              ))}
              {idea.tags.length > 5 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  +{idea.tags.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-6 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/idea/${idea.id}`);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100"
          >
            View Details
          </button>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function IdeaList() {
  const navigate = useNavigate();
  const { ideas, selectedTag, isLoading: loading } = useIdeas();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filtered = selectedTag
    ? ideas.filter(idea => !idea.archived && idea.tags && idea.tags.includes(selectedTag))
    : ideas.filter(idea => !idea.archived);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="text-8xl mb-6 opacity-60">💡</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {selectedTag ? `No ideas tagged with "${selectedTag}"` : "No ideas yet"}
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            {selectedTag ? "Try selecting a different tag or create a new idea with fresh inspiration." : "Start your creative journey by adding your first brilliant idea!"}
          </p>
          {selectedTag ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('clearTagFilter'))}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Clear Filter
            </button>
          ) : (
            <button
              onClick={() => navigate('/add')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add Your First Idea
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {selectedTag ? (
              <span>
                Ideas tagged with <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">#{selectedTag}</span>
              </span>
            ) : (
              `Your Ideas`
            )}
          </h2>
          <p className="text-gray-600">
            {filtered.length} {filtered.length === 1 ? 'idea' : 'ideas'} found
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Ideas Display */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(idea => (
            <GridCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(idea => (
            <ListItem key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
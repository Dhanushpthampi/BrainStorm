import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useIdeas } from "../context/IdeasContext";

const GridCard = ({ idea }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="bg-white border border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 hover:border-black"
      onClick={() => navigate(`/idea/${idea.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-black transition-colors line-clamp-2 leading-tight">
          {idea.title}
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium border border-gray-300"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
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
          className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 text-black text-sm rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all duration-200 font-bold opacity-0 group-hover:opacity-100"
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
      className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-black"
      onClick={() => navigate(`/idea/${idea.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-black transition-colors truncate">
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
                  className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium border border-gray-300"
                >
                  #{tag}
                </span>
              ))}
              {idea.tags.length > 5 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
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
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 text-black text-sm rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all duration-200 font-bold opacity-0 group-hover:opacity-100"
          >
            View Details
          </button>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-400 text-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all duration-200 font-bold"
            >
              Clear Filter
            </button>
          ) : (
            <button
              onClick={() => navigate('/add')}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-400 text-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all duration-200 font-bold"
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
                Ideas tagged with <span className="text-black bg-yellow-200 px-2 py-1 rounded-lg border border-black">#{selectedTag}</span>
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
        <div className="flex items-center bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-bold ${
              viewMode === 'grid'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-bold ${
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
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
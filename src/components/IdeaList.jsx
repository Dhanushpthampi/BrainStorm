import { useEffect, useState } from "react";
import { getIdeas } from "../utils/localStorageUtils";
import { useNavigate } from "react-router-dom"; 

export default function IdeaList({ selectedTag, refreshKey }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdeas = () => {
      try {
        setLoading(true);
        const data = getIdeas().filter(idea => !idea.archived);
        setIdeas(data);
      } catch (error) {
        console.error('Error loading ideas:', error);
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, [refreshKey]); // Re-run when refreshKey changes

  const filtered = selectedTag
    ? ideas.filter(idea => idea.tags && idea.tags.includes(selectedTag))
    : ideas;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {selectedTag ? `No ideas tagged with "${selectedTag}"` : "No ideas yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedTag ? "Try selecting a different tag or create a new idea." : "Start brainstorming by adding your first idea!"}
          </p>
          {selectedTag && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('clearTagFilter'))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedTag ? (
            <span>
              Ideas tagged with <span className="text-blue-600">#{selectedTag}</span>
            </span>
          ) : (
            `Your Ideas (${filtered.length})`
          )}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(idea => (
          <div 
            key={idea.id} 
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            onClick={() => navigate(`/idea/${idea.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {idea.title}
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {idea.description}
            </p>
            
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {idea.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {idea.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{idea.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'Recently'}
              </span>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/idea/${idea.id}`);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
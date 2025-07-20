import { getIdeas } from "../utils/localStorageUtils";
import { useEffect, useState } from "react";

export default function TagFilter({ onTagSelect, refreshKey }) {
  const [tags, setTags] = useState([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const loadTags = () => {
      try {
        const ideas = getIdeas().filter(i => !i.archived);
        const allTags = [...new Set(ideas.flatMap(idea => idea.tags || []))];
        setTags(allTags.sort());
      } catch (error) {
        console.error('Error loading tags:', error);
        setTags([]);
      }
    };

    loadTags();
  }, [refreshKey]); // Re-run when refreshKey changes

  // Listen for clear filter events
  useEffect(() => {
    const handleClearFilter = () => {
      setActive("");
      onTagSelect("");
    };

    window.addEventListener('clearTagFilter', handleClearFilter);
    return () => window.removeEventListener('clearTagFilter', handleClearFilter);
  }, [onTagSelect]);

  const handleClick = (tag) => {
    const next = tag === active ? "" : tag;
    setActive(next);
    onTagSelect(next);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🏷️ Filter by Tags
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleClick("")}
            className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-200 ${
              active === "" 
                ? 'bg-gray-800 text-white border-gray-800' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            All Ideas
          </button>
          
          {tags.map(tag => (
            <button 
              key={tag}
              onClick={() => handleClick(tag)}
              className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-200 ${
                active === tag 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
        
        {active && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Showing ideas tagged with <strong>#{active}</strong>
              <button 
                onClick={() => handleClick("")}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear filter
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
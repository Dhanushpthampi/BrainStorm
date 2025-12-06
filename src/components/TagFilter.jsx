import { useEffect, useState, useMemo } from "react";
import { useIdeas } from "../context/IdeasContext";

export default function TagFilter() {
  const { ideas, selectedTag, setSelectedTag } = useIdeas();
  
  // Calculate tags from ideas
  const tags = useMemo(() => {
    const activeIdeas = ideas.filter(i => !i.archived);
    
    // Collect all tags and normalize to lowercase
    const allTags = activeIdeas.reduce((tagSet, idea) => {
      if (idea.tags && Array.isArray(idea.tags)) {
        idea.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            // Normalize to lowercase and trim whitespace
            const normalizedTag = tag.toLowerCase().trim();
            if (normalizedTag) {
              tagSet.add(normalizedTag);
            }
          }
        });
      }
      return tagSet;
    }, new Set());
    
    // Convert Set to sorted array
    return Array.from(allTags).sort();
  }, [ideas]);

  // Listen for clear filter events
  useEffect(() => {
    const handleClearFilter = () => {
      setSelectedTag("");
    };

    window.addEventListener('clearTagFilter', handleClearFilter);
    return () => window.removeEventListener('clearTagFilter', handleClearFilter);
  }, [setSelectedTag]);

  const handleClick = (tag) => {
    const next = tag === selectedTag ? "" : tag;
    setSelectedTag(next);
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
              selectedTag === "" 
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
                selectedTag === tag 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
        
        {selectedTag && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Showing ideas tagged with <strong>#{selectedTag}</strong>
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
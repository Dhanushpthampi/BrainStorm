import { useState, useEffect } from 'react';
import MapManager from './MapManager';

export default function Sidebar({ ideas, onDragStart, onMapChange }) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Listen for custom events from IdeaCard when dragging
  useEffect(() => {
    const handleCardDragOver = (e) => {
      if (e.detail.isOverSidebar) {
        setIsDragOver(true);
      } else {
        setIsDragOver(false);
      }
    };

    const handleCardDragEnd = () => {
      setIsDragOver(false);
    };

    // Listen for custom events from IdeaCard
    window.addEventListener('ideaCardDragOver', handleCardDragOver);
    window.addEventListener('ideaCardDragEnd', handleCardDragEnd);

    return () => {
      window.removeEventListener('ideaCardDragOver', handleCardDragOver);
      window.removeEventListener('ideaCardDragEnd', handleCardDragEnd);
    };
  }, []);

  // Filter ideas that are not placed on canvas (no x,y coordinates)
  const sidebarIdeas = ideas.filter(idea => 
    (idea.x === undefined || idea.x === null) && 
    (idea.y === undefined || idea.y === null) && 
    !idea.archived
  );

  return (
    <div className={`sidebar-container w-[320px] h-screen overflow-y-auto bg-white shadow-lg p-4 relative transition-all duration-200 ${
      isDragOver ? 'bg-blue-50 border-r-4 border-blue-400' : ''
    }`}>
      {/* Drop zone overlay when dragging - only shows when actually dragging a card over sidebar */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center text-blue-700 font-medium">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-lg">Drop here to return card</div>
            <div className="text-sm opacity-75">Release to remove from canvas</div>
          </div>
        </div>
      )}

      {/* Map Manager Section */}
      <div className="mb-4">
        <MapManager onMapChange={onMapChange} />
      </div>

      {/* Ideas Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">💡 Ideas</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {sidebarIdeas.length}
        </span>
      </div>

      {sidebarIdeas.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm">All ideas are on the canvas!</p>
          <p className="text-xs mt-1 opacity-75">Drag cards here to return them</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sidebarIdeas.map((idea) => (
            <div
              key={idea.id}
              draggable
              onDragStart={(e) => onDragStart(e, idea.id)}
              className="border rounded-lg p-3 bg-gray-50 cursor-move hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="text-gray-800 block">{idea.title}</strong>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
                  
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap mt-2 gap-1">
                      {idea.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {idea.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{idea.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-gray-400 group-hover:text-gray-600 ml-2 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage instructions */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-medium mb-1">💡 Tips:</p>
        <p>• Create multiple maps for different projects</p>
        <p>• Drag ideas to canvas to visualize</p>
        <p>• Drag canvas cards back here to return</p>
        <p>• Connect related ideas with links</p>
      </div>
    </div>
  );
}
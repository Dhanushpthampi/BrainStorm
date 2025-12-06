import { useState, useEffect } from 'react';
import MapManager from './MapManager';

export default function Sidebar({ ideas, onDragStart, onMapChange, onCardClick }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed on mobile

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

  const handleSidebarClick = (e) => {
    // Only toggle if clicking the container itself or empty space, not interactive elements
    // And only on mobile (check width or just rely on CSS classes logic)
    if (window.innerWidth < 768) {
      // If clicking a button or card, don't toggle here (handled by their own events)
      if (e.target.closest('button') || e.target.closest('.idea-card-item')) {
        return;
      }
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div 
      onClick={handleSidebarClick}
      className={`sidebar-container transition-all duration-300 ease-in-out h-screen
        ${isCollapsed ? 'w-[10%] min-w-[40px] overflow-hidden' : 'w-[50%] overflow-y-auto'} 
        md:w-[320px] md:overflow-y-auto
        bg-white shadow-lg relative border-r z-20
        ${isDragOver ? 'bg-blue-50 border-blue-400' : ''}
      `}
    >
      {/* Mobile Indicator (Vertical Text or Icon when collapsed) */}
      <div className={`md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="writing-vertical-rl text-gray-400 font-bold tracking-widest text-xs whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
          IDEAS
        </div>
      </div>

      {/* Content Container - Hidden when collapsed on mobile */}
      <div className={`h-full flex flex-col p-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}>
        
        {/* Drop zone overlay when dragging */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center z-50 pointer-events-none rounded-lg">
            <div className="text-center text-blue-700 font-medium">
              <div className="text-4xl mb-2">📋</div>
              <div className="text-lg">Drop here</div>
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
          <div className="space-y-2 pb-20"> {/* Added padding bottom for scrolling */}
            {sidebarIdeas.map((idea) => (
              <div
                key={idea.id}
                draggable
                onDragStart={(e) => onDragStart(e, idea.id)}
                onClick={() => {
                  if (window.innerWidth < 768 && onCardClick) {
                    onCardClick(idea.id);
                    setIsCollapsed(true); // Auto collapse on mobile after selection
                  }
                }}
                className="idea-card-item border rounded-lg p-3 bg-gray-50 cursor-move hover:bg-gray-100 transition-colors group active:bg-blue-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0"> {/* min-w-0 for truncation */}
                    <strong className="text-gray-800 block truncate">{idea.title}</strong>
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage instructions */}
        <div className="mt-auto pt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">💡 Tips:</p>
          <p className="md:hidden">• Tap sidebar to open/close</p>
          <p className="md:hidden">• Tap card to place on canvas</p>
          <p className="hidden md:block">• Drag ideas to canvas</p>
        </div>
      </div>
    </div>
  );
}
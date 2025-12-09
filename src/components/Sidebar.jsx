import { useState, useEffect, useRef } from 'react';
import MapManager from './MapManager';

export default function Sidebar({ ideas, onDragStart, onMapChange, onCardClick }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isDraggingRef = useRef(false);
  const lastIdeasCountRef = useRef(0);
  const dragOverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleCardDragOver = (e) => {
      // Clear any existing timeout
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
      
      if (e.detail.isOverSidebar) {
        setIsDragOver(true);
      } else {
        setIsDragOver(false);
      }
    };

    const handleCardDragEnd = () => {
      // Force clear isDragOver state
      setIsDragOver(false);
      
      // Clear any pending timeout
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
    };

    const handleSidebarDragEnd = () => {
      // Force clear isDragOver state
      setIsDragOver(false);
      
      // Clear any pending timeout
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
    };

    window.addEventListener('ideaCardDragOver', handleCardDragOver);
    window.addEventListener('ideaCardDragEnd', handleCardDragEnd);
    window.addEventListener('sidebarDragEnd', handleSidebarDragEnd);

    return () => {
      window.removeEventListener('ideaCardDragOver', handleCardDragOver);
      window.removeEventListener('ideaCardDragEnd', handleCardDragEnd);
      window.removeEventListener('sidebarDragEnd', handleSidebarDragEnd);
      
      // Cleanup timeout on unmount
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const sidebarCount = (ideas || []).filter(i => 
      (i.x === undefined || i.x === null) && 
      (i.y === undefined || i.y === null) &&
      !i.archived
    ).length;

    if (sidebarCount > lastIdeasCountRef.current) {
      // Force clear isDragOver when a new idea arrives in sidebar
      setIsDragOver(false);
      
      // Also set a timeout as a fallback to ensure state clears
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
      dragOverTimeoutRef.current = setTimeout(() => {
        setIsDragOver(false);
      }, 100);
    }

    lastIdeasCountRef.current = sidebarCount;
  }, [ideas]);

  const sidebarIdeas = (ideas || []).filter(idea => 
    (idea.x === undefined || idea.x === null) && 
    (idea.y === undefined || idea.y === null) && 
    !idea.archived
  );

  const handleSidebarClick = (e) => {
    if (window.innerWidth < 768) {
      if (e.target.closest('button') || e.target.closest('.idea-card-item')) {
        return;
      }
      setIsCollapsed(!isCollapsed);
    }
  };

  const startSidebarDrag = (idea, startX, startY, ev) => {
    if (isDraggingRef.current) return;
    
    ev.stopPropagation();
    
    let hasMoved = false;
    let dragStarted = false;

    const handleMove = (moveEv) => {
      const deltaX = Math.abs(moveEv.clientX - startX);
      const deltaY = Math.abs(moveEv.clientY - startY);

      if (!dragStarted && (deltaX > 5 || deltaY > 5)) {
        dragStarted = true;
        hasMoved = true;
        isDraggingRef.current = true;
      }

      if (dragStarted) {
        window.dispatchEvent(new CustomEvent("sidebarDragMove", {
          detail: {
            id: idea.id,
            x: moveEv.clientX,
            y: moveEv.clientY
          }
        }));
      }
    };

    const handleEnd = () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleEnd);
      document.removeEventListener("pointercancel", handleEnd);

      if (hasMoved && dragStarted) {
        window.dispatchEvent(new CustomEvent("sidebarDragEnd", {
          detail: { id: idea.id }
        }));
      }
      
      isDraggingRef.current = false;
      
      if (!hasMoved && window.innerWidth < 768 && onCardClick) {
        onCardClick(idea.id);
        setIsCollapsed(true);
      }
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleEnd);
    document.addEventListener("pointercancel", handleEnd);
  };

  return (
    <div 
      onClick={handleSidebarClick}
      className={`sidebar-container transition-all duration-300 ease-in-out h-full no-scrollbar
        ${isCollapsed ? 'w-[8%] min-w-[50px] overflow-hidden' : 'w-[50%] max-w-[320px] overflow-y-auto'} 
        md:w-[320px] md:overflow-y-auto
        bg-white shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] absolute md:relative border-r-2 border-black z-20
        ${isDragOver ? 'bg-blue-50 border-blue-400' : ''}
      `}
    >
      <div className={`md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="writing-vertical-rl text-black font-bold tracking-widest text-xs whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
          IDEAS
        </div>
      </div>

      <div className={`h-full flex flex-col p-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}>
        
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center z-50 pointer-events-none rounded-lg border-2 border-blue-500 border-dashed m-2">
            <div className="text-center text-blue-700 font-bold">
              <div className="text-4xl mb-2">📋</div>
              <div className="text-lg">Drop here</div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <MapManager onMapChange={onMapChange} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">💡 Ideas</h3>
          <span className="text-sm font-bold text-black bg-yellow-300 px-2 py-1 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {sidebarIdeas.length}
          </span>
        </div>

        {sidebarIdeas.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm font-bold text-gray-700">All ideas are on the canvas!</p>
            <p className="text-xs mt-1 font-medium">Drag cards here to return them</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {sidebarIdeas.map((idea) => (
              <div
                key={idea.id}
                draggable
                onDragStart={(e) => {
                  if (onDragStart) onDragStart(e, idea.id);
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  startSidebarDrag(idea, e.clientX, e.clientY, e);
                }}
                style={{ touchAction: 'none' }}
                className="idea-card-item border-2 border-black rounded-lg p-3 bg-white cursor-move hover:bg-yellow-50 transition-all group active:bg-yellow-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <strong className="text-black block truncate font-bold">{idea.title}</strong>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2 font-medium">{idea.description}</p>
                    
                    {idea.tags && (
                      <div className="flex flex-wrap mt-2 gap-1">
                        {(Array.isArray(idea.tags) ? idea.tags : (typeof idea.tags === 'string' ? idea.tags.split(',') : []))
                          .filter(t => t && t.trim())
                          .slice(0, 2)
                          .map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-black px-2 py-0.5 rounded-full border border-black font-bold"
                            >
                              #{tag.trim()}
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

        {/* Tips section removed as per user request */}
      </div>
    </div>
  );
}

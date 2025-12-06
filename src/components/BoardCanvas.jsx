import { useEffect, useState, useCallback } from "react";
import IdeaCard from "./IdeaCard";
import { useIdeas } from "../context/IdeasContext";
import useZoomPan from "../hooks/useZoomPan";
import useSelection from "../hooks/useSelection";

export default function BoardCanvas({ ideas, setIdeas, mapId, onCanvasClick }) {
  const { links, addLink, removeLink } = useIdeas();
  const { containerRef, zoom, panOffset, isPanning, zoomIn, zoomOut, reset: resetZoom } = useZoomPan();
  const { selectedIds, toggleSelect, isLinked, setSelectedIds } = useSelection(ideas, links);
  
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Card dimensions
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 100;

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX, screenY) => {
    const canvasX = (screenX - panOffset.x) / zoom;
    const canvasY = (screenY - panOffset.y) / zoom;
    return { x: canvasX, y: canvasY };
  }, [zoom, panOffset]);

  // Function to calculate connection points on card edges
  const getConnectionPoint = (fromCard, toCard) => {
    const fromCenterX = fromCard.x + CARD_WIDTH / 2;
    const fromCenterY = fromCard.y + CARD_HEIGHT / 2;
    const toCenterX = toCard.x + CARD_WIDTH / 2;
    const toCenterY = toCard.y + CARD_HEIGHT / 2;

    const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);
    
    const fromX = fromCenterX + Math.cos(angle) * (CARD_WIDTH / 2);
    const fromY = fromCenterY + Math.sin(angle) * (CARD_HEIGHT / 2);
    
    const toX = toCenterX - Math.cos(angle) * (CARD_WIDTH / 2);
    const toY = toCenterY - Math.sin(angle) * (CARD_HEIGHT / 2);

    return { fromX, fromY, toX, toY };
  };

  const handleSelect = (id) => {
    toggleSelect(id);
  };

  // Handle showing/hiding popup when 2 cards are selected
  useEffect(() => {
    if (selectedIds.length === 2) {
      const [id1, id2] = selectedIds;
      const idea1 = ideas.find(idea => idea.id === id1);
      const idea2 = ideas.find(idea => idea.id === id2);
      
      if (idea1 && idea2 && idea1.x !== undefined && idea2.x !== undefined) {
        const midCanvasX = (idea1.x + idea2.x) / 2 + 100;
        const midCanvasY = (idea1.y + idea2.y) / 2 + 40;
        const midScreenX = midCanvasX * zoom + panOffset.x;
        const midScreenY = midCanvasY * zoom + panOffset.y;
        
        setPopupPosition({ x: midScreenX, y: midScreenY });
        setShowLinkPopup(true);
      }
    } else {
      setShowLinkPopup(false);
    }
  }, [selectedIds, ideas, zoom, panOffset]);

  const handleCreateLink = () => {
    if (selectedIds.length === 2) {
      const [from, to] = selectedIds;
      addLink(from, to);
      setSelectedIds([]);
      setShowLinkPopup(false);
    }
  };

  const handleRemoveLink = () => {
    if (selectedIds.length === 2) {
      const [id1, id2] = selectedIds;
      removeLink(id1, id2);
      setSelectedIds([]);
      setShowLinkPopup(false);
    }
  };

  const handleRemoveLinkFromDot = (link) => {
    removeLink(link.from, link.to);
  };

  // Enhanced drag handler
  const handleDrag = useCallback((newX, newY, id, isOverSidebar = false, isCanvasCoords = false) => {
    if (isOverSidebar) {
      setIdeas((prevIdeas) => 
        prevIdeas.map((idea) =>
          idea.id === id 
            ? { ...idea, x: undefined, y: undefined }
            : idea
        )
      );
      
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));

      // Remove all links connected to this idea
      const connectedLinks = links.filter(link => link.from === id || link.to === id);
      connectedLinks.forEach(link => {
        removeLink(link.from, link.to);
      });
      
    } else {
      let canvasX, canvasY;
      
      if (isCanvasCoords) {
        canvasX = newX;
        canvasY = newY;
      } else {
        const canvasCoords = screenToCanvas(newX, newY);
        canvasX = canvasCoords.x;
        canvasY = canvasCoords.y;
      }

      setIdeas((prevIdeas) => 
        prevIdeas.map((idea) =>
          idea.id === id 
            ? { ...idea, x: canvasX, y: canvasY } 
            : idea
        )
      );
    }
  }, [setIdeas, screenToCanvas, setSelectedIds, links, removeLink]);

  // Handle click on empty canvas
  const handleCanvasClickInternal = (e) => {
    if (e.target === e.currentTarget && !isPanning) {
      const rect = e.currentTarget.getBoundingClientRect();
      
      if (onCanvasClick) {
        onCanvasClick(e, rect);
      } else {
        // Fallback placement logic if onCanvasClick not provided
        const screenX = e.clientX - rect.left - 100;
        const screenY = e.clientY - rect.top - 40;
        const canvasCoords = screenToCanvas(screenX, screenY);
        
        const unplacedIdea = ideas.find(idea => 
          (idea.x === undefined || idea.x === null) && 
          !idea.archived
        );
        
        if (unplacedIdea) {
          setIdeas(prev => 
            prev.map(idea => 
              idea.id === unplacedIdea.id 
                ? { ...idea, x: Math.max(0, canvasCoords.x), y: Math.max(0, canvasCoords.y) } 
                : idea
            )
          );
        }
      }
    }
  };

  const getIdeaById = (id) => ideas.find((i) => i.id === id);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLinkPopup && !e.target.closest('.link-popup') && !e.target.closest('.idea-card')) {
        setSelectedIds([]);
        setShowLinkPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLinkPopup, setSelectedIds]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-screen bg-gray-50 overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      onClick={handleCanvasClickInternal}
      style={{
        backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', // Fainter dots (slate-200)
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
      }}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
        <button onClick={zoomIn} className="w-8 h-8 bg-black text-white rounded text-lg font-bold flex items-center justify-center hover:bg-gray-800 transition-colors active:translate-y-0.5">+</button>
        <div className="text-xs text-center font-bold text-gray-800 px-1">{Math.round(zoom * 100)}%</div>
        <button onClick={zoomOut} className="w-8 h-8 bg-black text-white rounded text-lg font-bold flex items-center justify-center hover:bg-gray-800 transition-colors active:translate-y-0.5">−</button>
        <button onClick={resetZoom} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black rounded text-xs font-bold flex items-center justify-center transition-colors active:translate-y-0.5">⌂</button>
      </div>

      {/* Canvas Content */}
      <div 
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%'
        }}
      >
        {/* Links */}
        <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-visible">
          {links.map((link, idx) => {
            const from = getIdeaById(link.from);
            const to = getIdeaById(link.to);
            
            if (!from || !to || from.x === undefined || to.x === undefined) return null;
            
            const { fromX, fromY, toX, toY } = getConnectionPoint(from, to);
            
            return (
              <g key={`${link.from}-${link.to}-${idx}`}>
                <line x1={fromX} y1={fromY} x2={toX} y2={toY} stroke="#000000" strokeWidth="2" strokeOpacity="0.8" markerEnd="url(#arrowhead)" />
                <circle
                  cx={(fromX + toX) / 2}
                  cy={(fromY + toY) / 2}
                  r="10"
                  fill="#ef4444"
                  fillOpacity="1"
                  className="cursor-pointer pointer-events-auto hover:fill-red-600 transition-colors"
                  onClick={() => handleRemoveLinkFromDot(link)}
                  title="Click to remove link"
                />
                <text x={(fromX + toX) / 2} y={(fromY + toY) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="white" fontWeight="bold" className="pointer-events-none">✕</text>
              </g>
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#000000" fillOpacity="0.8" />
            </marker>
          </defs>
        </svg>

        {/* Ideas */}
        {ideas
          .filter((idea) => idea.x !== undefined && idea.y !== undefined)
          .map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isSelected={selectedIds.includes(idea.id)}
              onSelect={handleSelect}
              onDrag={handleDrag}
              zoom={zoom}
            />
          ))}
      </div>

      {/* Link Popup */}
      {showLinkPopup && (
        <div
          className="link-popup absolute z-50 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3"
          style={{ left: popupPosition.x - 60, top: popupPosition.y - 50, transform: 'translateX(-50%)' }}
        >
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800 mb-2">{selectedIds.length} cards selected</p>
            {isLinked ? (
              <button onClick={handleRemoveLink} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all">🔗 Unlink Cards</button>
            ) : (
              <button onClick={handleCreateLink} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all">🔗 Link Cards</button>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 p-3 text-sm bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-gray-800 max-w-xs">
        <p className="font-bold mb-1">How to use:</p>
        <p>• Drag cards from sidebar to canvas</p>
        <p>• Select 2 cards to link/unlink</p>
        <p>• <span className="font-bold text-blue-600">Drag over sidebar to remove</span></p>
        <p>• <span className="font-bold text-green-600">Ctrl + Scroll to zoom, Alt + Drag to pan</span></p>
      </div>
    </div>
  );
}
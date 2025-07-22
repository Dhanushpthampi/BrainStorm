import { useEffect, useRef, useState, useCallback } from "react";
import { getLinks, saveLinks } from "../utils/localStorageUtils";
import IdeaCard from "./IdeaCard";

export default function BoardCanvas({ ideas, setIdeas, mapId, onCanvasClick }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isLinked, setIsLinked] = useState(false);
  
  // Zoom functionality state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);

  // Card dimensions - adjust these if your cards have different sizes
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 100; // Approximate height, adjust as needed

  // Zoom constraints
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;
  const ZOOM_SENSITIVITY = 0.001;

  // Function to calculate connection points on card edges
  const getConnectionPoint = (fromCard, toCard) => {
    const fromCenterX = fromCard.x + CARD_WIDTH / 2;
    const fromCenterY = fromCard.y + CARD_HEIGHT / 2;
    const toCenterX = toCard.x + CARD_WIDTH / 2;
    const toCenterY = toCard.y + CARD_HEIGHT / 2;

    // Calculate angle between card centers
    const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);
    
    // Calculate connection points on card edges
    const fromX = fromCenterX + Math.cos(angle) * (CARD_WIDTH / 2);
    const fromY = fromCenterY + Math.sin(angle) * (CARD_HEIGHT / 2);
    
    const toX = toCenterX - Math.cos(angle) * (CARD_WIDTH / 2);
    const toY = toCenterY - Math.sin(angle) * (CARD_HEIGHT / 2);

    return { fromX, fromY, toX, toY };
  };

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate zoom
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const newZoom = Math.min(Math.max(zoom + delta, MIN_ZOOM), MAX_ZOOM);
      
      if (newZoom !== zoom) {
        // Calculate new pan offset to zoom toward mouse position
        const zoomFactor = newZoom / zoom;
        const newPanX = mouseX - (mouseX - panOffset.x) * zoomFactor;
        const newPanY = mouseY - (mouseY - panOffset.y) * zoomFactor;
        
        setZoom(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
      }
    }
  }, [zoom, panOffset]);

  // Handle panning
  const handleMouseDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt + left mouse
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add event listeners for zoom and pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Zoom control functions
  const zoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, MAX_ZOOM);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, MIN_ZOOM);
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX, screenY) => {
    const canvasX = (screenX - panOffset.x) / zoom;
    const canvasY = (screenY - panOffset.y) / zoom;
    return { x: canvasX, y: canvasY };
  };

  // Load links from localStorage on mount and when mapId changes
  const loadLinks = useCallback(() => {
    try {
      setIsLoadingLinks(true);
      const savedLinks = getLinks();
      console.log('Loading links:', savedLinks);
      setLinks(Array.isArray(savedLinks) ? savedLinks : []);
    } catch (error) {
      console.error('Error loading links:', error);
      setLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  // Initial load of links
  useEffect(() => {
    loadLinks();
  }, [loadLinks, mapId]);

  // Persist links to localStorage whenever links change
  useEffect(() => {
    if (isLoadingLinks) return;
    
    try {
      console.log('Saving links:', links);
      saveLinks(links);
      window.dispatchEvent(new CustomEvent('linksUpdated', { detail: links }));
    } catch (error) {
      console.error('Error saving links:', error);
    }
  }, [links, isLoadingLinks]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const onStorageChange = () => {
      console.log('Storage changed, reloading links...');
      loadLinks();
    };
    
    const onLinksUpdate = (event) => {
      console.log('Links updated event received:', event.detail);
      if (event.detail && Array.isArray(event.detail)) {
        setLinks(event.detail);
      }
    };
    
    window.addEventListener("storage", onStorageChange);
    window.addEventListener("linksUpdated", onLinksUpdate);
    
    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("linksUpdated", onLinksUpdate);
    };
  }, [loadLinks]);

  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      let newSelection;
      if (prev.includes(id)) {
        newSelection = prev.filter((i) => i !== id);
      } else {
        newSelection = [...prev, id];
        if (newSelection.length > 2) {
          newSelection = newSelection.slice(-2);
        }
      }
      return newSelection;
    });
  };

  // Handle showing/hiding popup when 2 cards are selected
  useEffect(() => {
    if (selectedIds.length === 2) {
      const [id1, id2] = selectedIds;
      const idea1 = ideas.find(idea => idea.id === id1);
      const idea2 = ideas.find(idea => idea.id === id2);
      
      if (idea1 && idea2 && idea1.x !== undefined && idea2.x !== undefined) {
        // Convert canvas coordinates to screen coordinates for popup positioning
        const midCanvasX = (idea1.x + idea2.x) / 2 + 100;
        const midCanvasY = (idea1.y + idea2.y) / 2 + 40;
        const midScreenX = midCanvasX * zoom + panOffset.x;
        const midScreenY = midCanvasY * zoom + panOffset.y;
        
        setPopupPosition({ x: midScreenX, y: midScreenY });
        
        const linkExists = links.some(l => 
          (l.from === id1 && l.to === id2) || (l.from === id2 && l.to === id1)
        );
        setIsLinked(linkExists);
        setShowLinkPopup(true);
      }
    } else {
      setShowLinkPopup(false);
    }
  }, [selectedIds, ideas, links, zoom, panOffset]);

  const handleCreateLink = () => {
    if (selectedIds.length === 2) {
      const [from, to] = selectedIds;
      console.log('Creating link between:', from, 'and', to);
      setLinks(prevLinks => [...prevLinks, { from, to }]);
      setSelectedIds([]);
      setShowLinkPopup(false);
    }
  };

  const handleRemoveLink = () => {
    if (selectedIds.length === 2) {
      const [id1, id2] = selectedIds;
      console.log('Removing link between:', id1, 'and', id2);
      setLinks(prevLinks => 
        prevLinks.filter(link => 
          !(link.from === id1 && link.to === id2) && 
          !(link.from === id2 && link.to === id1)
        )
      );
      setSelectedIds([]);
      setShowLinkPopup(false);
    }
  };

  // Enhanced drag handler that detects sidebar drop zone
  const handleDrag = useCallback((newX, newY, id, isOverSidebar = false) => {
    console.log(`Dragging idea ${id} to (${newX}, ${newY}), over sidebar: ${isOverSidebar}`);
    
    // Only return to sidebar if explicitly over the sidebar area
    if (isOverSidebar) {
      // Return card to sidebar by removing its position
      console.log(`Returning card ${id} to sidebar`);
      setIdeas((prevIdeas) => {
        if (!Array.isArray(prevIdeas)) {
          console.error('prevIdeas is not an array:', prevIdeas);
          return prevIdeas;
        }
        
        return prevIdeas.map((idea) =>
          idea.id === id 
            ? { ...idea, x: undefined, y: undefined }
            : idea
        );
      });
      
      // Remove any links connected to this card
      setLinks(prevLinks => 
        prevLinks.filter(link => link.from !== id && link.to !== id)
      );
      
      // Remove from selection if selected
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      
    } else {
      // Normal drag behavior - convert screen coordinates to canvas coordinates
      const canvasCoords = screenToCanvas(newX, newY);
      setIdeas((prevIdeas) => {
        if (!Array.isArray(prevIdeas)) {
          console.error('prevIdeas is not an array:', prevIdeas);
          return prevIdeas;
        }
        
        return prevIdeas.map((idea) =>
          idea.id === id 
            ? { ...idea, x: canvasCoords.x, y: canvasCoords.y } 
            : idea
        );
      });
    }
  }, [setIdeas, setLinks, zoom, panOffset]);

  // Handle click on empty canvas to place cards
  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget && !isPanning) {
      const rect = e.currentTarget.getBoundingClientRect();
      
      if (onCanvasClick) {
        onCanvasClick(e, rect);
      } else {
        const screenX = e.clientX - rect.left - 100;
        const screenY = e.clientY - rect.top - 40;
        const canvasCoords = screenToCanvas(screenX, screenY);
        
        const unplacedIdea = ideas.find(idea => 
          (idea.x === undefined || idea.x === null) && 
          (idea.y === undefined || idea.y === null) && 
          !idea.archived
        );
        
        if (unplacedIdea) {
          console.log(`Placing idea ${unplacedIdea.id} at (${Math.max(0, canvasCoords.x)}, ${Math.max(0, canvasCoords.y)})`);
          setIdeas(prev => {
            if (!Array.isArray(prev)) {
              console.error('prev is not an array in handleCanvasClick:', prev);
              return prev;
            }
            
            return prev.map(idea => 
              idea.id === unplacedIdea.id 
                ? { ...idea, x: Math.max(0, canvasCoords.x), y: Math.max(0, canvasCoords.y) } 
                : idea
            );
          });
        }
      }
    }
  };

  const getIdeaById = (id) => ideas.find((i) => i.id === id);

  const handleRemoveLinkFromDot = (linkIndex) => {
    console.log('Removing link at index:', linkIndex);
    setLinks(prevLinks => {
      const newLinks = prevLinks.filter((_, index) => index !== linkIndex);
      console.log('New links after removal:', newLinks);
      return newLinks;
    });
  };

  // Clean up links that reference non-existent ideas
  useEffect(() => {
    if (isLoadingLinks || ideas.length === 0) return;
    
    const ideaIds = new Set(ideas.map(idea => idea.id));
    const validLinks = links.filter(link => 
      ideaIds.has(link.from) && ideaIds.has(link.to)
    );
    
    if (validLinks.length !== links.length) {
      console.log('Cleaning up invalid links. Before:', links.length, 'After:', validLinks.length);
      setLinks(validLinks);
    }
  }, [ideas, links, isLoadingLinks]);

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
  }, [showLinkPopup]);

  // Validate ideas prop
  if (!Array.isArray(ideas)) {
    console.error('Ideas prop is not an array:', ideas);
    return (
      <div className="relative w-full h-screen bg-gray-100 overflow-hidden flex items-center justify-center">
        <div className="text-red-600">Error: Invalid ideas data</div>
      </div>
    );
  }

  if (isLoadingLinks) {
    return (
      <div className="relative w-full h-screen bg-gray-100 overflow-hidden flex items-center justify-center">
        <div className="text-gray-600">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-screen bg-gray-100 overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      onClick={handleCanvasClick}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white rounded-lg shadow-lg border p-2">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded text-lg font-bold flex items-center justify-center transition-colors"
          title="Zoom In (Ctrl + Scroll)"
        >
          +
        </button>
        <div className="text-xs text-center text-gray-600 px-1">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded text-lg font-bold flex items-center justify-center transition-colors"
          title="Zoom Out (Ctrl + Scroll)"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-bold flex items-center justify-center transition-colors"
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      {/* Canvas Content with Transform */}
      <div 
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Links with edge connections */}
        <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          {links.map((link, idx) => {
            const from = getIdeaById(link.from);
            const to = getIdeaById(link.to);
            
            if (!from || !to || from.x === undefined || to.x === undefined) {
              console.warn('Invalid link found:', link, 'from:', from, 'to:', to);
              return null;
            }
            
            // Get edge connection points
            const { fromX, fromY, toX, toY } = getConnectionPoint(from, to);
            
            return (
              <g key={`${link.from}-${link.to}-${idx}`}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#374151"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  markerEnd="url(#arrowhead)"
                />
                {/* Clickable area for removing links */}
                <circle
                  cx={(fromX + toX) / 2}
                  cy={(fromY + toY) / 2}
                  r="10"
                  fill="red"
                  fillOpacity="0.7"
                  className="cursor-pointer pointer-events-auto hover:fill-opacity-90"
                  onClick={() => handleRemoveLinkFromDot(idx)}
                  title="Click to remove link"
                />
                <text
                  x={(fromX + toX) / 2}
                  y={(fromY + toY) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="white"
                  className="pointer-events-none"
                >
                  ✕
                </text>
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#374151"
                fillOpacity="0.6"
              />
            </marker>
          </defs>
        </svg>

        {/* Render all ideas that have positions */}
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

      {/* Link/Unlink Popup */}
      {showLinkPopup && (
        <div
          className="link-popup absolute z-50 bg-white rounded-lg shadow-lg border-2 border-gray-200 p-3"
          style={{
            left: popupPosition.x - 60,
            top: popupPosition.y - 50,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {selectedIds.length} cards selected
            </p>
            {isLinked ? (
              <button
                onClick={handleRemoveLink}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔗 Unlink Cards
              </button>
            ) : (
              <button
                onClick={handleCreateLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔗 Link Cards
              </button>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 p-3 text-sm bg-white rounded-lg shadow-md text-gray-600 max-w-xs">
        <p className="font-medium mb-1">How to use:</p>
        <p>• Drag cards from sidebar to canvas to place them</p>
        <p>• Click cards to select them</p>
        <p>• Select 2 cards to show link/unlink button</p>
        <p>• Drag cards to move them around</p>
        <p>• <span className="font-medium text-blue-600">Drag cards over sidebar to return them</span></p>
        <p>• Click red ✕ on links to remove them</p>
        <p>• <span className="font-medium text-green-600">Ctrl + Scroll to zoom, Alt + Drag to pan</span></p>
        
        {selectedIds.length > 0 && (
          <p className="mt-2 text-blue-600 font-medium">
            {selectedIds.length} card{selectedIds.length > 1 ? 's' : ''} selected
          </p>
        )}
        
        <div className="mt-2 text-xs text-gray-400 border-t pt-2">
          <div>Links: {links.length}</div>
          <div>Canvas Ideas: {ideas.filter(i => i.x !== undefined && i.y !== undefined).length}</div>
          <div>Zoom: {Math.round(zoom * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
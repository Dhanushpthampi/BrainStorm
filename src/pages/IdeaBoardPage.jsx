
import Sidebar from "../components/Sidebar";
import BoardCanvas from "../components/BoardCanvas";
import { useIdeas } from "../context/IdeasContext";
import { useState, useEffect } from "react";

export default function IdeaBoardPage() {
  const { ideas, setIdeas, isLoading } = useIdeas();
  const mapId = "default-map";
  const [draggingFromSidebar, setDraggingFromSidebar] = useState(null);

  // Listen for sidebar drag events
  useEffect(() => {
    const handleSidebarDragMove = (e) => {
      setDraggingFromSidebar({
        id: e.detail.id,
        x: e.detail.x,
        y: e.detail.y
      });
    };

    const handleSidebarDragEnd = (e) => {
      if (draggingFromSidebar) {
        // Get canvas container bounds
        const canvasContainer = document.querySelector('.board-canvas-container');
        if (canvasContainer) {
          const rect = canvasContainer.getBoundingClientRect();
          const isOverCanvas = draggingFromSidebar.x >= rect.left && 
                              draggingFromSidebar.x <= rect.right &&
                              draggingFromSidebar.y >= rect.top && 
                              draggingFromSidebar.y <= rect.bottom;
          
          if (isOverCanvas) {
            // Convert to canvas coordinates
            const x = Math.max(0, draggingFromSidebar.x - rect.left - 100);
            const y = Math.max(0, draggingFromSidebar.y - rect.top - 30);
            
            setIdeas(prev => 
              prev.map(idea => 
                idea.id === e.detail.id 
                  ? { ...idea, x, y } 
                  : idea
              )
            );
          }
        }
      }
      setDraggingFromSidebar(null);
    };

    window.addEventListener('sidebarDragMove', handleSidebarDragMove);
    window.addEventListener('sidebarDragEnd', handleSidebarDragEnd);

    return () => {
      window.removeEventListener('sidebarDragMove', handleSidebarDragMove);
      window.removeEventListener('sidebarDragEnd', handleSidebarDragEnd);
    };
  }, [draggingFromSidebar, setIdeas]);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("ideaId");
    
    if (!id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 100);
    const y = Math.max(0, e.clientY - rect.top - 30);

    setIdeas((prev) => {
      return prev.map((idea) =>
        idea.id === id ? { ...idea, x, y } : idea
      );
    });
  };

  const handleCanvasClick = (e, canvasRect) => {
    const x = e.clientX - canvasRect.left - 100;
    const y = e.clientY - canvasRect.top - 40;
    
    const unplacedIdea = ideas.find(idea => 
      (idea.x === undefined || idea.x === null) && 
      (idea.y === undefined || idea.y === null) && 
      !idea.archived
    );
    
    if (unplacedIdea) {
      setIdeas(prev => 
        prev.map(idea => 
          idea.id === unplacedIdea.id 
            ? { ...idea, x: Math.max(0, x), y: Math.max(0, y) } 
            : idea
        )
      );
    }
  };

  const sidebarIdeas = ideas.filter((idea) => 
    (idea.x === undefined || idea.x === null) && 
    (idea.y === undefined || idea.y === null) && 
    !idea.archived
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading ideas...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        ideas={sidebarIdeas}
        onDragStart={(e, id) => {
          e.dataTransfer.setData("ideaId", id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onCardClick={(id) => {
          const x = 150 + Math.random() * 50;
          const y = 150 + Math.random() * 50;
          
          setIdeas(prev => 
            prev.map(idea => 
              idea.id === id 
                ? { ...idea, x, y } 
                : idea
            )
          );
        }}
      />
      <div 
        className="flex-1 relative board-canvas-container"
        onDrop={handleDrop} 
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
      >
        <BoardCanvas
          ideas={ideas}
          setIdeas={setIdeas}
          mapId={mapId}
          onCanvasClick={handleCanvasClick}
        />
        
        {/* Dragging ghost from sidebar */}
        {draggingFromSidebar && (
          <div 
            className="fixed pointer-events-none z-50 bg-white p-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[200px] opacity-90"
            style={{ 
              left: draggingFromSidebar.x - 100, 
              top: draggingFromSidebar.y - 30,
              transform: 'rotate(3deg)'
            }}
          >
            <strong className="text-black block truncate font-bold">
              {ideas.find(i => i.id === draggingFromSidebar.id)?.title}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}


import Sidebar from "../components/Sidebar";
import BoardCanvas from "../components/BoardCanvas";
import { useIdeas } from "../context/IdeasContext";

export default function IdeaBoardPage() {
  const { ideas, setIdeas, isLoading } = useIdeas();
  const mapId = "default-map";

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("ideaId");
    
    if (!id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 100); // Adjust for card width
    const y = Math.max(0, e.clientY - rect.top - 30);   // Adjust for card height

    setIdeas((prev) => {
      return prev.map((idea) =>
        idea.id === id ? { ...idea, x, y } : idea
      );
    });
  };

  // Function to handle placing cards from sidebar onto canvas
  const handleCanvasClick = (e, canvasRect) => {
    const x = e.clientX - canvasRect.left - 100; // Adjust for card width center
    const y = e.clientY - canvasRect.top - 40;   // Adjust for card height center
    
    // Find first idea without position (from sidebar)
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

  // Separate ideas into sidebar (no position) and canvas (with position)
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
          // Place card in center of current view (approximate since we don't have zoom/pan here)
          // We'll place it at a fixed offset for now, user can move it later
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
        className="flex-1 relative"
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
        
        {/* Debug info - remove this in production */}
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow text-xs hidden md:block">
          <div>Total: {ideas.length}</div>
          <div>Sidebar: {sidebarIdeas.length}</div>
          <div>Canvas: {ideas.filter(i => i.x !== undefined && i.y !== undefined && !i.archived).length}</div>
        </div>
      </div>
    </div>
  );
}
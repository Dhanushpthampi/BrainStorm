import { useEffect, useState, useCallback } from "react";
import { getIdeas, updateIdeas } from "../utils/localStorageUtils";
import Sidebar from "../components/Sidebar";
import BoardCanvas from "../components/BoardCanvas";

export default function IdeaBoardPage() {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapId = "default-map";

  // Load ideas with error handling
  const loadIdeas = useCallback(() => {
    try {
      setIsLoading(true);
      const saved = getIdeas();
      console.log('Loaded ideas:', saved); // Debug log
      setIdeas(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error('Error loading ideas:', error);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("ideaId");
    
    if (!id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 100); // Adjust for card width
    const y = Math.max(0, e.clientY - rect.top - 30);   // Adjust for card height

    console.log(`Dropping idea ${id} at position (${x}, ${y})`); // Debug log

    setIdeas((prev) => {
      const updated = prev.map((idea) =>
        idea.id === id ? { ...idea, x, y } : idea
      );
      
      console.log('Updated ideas after drop:', updated); // Debug log
      
      try {
        updateIdeas(updated);
      } catch (error) {
        console.error('Error updating ideas after drop:', error);
      }
      
      return updated;
    });
  };

  // FIXED: Handle both updater functions and direct values
  const handleSetIdeas = useCallback((updatedIdeasOrUpdater) => {
    console.log('Setting ideas:', updatedIdeasOrUpdater); // Debug log
    
    // Check if it's a function (updater) or direct value
    if (typeof updatedIdeasOrUpdater === 'function') {
      // It's an updater function, use it with setIdeas
      setIdeas((prevIdeas) => {
        if (!Array.isArray(prevIdeas)) {
          console.error('Previous ideas is not an array:', prevIdeas);
          return [];
        }
        
        const updated = updatedIdeasOrUpdater(prevIdeas);
        
        if (!Array.isArray(updated)) {
          console.error('Updated ideas is not an array:', updated);
          return prevIdeas;
        }
        
        try {
          updateIdeas(updated);
        } catch (error) {
          console.error('Error saving ideas:', error);
        }
        
        return updated;
      });
    } else {
      // It's a direct value
      if (!Array.isArray(updatedIdeasOrUpdater)) {
        console.error('Invalid ideas data:', updatedIdeasOrUpdater);
        return;
      }
      
      setIdeas(updatedIdeasOrUpdater);
      
      try {
        updateIdeas(updatedIdeasOrUpdater);
      } catch (error) {
        console.error('Error saving ideas:', error);
      }
    }
  }, []);

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
      console.log(`Placing idea ${unplacedIdea.id} at (${Math.max(0, x)}, ${Math.max(0, y)})`);
      handleSetIdeas(prev => 
        prev.map(idea => 
          idea.id === unplacedIdea.id 
            ? { ...idea, x: Math.max(0, x), y: Math.max(0, y) } 
            : idea
        )
      );
    }
  };

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const onStorage = () => {
      console.log('Storage changed, reloading ideas...'); // Debug log
      loadIdeas();
    };
    
    // Listen for both storage events and custom events
    window.addEventListener("storage", onStorage);
    
    // Also listen for custom storage events (for same-tab updates)
    const onCustomStorage = () => {
      setTimeout(loadIdeas, 100); // Small delay to ensure storage is updated
    };
    
    window.addEventListener("storageUpdate", onCustomStorage);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("storageUpdate", onCustomStorage);
    };
  }, [loadIdeas]);

  // Separate ideas into sidebar (no position) and canvas (with position)
  const sidebarIdeas = ideas.filter((idea) => 
    (idea.x === undefined || idea.x === null) && 
    (idea.y === undefined || idea.y === null) && 
    !idea.archived
  );

  console.log('Rendering with:', { 
    totalIdeas: ideas.length, 
    sidebarIdeas: sidebarIdeas.length, 
    isLoading 
  }); // Debug log

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading ideas...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        ideas={sidebarIdeas}
        onDragStart={(e, id) => {
          console.log(`Starting drag for idea ${id}`); // Debug log
          e.dataTransfer.setData("ideaId", id);
          e.dataTransfer.effectAllowed = "move";
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
          ideas={ideas} // Pass ALL ideas, not just canvas ideas
          setIdeas={handleSetIdeas}
          mapId={mapId}
          onCanvasClick={handleCanvasClick} // Pass the canvas click handler
        />
        
        {/* Debug info - remove this in production */}
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow text-xs">
          <div>Total: {ideas.length}</div>
          <div>Sidebar: {sidebarIdeas.length}</div>
          <div>Canvas: {ideas.filter(i => i.x !== undefined && i.y !== undefined && !i.archived).length}</div>
        </div>
      </div>
    </div>
  );
}
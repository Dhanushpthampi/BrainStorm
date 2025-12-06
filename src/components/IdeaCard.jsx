import { useRef, useState, useEffect } from 'react';

export default function IdeaCard({
  idea,
  isSelected,
  onSelect,
  onDrag,
  zoom = 1
}) {
  const dragStartRef = useRef({ x: 0, y: 0, ideaX: 0, ideaY: 0 });
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverSidebar, setIsOverSidebar] = useState(false);
  const startTimeRef = useRef(0);
  
  const handleStart = (clientX, clientY) => {
    startTimeRef.current = Date.now();
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      ideaX: idea.x || 0,
      ideaY: idea.y || 0
    };
    
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsOverSidebar(false);
  };

  const handleMove = (clientX, clientY) => {
    // Adjust delta by zoom level
    const deltaX = (clientX - dragStartRef.current.x) / zoom;
    const deltaY = (clientY - dragStartRef.current.y) / zoom;
    
    // Start dragging if mouse/touch moved more than 15 pixels  
    if (!isDraggingRef.current && (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15)) {
      isDraggingRef.current = true;
      setIsDragging(true);
    }
    
    if (isDraggingRef.current) {
      // Calculate new position based on initial position + delta
      const newX = Math.max(0, dragStartRef.current.ideaX + deltaX);
      const newY = Math.max(0, dragStartRef.current.ideaY + deltaY);
      
      // Check if pointer is over the existing sidebar component
      const sidebarElement = document.querySelector('.sidebar-container');
      
      let overSidebar = false;
      if (sidebarElement) {
        const rect = sidebarElement.getBoundingClientRect();
        overSidebar = clientX >= rect.left && clientX <= rect.right && 
                     clientY >= rect.top && clientY <= rect.bottom;
      }
      
      setIsOverSidebar(overSidebar);
      
      // Dispatch custom event to notify sidebar about drag state
      window.dispatchEvent(new CustomEvent('ideaCardDragOver', {
        detail: { isOverSidebar: overSidebar }
      }));
      
      // Call onDrag with the new position and sidebar status
      onDrag(newX, newY, idea.id, overSidebar, true);
    }
  };

  const handleEnd = () => {
    // Force reset all drag-related state immediately
    const wasDragging = isDraggingRef.current;
    
    // Reset state before any other operations
    setIsDragging(false);
    setIsOverSidebar(false);
    isDraggingRef.current = false;

    // Notify sidebar that dragging ended - ALWAYS dispatch this
    window.dispatchEvent(new CustomEvent('ideaCardDragEnd'));

    const wasShortTap = (Date.now() - startTimeRef.current) < 200;
    const wasSmallMovement = !wasDragging;

    // Trigger select if it was a quick tap or small movement
    if (wasShortTap || wasSmallMovement) {
      onSelect(idea.id);
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Capture the pointer so we get events even when dragging outside the element
    e.currentTarget.setPointerCapture(e.pointerId);
    
    handleStart(e.clientX, e.clientY);

    const onPointerMove = (ev) => {
      handleMove(ev.clientX, ev.clientY);
    };

    const onPointerUp = (ev) => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      
      // Release pointer capture
      if (ev.currentTarget && ev.currentTarget.releasePointerCapture) {
        try {
          ev.currentTarget.releasePointerCapture(ev.pointerId);
        } catch (err) {
          // Ignore errors if pointer already released
        }
      }
      
      handleEnd();
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  };
  
  // Cleanup effect to ensure state is cleared when component unmounts
  useEffect(() => {
    return () => {
      // Ensure any active drag state is cleared on unmount
      if (isDraggingRef.current) {
        window.dispatchEvent(new CustomEvent('ideaCardDragEnd'));
      }
    };
  }, []);

  return (
    <div
      className={`idea-card absolute w-[200px] p-4 rounded-lg border-2 cursor-pointer z-10 transition-all ${
        isSelected
          ? "bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1 border-yellow-400 ring-4 ring-yellow-400"
          : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-black"
      } ${
        isDragging && isOverSidebar
          ? "bg-red-100 rotate-2 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] border-red-500"
          : ""
      } ${
        isDragging && !isOverSidebar
          ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1 scale-105"
          : ""
      }`}
      style={{ left: idea.x, top: idea.y, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    >
      {isDragging && isOverSidebar && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
          Release to return to sidebar
        </div>
      )}
      
      <h2 className="font-bold text-black mb-1 pointer-events-none">{idea.title}</h2>
      <p className="text-sm text-gray-700 truncate font-medium pointer-events-none">{idea.description}</p>
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap mt-3 gap-1 pointer-events-none">
          {idea.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-black px-2 py-0.5 rounded-full border border-black font-bold"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
import { useRef, useState } from 'react';

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
  const touchHandledRef = useRef(false);
  
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
    // Notify sidebar that dragging ended - ALWAYS dispatch this
    window.dispatchEvent(new CustomEvent('ideaCardDragEnd'));

    const wasShortTap = (Date.now() - startTimeRef.current) < 200;
    const wasSmallMovement = !isDraggingRef.current;

    setIsDragging(false);
    setIsOverSidebar(false);

    // Trigger select if it was a quick tap or small movement
    if (wasShortTap || wasSmallMovement) {
      onSelect(idea.id);
    }
    
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e) => {
    // If touch was recently handled, ignore mouse events (prevents double-firing on mobile)
    if (touchHandledRef.current) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientX, e.clientY);

    const onMouseMove = (ev) => {
      handleMove(ev.clientX, ev.clientY);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      handleEnd();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleTouchStart = (e) => {
    // Mark that touch was handled to prevent mouse events from also firing
    touchHandledRef.current = true;
    setTimeout(() => {
      touchHandledRef.current = false;
    }, 500);
    
    // Prevent mouse events from firing after touch
    e.preventDefault();
    
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);

    const onTouchMove = (ev) => {
      const t = ev.touches[0];
      
      // Prevent scrolling while potentially dragging
      if (ev.cancelable) {
        ev.preventDefault();
      }
      
      handleMove(t.clientX, t.clientY);
    };

    const onTouchEnd = (ev) => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      handleEnd();
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  };

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
      style={{ left: idea.x, top: idea.y }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
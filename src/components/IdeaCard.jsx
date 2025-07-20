// components/IdeaCard.jsx
import { useRef } from 'react';

export default function IdeaCard({
  idea,
  isSelected,
  onSelect,
  onDrag
}) {
  const dragStartRef = useRef({ x: 0, y: 0, ideaX: 0, ideaY: 0 });
  const isDraggingRef = useRef(false);
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Store initial positions
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ideaX: idea.x || 0,
      ideaY: idea.y || 0
    };
    
    isDraggingRef.current = false;

    const handleMouseMove = (ev) => {
      const deltaX = ev.clientX - dragStartRef.current.x;
      const deltaY = ev.clientY - dragStartRef.current.y;
      
      // Start dragging if mouse moved more than 3 pixels
      if (!isDraggingRef.current && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        isDraggingRef.current = true;
      }
      
      if (isDraggingRef.current) {
        // Calculate new position based on initial position + delta
        const newX = Math.max(0, dragStartRef.current.ideaX + deltaX);
        const newY = Math.max(0, dragStartRef.current.ideaY + deltaY);
        
        // Call onDrag with the new position directly
        onDrag(newX, newY, idea.id);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Only trigger select if we didn't drag
      if (!isDraggingRef.current) {
        onSelect(idea.id);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`idea-card absolute w-[200px] p-4 rounded-xl shadow-md cursor-pointer z-10 transition-all ${
        isSelected
          ? "ring-4 ring-blue-400 bg-blue-50 scale-105"
          : "bg-white hover:shadow-lg"
      }`}
      style={{ left: idea.x, top: idea.y }}
      onMouseDown={handleMouseDown}
    >
      <h2 className="font-semibold text-gray-800">{idea.title}</h2>
      <p className="text-sm text-gray-500 truncate">{idea.description}</p>
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap mt-2 gap-1">
          {idea.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
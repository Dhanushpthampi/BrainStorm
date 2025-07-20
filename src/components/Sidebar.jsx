export default function Sidebar({ ideas, onDragStart }) {
  return (
    <div className="w-[300px] h-screen overflow-y-auto bg-white shadow-lg p-4">
      <h3 className="text-lg font-bold mb-4">💡 Ideas</h3>
      {ideas.map((idea) => (
        <div
          key={idea.id}
          draggable
          onDragStart={(e) => onDragStart(e, idea.id)}
          className="border rounded p-2 mb-2 bg-gray-100 cursor-move hover:bg-gray-200"
        >
          <strong>{idea.title}</strong>
          <p className="text-sm">{idea.description}</p>
        </div>
      ))}
    </div>
  );
}

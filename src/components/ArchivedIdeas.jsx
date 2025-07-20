import { getIdeas, restoreIdea, deleteIdea } from "../utils/localStorageUtils";
import { useEffect, useState } from "react";

export default function ArchivedIdeas() {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const archived = getIdeas().filter(i => i.archived);
    setIdeas(archived);
  }, []);

  const handleRestore = (id) => {
    restoreIdea(id);
    setIdeas(ideas => ideas.filter(i => i.id !== id));
  };

  const handleDelete = (id) => {
    deleteIdea(id);
    setIdeas(ideas => ideas.filter(i => i.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🗃 Archived Ideas</h1>
      {ideas.map(idea => (
        <div key={idea.id} className="border p-4 rounded shadow mb-2">
          <h2 className="text-lg font-semibold">{idea.title}</h2>
          <p className="text-sm">{idea.description}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handleRestore(idea.id)} className="bg-green-500 text-white px-2 py-1 rounded">Restore</button>
            <button onClick={() => handleDelete(idea.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

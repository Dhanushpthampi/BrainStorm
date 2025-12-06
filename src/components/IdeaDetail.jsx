import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIdeas } from "../context/IdeasContext";

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ideas, deleteIdea, archiveIdea, isLoading } = useIdeas();
  const [idea, setIdea] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      const found = ideas.find(i => i.id === id);
      if (!found) {
        // Only redirect if we are sure it's loaded and not found
        // But be careful about initial load
        // For now, let's just set idea to null and handle UI
      }
      setIdea(found || null);
    }
  }, [id, ideas, isLoading]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this idea? This action cannot be undone.")) {
      try {
        deleteIdea(id);
        navigate("/");
      } catch (error) {
        console.error('Error deleting idea:', error);
        alert('Failed to delete idea. Please try again.');
      }
    }
  };

  const handleArchive = () => {
    if (window.confirm("Archive this idea? You can restore it later from the archive.")) {
      try {
        archiveIdea(id);
        navigate("/");
      } catch (error) {
        console.error('Error archiving idea:', error);
        alert('Failed to archive idea. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto pt-10 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-6 w-24"></div>
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="h-20 bg-gray-300 rounded mb-6"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-300 rounded w-20"></div>
              <div className="h-10 bg-gray-300 rounded w-20"></div>
              <div className="h-10 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Idea Not Found</h2>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        <button 
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/50"
        >
          ← Back to Ideas
        </button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">{idea.title}</h1>
            {idea.createdAt && (
              <p className="text-blue-100 text-sm">
                Created on {new Date(idea.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose max-w-none mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
            
            {idea.tags && idea.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {idea.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <button 
                onClick={() => navigate(`/edit/${id}`)} 
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                ✏️ Edit Idea
              </button>
              
              <button 
                onClick={handleArchive} 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                📁 Archive
              </button>
              
              <button 
                onClick={handleDelete} 
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        {/* Related Ideas Section - Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Tip</h3>
          <p className="text-gray-600">
            Use the <strong>Idea Board</strong> to visually connect this idea with others and discover new relationships between your thoughts!
          </p>
          <button
            onClick={() => navigate('/board')}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Open Idea Board
          </button>
        </div>
      </div>
    </div>
  );
}
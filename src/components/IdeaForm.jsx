import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { useIdeas } from "../context/IdeasContext";

export default function IdeaForm({ editMode = false, existingIdea = null, onIdeaAdded }) {
  const { addIdea, updateIdea, ideas } = useIdeas();
  const [idea, setIdea] = useState(existingIdea?.title || "");
  const [description, setDescription] = useState(existingIdea?.description || "");
  
  // Safely initialize tags from array or string
  const [tags, setTags] = useState(() => {
    if (!existingIdea?.tags) return [];
    return Array.isArray(existingIdea.tags) 
      ? existingIdea.tags 
      : String(existingIdea.tags).split(',').map(t => t.trim()).filter(Boolean);
  });

  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescription, setShowDescription] = useState(!!existingIdea?.description);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const navigate = useNavigate();

  // Handle tag input keydown
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAthenaSuggest = async () => {
    alert("Coming Soon!");
    return;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ideaData = {
        id: editMode ? existingIdea.id : crypto.randomUUID(),
        title: idea.trim(),
        description: description.trim() || "",
        tags: tags,
        createdAt: editMode ? existingIdea.createdAt : new Date().toISOString(),
        archived: false,
      };

      if (editMode) {
        updateIdea(ideaData);
      } else {
        addIdea(ideaData);
      }

      // Clear form
      setIdea("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setShowDescription(false);

      // Notify parent component to refresh
      if (onIdeaAdded) {
        onIdeaAdded();
      }

      // Navigate only if in edit mode
      if (editMode) {
        navigate("/");
      }
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('Failed to save idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editMode ? "✏️ Edit Idea" : "💡 Add New Idea"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Your Idea *
          </label>
          <input
            type="text"
            placeholder="Enter your brilliant idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-black focus:outline-none transition-colors"
            required
            maxLength={100}
          />
        </div>

        <div>
          <div className="flex items-center gap-4 mb-2">
            {!showDescription && (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
              >
                + Add Description
              </button>
            )}
            <button
              type="button"
              onClick={handleAthenaSuggest}
              disabled={isLoadingSuggestion || !idea.trim()}
              className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoadingSuggestion ? (
                <>
                  <span className="animate-spin">⏳</span> Thinking...
                </>
              ) : (
                <>
                  ✨ Athena.ai suggest
                </>
              )}
            </button>
          </div>
          
          {showDescription && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe your idea in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-black focus:outline-none transition-colors min-h-[120px]"
              />
              
              {/* Display AI suggestion if available and not already in description */}
              {aiSuggestion && description !== aiSuggestion && (
                <div className="mt-3 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg animate-fadeIn">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-purple-800 flex items-center gap-2">
                      ✨ Athena.ai Suggestions
                    </h4>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion("")}
                      className="text-purple-600 hover:text-purple-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestion}</p>
                  {description.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setDescription(prev => prev.trim() + "\n\n" + aiSuggestion);
                        setAiSuggestion("");
                      }}
                      className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                    >
                      Append to description
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-300 rounded-lg focus-within:border-black bg-white">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-gray-300">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-red-500 font-bold px-1"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={tags.length === 0 ? "Type tag and press Enter/Space..." : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 outline-none min-w-[120px] bg-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-orange-400 to-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-3 rounded-lg hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : editMode ? "Update Idea" : "Add Idea"}
          </button>
          
          {editMode && (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              Cancel
            </button>
            )}
        </div>
      </form>
    </div>
  );
}
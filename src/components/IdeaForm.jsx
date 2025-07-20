import { useState } from "react";
import { saveIdea, updateIdea } from "../utils/localStorageUtils";
import { useNavigate } from "react-router-dom"; 

export default function IdeaForm({ editMode = false, existingIdea = null, onIdeaAdded }) {
  const [title, setTitle] = useState(existingIdea?.title || "");
  const [description, setDescription] = useState(existingIdea?.description || "");
  const [tags, setTags] = useState(existingIdea?.tags?.join(", ") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ideaData = {
        id: editMode ? existingIdea.id : crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0),
        createdAt: editMode ? existingIdea.createdAt : new Date().toISOString(),
        archived: false,
      };

      if (editMode) {
        updateIdea(ideaData);
      } else {
        saveIdea(ideaData);
      }

      // Clear form
      setTitle("");
      setDescription("");
      setTags("");

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editMode ? "✏️ Edit Idea" : "💡 Add New Idea"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Idea Title *
          </label>
          <input
            type="text"
            placeholder="What's your brilliant idea?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            placeholder="Describe your idea in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="e.g. technology, business, creative (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas to help organize your ideas
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : editMode ? "Update Idea" : "Add Idea"}
          </button>
          
          {editMode && (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
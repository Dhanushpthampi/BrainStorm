import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { useIdeas } from "../context/IdeasContext";

export default function IdeaForm({ editMode = false, existingIdea = null, onIdeaAdded }) {
  const { addIdea, updateIdea, ideas } = useIdeas();
  const [idea, setIdea] = useState(existingIdea?.title || "");
  const [description, setDescription] = useState(existingIdea?.description || "");
  const [tags, setTags] = useState(existingIdea?.tags?.join(", ") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [filteredTags, setFilteredTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const navigate = useNavigate();
  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load all existing tags
  useEffect(() => {
    const loadExistingTags = () => {
      try {
        const tagSet = new Set();
        
        ideas.forEach(ideaItem => {
          if (ideaItem.tags && Array.isArray(ideaItem.tags)) {
            ideaItem.tags.forEach(tag => {
              if (tag.trim()) {
                tagSet.add(tag.trim().toLowerCase());
              }
            });
          }
        });
        
        setAllTags(Array.from(tagSet).sort());
        setFilteredTags(Array.from(tagSet).sort());
      } catch (error) {
        console.error('Error loading existing tags:', error);
      }
    };

    loadExistingTags();
  }, [ideas]);

  // Handle tag input changes and filtering
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTags(value);

    // Get the current word being typed (after the last comma)
    const lastCommaIndex = value.lastIndexOf(',');
    const currentTag = value.slice(lastCommaIndex + 1).trim().toLowerCase();

    if (currentTag.length > 0) {
      // Filter tags based on current input
      const filtered = allTags.filter(tag => 
        tag.includes(currentTag) && 
        !getCurrentTags(value).map(t => t.toLowerCase()).includes(tag)
      );
      setFilteredTags(filtered);
      setShowTagDropdown(filtered.length > 0);
    } else {
      // Show all unused tags
      const currentTagsLower = getCurrentTags(value).map(t => t.toLowerCase());
      const availableTags = allTags.filter(tag => !currentTagsLower.includes(tag));
      setFilteredTags(availableTags);
      setShowTagDropdown(availableTags.length > 0);
    }
  };

  // Get currently entered tags
  const getCurrentTags = (tagString) => {
    return tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  // Handle tag selection from dropdown
  const handleTagSelect = (selectedTag) => {
    const currentTags = tags.split(',').map(tag => tag.trim());
    
    // Remove the last incomplete tag and add the selected one
    const lastCommaIndex = tags.lastIndexOf(',');
    let newTagsString;
    
    if (lastCommaIndex >= 0) {
      const beforeLastComma = tags.slice(0, lastCommaIndex + 1);
      newTagsString = beforeLastComma + ' ' + selectedTag + ', ';
    } else {
      // If no comma exists, replace the entire input
      newTagsString = selectedTag + ', ';
    }
    
    setTags(newTagsString);
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          tagInputRef.current && !tagInputRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ideaData = {
        id: editMode ? existingIdea.id : crypto.randomUUID(),
        title: idea.trim(),
        description: description.trim() || "",
        tags: tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0),
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
            Your Idea *
          </label>
          <input
            type="text"
            placeholder="Enter your brilliant idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Describe your idea in detail... (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px]"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <input
            ref={tagInputRef}
            type="text"
            placeholder="e.g. technology, business, creative (comma separated)"
            value={tags}
            onChange={handleTagInputChange}
            onFocus={() => {
              if (allTags.length > 0) {
                const currentTagsLower = getCurrentTags(tags).map(t => t.toLowerCase());
                const availableTags = allTags.filter(tag => !currentTagsLower.includes(tag));
                setFilteredTags(availableTags);
                setShowTagDropdown(availableTags.length > 0);
              }
            }}
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            autoComplete="off"
          />
          
          {/* Tag Dropdown */}
          {showTagDropdown && (
            <div 
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredTags.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                    Previous tags ({filteredTags.length})
                  </div>
                  {filteredTags.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTagSelect(tag)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors capitalize border-b border-gray-100 last:border-b-0"
                    >
                      #{tag}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No matching tags found
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas. Click on the input to see previous tags.
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
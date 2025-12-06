import { useEffect, useRef, useState } from "react";
import { getCanvasIdeas as getIdeas } from "../utils/localStorageUtils";

export default function TagInput({ value, onChange, refreshKey }) {
  const [allTags, setAllTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ✅ Load / reload tags
  useEffect(() => {
    try {
      const ideas = getIdeas();
      const tagSet = new Set();

      ideas.forEach((idea) => {
        if (idea.tags && Array.isArray(idea.tags)) {
          idea.tags.forEach((tag) => {
            if (tag?.trim()) tagSet.add(tag.trim().toLowerCase());
          });
        }
      });

      const list = Array.from(tagSet).sort();
      setAllTags(list);
      setFilteredTags(list);
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  }, [refreshKey]);   // 🔑 THIS FIXES YOUR BUG

  const getCurrentTags = (str) =>
    str.split(",").map((t) => t.trim()).filter(Boolean);

  const handleInputChange = (e) => {
    const text = e.target.value;
    onChange(text);

    const lastComma = text.lastIndexOf(",");
    const current = text.slice(lastComma + 1).trim().toLowerCase();

    const usedTags = getCurrentTags(text).map((t) => t.toLowerCase());

    const matches =
      current.length > 0
        ? allTags.filter(
            (tag) => tag.includes(current) && !usedTags.includes(tag)
          )
        : allTags.filter((tag) => !usedTags.includes(tag));

    setFilteredTags(matches);
    setShowDropdown(matches.length > 0);
  };

  const handleSelect = (tag) => {
    const lastComma = value.lastIndexOf(",");

    const updated =
      lastComma >= 0
        ? value.slice(0, lastComma + 1) + " " + tag + ", "
        : tag + ", ";

    onChange(updated);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // ✅ Outside click close
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Tags
      </label>

      <input
        ref={inputRef}
        type="text"
        value={value}
        autoComplete="off"
        placeholder="e.g. technology, business, creative"
        onChange={handleInputChange}
        className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
      />

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
            Previous tags ({filteredTags.length})
          </div>

          {filteredTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => handleSelect(tag)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 capitalize border-b border-gray-100 last:border-b-0"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-1">
        Separate tags with commas.
      </p>
    </div>
  );
}

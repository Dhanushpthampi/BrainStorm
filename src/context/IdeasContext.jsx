import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  getIdeas, 
  saveIdea, 
  updateIdea, 
  deleteIdea as deleteIdeaFromStorage,
  updateIdeas as updateIdeasInStorage,
  getLinks,
  saveLinks,
  saveLink,
  deleteLink
} from "../utils/localStorageUtils";

const IdeasContext = createContext();

export function IdeasProvider({ children }) {
  const [ideas, setIdeas] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(() => {
    try {
      setIsLoading(true);
      const loadedIdeas = getIdeas();
      const loadedLinks = getLinks();
      setIdeas(loadedIdeas || []);
      setLinks(loadedLinks || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for storage events to sync across tabs/components
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storageUpdate", handleStorageChange);
    window.addEventListener("linksUpdated", handleStorageChange);
    window.addEventListener("mapChanged", handleStorageChange);
    window.addEventListener("globalIdeasUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storageUpdate", handleStorageChange);
      window.removeEventListener("linksUpdated", handleStorageChange);
      window.removeEventListener("mapChanged", handleStorageChange);
      window.removeEventListener("globalIdeasUpdated", handleStorageChange);
    };
  }, [loadData]);

  const addIdea = useCallback((newIdea) => {
    const savedIdea = saveIdea(newIdea);
    if (savedIdea) {
      // setIdeas(prev => [savedIdea, ...prev]); // Removed to prevent duplication
      return savedIdea;
    }
    return null;
  }, []);

  const updateIdeaItem = useCallback((updatedIdea) => {
    const success = updateIdea(updatedIdea);
    if (success) {
      setIdeas(prev => prev.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
    }
    return success;
  }, []);

  const removeIdea = useCallback((id) => {
    const success = deleteIdeaFromStorage(id);
    if (success) {
      setIdeas(prev => prev.filter(idea => idea.id !== id));
      // Also remove links connected to this idea
      setLinks(prev => prev.filter(link => link.from !== id && link.to !== id));
    }
    return success;
  }, []);

  const setIdeasBatch = useCallback((newIdeasOrUpdater) => {
    setIdeas(prev => {
      const newIdeas = typeof newIdeasOrUpdater === 'function' 
        ? newIdeasOrUpdater(prev) 
        : newIdeasOrUpdater;
      
      updateIdeasInStorage(newIdeas);
      return newIdeas;
    });
  }, []);

  const addLink = useCallback((from, to) => {
    const success = saveLink(from, to);
    // if (success) {
    //   setLinks(prev => [...prev, { from, to }]); // Removed to prevent duplication
    // }
    return success;
  }, []);

  const removeLink = useCallback((from, to) => {
    const success = deleteLink(from, to);
    if (success) {
      setLinks(prev => prev.filter(link => 
        !(link.from === from && link.to === to) && 
        !(link.from === to && link.to === from)
      ));
    }
    return success;
  }, []);

  const archiveIdea = useCallback((id) => {
    const ideaToArchive = ideas.find(i => i.id === id);
    if (ideaToArchive) {
      const updated = { ...ideaToArchive, archived: true };
      return updateIdeaItem(updated);
    }
    return false;
  }, [ideas, updateIdeaItem]);

  const restoreIdea = useCallback((id) => {
    const ideaToRestore = ideas.find(i => i.id === id);
    if (ideaToRestore) {
      const updated = { ...ideaToRestore, archived: false };
      return updateIdeaItem(updated);
    }
    return false;
  }, [ideas, updateIdeaItem]);

  const value = {
    ideas,
    links,
    isLoading,
    selectedTag,
    setSelectedTag,
    addIdea,
    updateIdea: updateIdeaItem,
    deleteIdea: removeIdea,
    archiveIdea,
    restoreIdea,
    setIdeas: setIdeasBatch,
    addLink,
    removeLink,
    refreshData: loadData
  };

  return (
    <IdeasContext.Provider value={value}>
      {children}
    </IdeasContext.Provider>
  );
}

export const useIdeas = () => {
  const context = useContext(IdeasContext);
  if (!context) {
    throw new Error("useIdeas must be used within an IdeasProvider");
  }
  return context;
};

import { createContext, useContext, useState } from "react";

const IdeasContext = createContext();

export function IdeasProvider({ children }) {
  const [ideas, setIdeas] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  const addIdea = (newIdea) => {
    setIdeas((prev) => [...prev, newIdea]);
  };

  return (
    <IdeasContext.Provider value={{
      ideas,
      addIdea,
      selectedTag,
      setSelectedTag
    }}>
      {children}
    </IdeasContext.Provider>
  );
}

export const useIdeas = () => useContext(IdeasContext);

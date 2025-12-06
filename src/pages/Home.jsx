
import TagFilter from "./../components/TagFilter";
import { useState } from "react";
import IdeaForm from "./../components/IdeaForm";
import IdeaList from "./../components/IdeaList"; 
export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-4"> 
        <IdeaForm onIdeaAdded={forceRefresh} />
        <TagFilter onTagSelect={setSelectedTag} refreshKey={refreshKey} />
        <IdeaList selectedTag={selectedTag} refreshKey={refreshKey} />
      </div>
    </div>
  );
}


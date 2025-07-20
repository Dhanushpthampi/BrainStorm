import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import IdeaForm from "./components/IdeaForm";
import IdeaList from "./components/IdeaList";
import IdeaDetail from "./components/IdeaDetail";
import ArchivedIdeas from "./components/ArchivedIdeas";
import TagFilter from "./components/TagFilter";
import { useState } from "react";
import EditIdeaPage from "./pages/EditIdeaPage";
import IdeaBoardPage from "./pages/IdeaBoardPage";

function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            💡 Brainstorm Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Capture, organize, and visualize your brilliant ideas
          </p>
        </div>

        <IdeaForm onIdeaAdded={forceRefresh} />
        <TagFilter onTagSelect={setSelectedTag} refreshKey={refreshKey} />
        <IdeaList selectedTag={selectedTag} refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              🧠 Brainstorm
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/board" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                <span>🎯</span> Idea Board
              </Link>
              <Link 
                to="/archive" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                <span>📁</span> Archive
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/idea/:id" element={<IdeaDetail />} />
        <Route path="/edit/:id" element={<EditIdeaPage />} />
        <Route path="/board" element={<IdeaBoardPage />} />
        <Route path="/archive" element={<ArchivedIdeas />} />
      </Routes>
    </Router>
  );
}
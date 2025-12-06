import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IdeaDetail from "./components/IdeaDetail";
import ArchivedIdeas from "./components/ArchivedIdeas";
import EditIdeaPage from "./pages/EditIdeaPage";
import IdeaBoardPage from "./pages/IdeaBoardPage";
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";

export default function App() {
  return (
    <Router>
      <Navbar /> 
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
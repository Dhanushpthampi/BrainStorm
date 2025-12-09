import TagFilter from "./../components/TagFilter";
import { useRef, useEffect } from "react";
import IdeaForm from "./../components/IdeaForm";
import IdeaList from "./../components/IdeaList"; 
import { useLocation } from "react-router-dom";


export default function Home() {
  const ideaFormRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Scroll to idea form if coming from "Add Your First Idea" button
    if (location.state?.scrollToForm && ideaFormRef.current) {
      ideaFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-6xl mx-auto py-8 px-4"> 
        <div ref={ideaFormRef}>
          <IdeaForm />
        </div>
        <TagFilter />
        <IdeaList />
      </div>
    </div>
  );
}


import { useParams, useNavigate } from "react-router-dom";
import IdeaForm from "../components/IdeaForm";
import { useIdeas } from "../context/IdeasContext";
import { useEffect, useState } from "react";

export default function EditIdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ideas, isLoading } = useIdeas();
  const [ideaToEdit, setIdeaToEdit] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      const found = ideas.find((idea) => idea.id === id);
      setIdeaToEdit(found);
    }
  }, [ideas, id, isLoading]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  // If idea not found, redirect or show error
  if (!ideaToEdit) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="text-xl font-bold mb-4">Idea not found 😕</p>
        <button
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <IdeaForm editMode={true} existingIdea={ideaToEdit} />
    </div>
  );
}

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
        <p>Idea not found 😕</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Idea</h2>
      <IdeaForm editMode={true} existingIdea={ideaToEdit} />
    </div>
  );
}

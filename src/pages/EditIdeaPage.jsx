import { useParams, useNavigate } from "react-router-dom";
import IdeaForm from "../components/IdeaForm";

export default function EditIdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch the idea from localStorage using the ID
  const storedIdeas = JSON.parse(localStorage.getItem("ideas")) || [];
  const ideaToEdit = storedIdeas.find((idea) => idea.id === id);

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

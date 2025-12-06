import TagFilter from "./../components/TagFilter";
import { useState } from "react";
import IdeaForm from "./../components/IdeaForm";
import IdeaList from "./../components/IdeaList"; 


export default function Home() {

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-6xl mx-auto py-8 px-4"> 
        <IdeaForm />
        <TagFilter />
        <IdeaList />
      </div>
    </div>
  );
}


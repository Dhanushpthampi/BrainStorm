export async function suggestIdeas(idea) {
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  const data = await res.json();
  return data.suggestions;
}

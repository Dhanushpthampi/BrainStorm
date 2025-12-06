import { useEffect, useState } from "react";

export default function useSelection(ideas, links) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    if (selectedIds.length !== 2) return;

    const [a, b] = selectedIds;
    setIsLinked(
      links.some(
        (l) =>
          (l.from === a && l.to === b) || (l.from === b && l.to === a)
      )
    );
  }, [selectedIds, links]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev.slice(-1), id]
    );
  };

  return { selectedIds, toggleSelect, isLinked, setSelectedIds };
}

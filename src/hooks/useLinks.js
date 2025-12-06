import { useEffect, useState } from "react";
import { getLinks, saveLinks } from "../utils/localStorageUtils";

export default function useLinks() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    setLinks(getLinks() || []);
  }, []);

  useEffect(() => {
    saveLinks(links);
    window.dispatchEvent(new CustomEvent("linksUpdated", { detail: links }));
  }, [links]);

  useEffect(() => {
    const sync = (e) => e?.detail && setLinks(e.detail);
    window.addEventListener("linksUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("linksUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [links, setLinks];
}

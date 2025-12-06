import { useState, useRef, useEffect, useCallback } from "react";
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;


const ZOOM_SENSITIVITY = 0.001;

export default function useZoomPan() {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [last, setLast] = useState({ x: 0, y: 0 });

  const onWheel = useCallback(
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      setZoom((z) => Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM));
    },
    []
  );

  const onDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setLast({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const onMove = useCallback(
    (e) => {
      if (!isPanning) return;

      setPanOffset((p) => ({
        x: p.x + (e.clientX - last.x),
        y: p.y + (e.clientY - last.y),
      }));

      setLast({ x: e.clientX, y: e.clientY });
    },
    [isPanning, last]
  );

  const onUp = () => setIsPanning(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onWheel, onDown, onMove]);

  const zoomIn = () => setZoom((z) => Math.min(z * 1.2, MAX_ZOOM));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.2, MIN_ZOOM));
  const reset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return { containerRef, zoom, panOffset, isPanning, zoomIn, zoomOut, reset };
}

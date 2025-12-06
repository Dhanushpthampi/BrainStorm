export default function ZoomControls({ zoom, zoomIn, zoomOut, reset }) {
  return (
    <div className="absolute top-4 right-4 bg-white shadow p-2 z-20">
      <button onClick={zoomIn}>+</button>
      <div>{Math.round(zoom * 100)}%</div>
      <button onClick={zoomOut}>-</button>
      <button onClick={reset}>⌂</button>
    </div>
  );
}

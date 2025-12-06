export default function LinkPopup({ isLinked, onLink, onUnlink }) {
  return (
    <div className="absolute bg-white p-3 shadow border z-40">
      {isLinked ? (
        <button onClick={onUnlink}>Unlink</button>
      ) : (
        <button onClick={onLink}>Link</button>
      )}
    </div>
  );
}

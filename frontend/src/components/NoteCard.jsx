function NoteCard({ title, eyebrow, children }) {
  return (
    <aside className="note-card">
      <p className="note-card__eyebrow">{eyebrow}</p>
      <h2 className="note-card__title">{title}</h2>
      <div className="note-card__body">{children}</div>
    </aside>
  );
}

export default NoteCard;

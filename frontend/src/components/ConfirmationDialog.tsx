export function ConfirmationDialog({ title, description, confirmLabel, onConfirm, onCancel, busy = false }: {
  title: string; description: string; confirmLabel: string; onConfirm(): void; onCancel(): void; busy?: boolean;
}) {
  const titleId = `dialog-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2><p>{description}</p>
      <div className="dialog-actions"><button className="button button--secondary" type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="button button--danger" type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button></div>
    </section>
  </div>;
}

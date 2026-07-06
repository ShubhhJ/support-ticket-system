import { useState, type FormEvent } from 'react';
import { PRIORITIES, type Priority } from '../types';
import { createTicket } from '../api/tickets';
import { getErrorMessage } from '../api/client';

export function NewTicketForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createTicket({ subject: subject.trim(), description: description.trim() || undefined, priority });
      setSubject('');
      setDescription('');
      setPriority('medium');
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        + New ticket
      </button>
    );
  }

  return (
    <form className="new-ticket-form" onSubmit={handleSubmit}>
      <input
        className="input"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        autoFocus
      />
      <textarea
        className="input"
        placeholder="Description (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="action-row">
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" disabled={busy || !subject.trim()}>
          {busy ? 'Creating…' : 'Create'}
        </button>
        <button type="button" className="btn btn-small" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </form>
  );
}

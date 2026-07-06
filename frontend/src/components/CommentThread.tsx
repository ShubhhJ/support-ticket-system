import { useState, type FormEvent } from 'react';
import type { Comment } from '../types';
import { addComment } from '../api/tickets';
import { getErrorMessage } from '../api/client';
import { formatDateTime } from '../lib/sla';

interface CommentThreadProps {
  ticketId: number;
  comments: Comment[];
  onAdded: () => void;
}

export function CommentThread({ ticketId, comments, onAdded }: CommentThreadProps) {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!author.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addComment(ticketId, author.trim(), message.trim());
      setMessage('');
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="comment-thread">
      {comments.length === 0 && <p className="muted">No comments yet.</p>}

      {comments.map((comment) => {
        const isCustomer = comment.author.toLowerCase() === 'customer';
        return (
          <div key={comment.id} className={`comment ${isCustomer ? 'comment-customer' : 'comment-agent'}`}>
            <div className="comment-head">
              <strong>{comment.author}</strong>
              <span className="muted small">{formatDateTime(comment.createdAt)}</span>
            </div>
            <p>{comment.message}</p>
          </div>
        );
      })}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Your name (or 'customer')"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="input"
          placeholder="Add a comment…"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <span className="field-error">{error}</span>}
        <button type="submit" className="btn" disabled={submitting || !author.trim() || !message.trim()}>
          {submitting ? 'Adding…' : 'Add comment'}
        </button>
      </form>
    </div>
  );
}

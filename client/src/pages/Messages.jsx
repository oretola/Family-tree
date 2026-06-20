import React, { useState, useEffect } from 'react';

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function MessageItem({ message, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const initials = message.author_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Pick a color based on author name hash
  const colors = [
    'from-amber-200 to-amber-300 text-amber-800',
    'from-rose-200 to-rose-300 text-rose-800',
    'from-sky-200 to-sky-300 text-sky-800',
    'from-emerald-200 to-emerald-300 text-emerald-800',
    'from-violet-200 to-violet-300 text-violet-800',
    'from-orange-200 to-orange-300 text-orange-800',
  ];
  const colorIndex = message.author_name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];

  return (
    <div className="card p-5 group hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-stone-800">{message.author_name}</span>
              {message.member_id && (
                <span className="text-stone-400 text-sm ml-2">about a family member</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs whitespace-nowrap">{timeAgo(message.created_at)}</span>
              <button
                onClick={() => setShowDelete(true)}
                className="text-stone-300 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-stone-600 mt-2 leading-relaxed">{message.content}</p>
        </div>
      </div>

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold text-stone-800 mb-2">Delete this story?</h3>
            <p className="text-stone-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { onDelete(message.id); setShowDelete(false); }} className="btn-danger flex-1 justify-center">Delete</button>
              <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ author_name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) {
      setError('Both your name and a message are required.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const message = await res.json();
      setMessages(prev => [message, ...prev]);
      setForm({ author_name: form.author_name, content: '' }); // Keep author name
    } catch {
      setError('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    fetch(`/api/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const filtered = messages.filter(m =>
    m.author_name.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Family Stories</h1>
        <p className="text-stone-500 mt-1">Share memories, messages, and stories with the whole family</p>
      </div>

      {/* New Message Form */}
      <div className="card p-5 bg-gradient-to-br from-amber-50 to-rose-50">
        <h2 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
          <span>💌</span> Share a Story
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={form.author_name}
            onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))}
            className="input"
          />
          <textarea
            placeholder="Share a memory, a funny story, a heartfelt message... anything you'd like the family to know!"
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            rows={5}
            className="textarea"
          />
          {error && (
            <p className="text-rose-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center"
          >
            {submitting ? (
              <>
                <div className="spinner w-4 h-4" />
                Posting...
              </>
            ) : (
              <>
                <span>✨</span>
                Share with the Family
              </>
            )}
          </button>
        </form>
      </div>

      {/* Search */}
      {messages.length > 3 && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      )}

      {/* Messages List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          <p className="text-stone-400 text-sm font-medium">
            {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
          </p>
          {filtered.map(msg => (
            <MessageItem key={msg.id} message={msg} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          {search ? (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-stone-500 font-medium">No stories matching "{search}"</p>
              <button onClick={() => setSearch('')} className="mt-3 text-amber-600 font-medium hover:underline">
                Clear search
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">💌</div>
              <h3 className="font-bold text-stone-600 text-lg mb-2">No stories yet</h3>
              <p className="text-stone-400 text-sm">Be the first to share a story with your family!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

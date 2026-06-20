import React, { useState } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MediaCard({ media, onDelete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await fetch(`/api/media/${media.id}`, { method: 'DELETE' });
      onDelete?.(media.id);
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  };

  return (
    <div className="masonry-item card group">
      {/* Media Content */}
      {media.type === 'image' && (
        <div className="overflow-hidden">
          <img
            src={media.file_path}
            alt={media.title || 'Family photo'}
            className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {media.type === 'video' && (
        <div className="overflow-hidden bg-stone-900">
          <video
            src={media.file_path}
            controls
            className="w-full"
            preload="metadata"
          />
        </div>
      )}

      {media.type === 'voice' && (
        <div className="p-4 bg-gradient-to-br from-rose-50 to-amber-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎙️</span>
            </div>
            <div>
              <p className="font-semibold text-stone-700">{media.title || 'Voice Note'}</p>
              <p className="text-xs text-stone-400">{formatDate(media.created_at)}</p>
            </div>
          </div>
          <audio src={media.file_path} controls className="w-full" />
        </div>
      )}

      {/* Caption */}
      <div className="p-3">
        {media.title && media.type !== 'voice' && (
          <p className="font-semibold text-stone-700 text-sm">{media.title}</p>
        )}
        {media.description && (
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{media.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-stone-400 text-xs">{formatDate(media.created_at)}</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-stone-300 hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold text-stone-800 text-lg mb-2">Delete this media?</h3>
            <p className="text-stone-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

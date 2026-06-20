import React, { useState, useEffect, useCallback } from 'react';
import MediaCard from '../components/MediaCard';
import FileUpload from '../components/FileUpload';
import VoiceRecorder from '../components/VoiceRecorder';

const TABS = [
  { id: 'all', label: 'All', icon: '🗂️' },
  { id: 'image', label: 'Photos', icon: '🖼️' },
  { id: 'video', label: 'Videos', icon: '🎬' },
  { id: 'voice', label: 'Voice Notes', icon: '🎙️' },
];

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const url = activeTab === 'all' ? '/api/media' : `/api/media?type=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = (newMedia) => {
    setMedia(prev => [newMedia, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = (mediaId) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const photos = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const voiceNotes = media.filter(m => m.type === 'voice');

  const displayMedia = activeTab === 'all' ? media
    : activeTab === 'image' ? photos
    : activeTab === 'video' ? videos
    : voiceNotes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Family Gallery</h1>
          <p className="text-stone-500 mt-1">
            {media.length} memories — {photos.length} photos, {videos.length} videos, {voiceNotes.length} voice notes
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary"
        >
          <span>⬆️</span> Upload
        </button>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-700 text-lg">Add to Gallery</h2>
            <button onClick={() => setShowUpload(false)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-stone-600 mb-3">📸 Photos & Videos</h3>
              <FileUpload onUpload={handleUpload} accept="image/*,video/*" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-600 mb-3">🎙️ Voice Note</h3>
              <VoiceRecorder onUpload={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-stone-100 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-stone-500 hover:bg-amber-50 hover:text-stone-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10" />
        </div>
      ) : displayMedia.length > 0 ? (
        <>
          {/* Voice notes in list style */}
          {activeTab === 'voice' && (
            <div className="space-y-3">
              {displayMedia.map(m => (
                <MediaCard key={m.id} media={m} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Videos in 2-col grid */}
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayMedia.map(m => (
                <MediaCard key={m.id} media={m} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Mixed or photos in masonry */}
          {(activeTab === 'all' || activeTab === 'image') && (
            <div>
              {/* Voice notes first if in "all" */}
              {activeTab === 'all' && voiceNotes.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Voice Notes</h2>
                  <div className="space-y-3">
                    {voiceNotes.map(m => (
                      <MediaCard key={m.id} media={m} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'all' && videos.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Videos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map(m => (
                      <MediaCard key={m.id} media={m} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              {(photos.length > 0 || activeTab === 'image') && (
                <div>
                  {activeTab === 'all' && photos.length > 0 && (
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Photos</h2>
                  )}
                  <div className="masonry-grid">
                    {(activeTab === 'all' ? photos : displayMedia).map(m => (
                      <MediaCard key={m.id} media={m} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">
            {activeTab === 'all' ? '📸' : activeTab === 'image' ? '🖼️' : activeTab === 'video' ? '🎬' : '🎙️'}
          </div>
          <h3 className="font-bold text-stone-600 text-lg mb-2">
            No {activeTab === 'all' ? 'memories' : TABS.find(t => t.id === activeTab)?.label.toLowerCase()} yet
          </h3>
          <p className="text-stone-400 text-sm mb-6">
            {activeTab === 'all'
              ? 'Upload your first photos, videos, or voice notes to start building your family gallery.'
              : `Upload some ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} to get started.`}
          </p>
          <button onClick={() => setShowUpload(true)} className="btn-primary inline-flex">
            Upload Now
          </button>
        </div>
      )}
    </div>
  );
}

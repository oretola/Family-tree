import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import FileUpload from '../components/FileUpload';
import VoiceRecorder from '../components/VoiceRecorder';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatAge(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [media, setMedia] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [newMessage, setNewMessage] = useState({ author_name: '', content: '' });
  const [submittingMsg, setSubmittingMsg] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [memberRes, mediaRes, messagesRes] = await Promise.all([
          fetch(`/api/members/${id}`),
          fetch(`/api/media?member_id=${id}`),
          fetch(`/api/messages?member_id=${id}`),
        ]);

        if (!memberRes.ok) { navigate('/members'); return; }

        const [memberData, mediaData, messagesData] = await Promise.all([
          memberRes.json(),
          mediaRes.json(),
          messagesRes.json(),
        ]);

        setMember(memberData);
        setMedia(mediaData);
        setMessages(messagesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleDeleteMember = async () => {
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      navigate('/members');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaUpload = (newMedia) => {
    setMedia(prev => [newMedia, ...prev]);
  };

  const handleMediaDelete = (mediaId) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.author_name.trim() || !newMessage.content.trim()) return;
    setSubmittingMsg(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMessage, member_id: id }),
      });
      const message = await res.json();
      setMessages(prev => [message, ...prev]);
      setNewMessage({ author_name: '', content: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMsg(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch(`/api/messages/${msgId}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error(err);
    }
  };

  const photos = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const voiceNotes = media.filter(m => m.type === 'voice');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/members" className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Members
      </Link>

      {/* Profile Header */}
      <div className="card overflow-visible">
        <div className="h-32 bg-gradient-to-r from-amber-400 to-rose-400 rounded-t-2xl relative">
          <div className="absolute -bottom-16 left-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
              {member.photo_path ? (
                <img src={member.photo_path} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Link
              to={`/members/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-stone-700 text-sm font-semibold rounded-lg transition shadow-sm"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-rose-50 text-rose-500 text-sm font-semibold rounded-lg transition shadow-sm"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="pt-20 pb-6 px-6">
          <h1 className="text-3xl font-bold text-stone-800">{member.name}</h1>
          {member.relationship && (
            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
              {member.relationship}
            </span>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-stone-500 text-sm">
            {member.birthdate && (
              <div className="flex items-center gap-1.5">
                <span>🎂</span>
                <span>{formatDate(member.birthdate)}</span>
                {formatAge(member.birthdate) !== null && (
                  <span className="text-amber-600 font-semibold">({formatAge(member.birthdate)} years old)</span>
                )}
              </div>
            )}
          </div>

          {member.bio && (
            <p className="mt-4 text-stone-600 leading-relaxed max-w-2xl">{member.bio}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-stone-100 overflow-x-auto">
          {[
            { id: 'photos', label: `Photos (${photos.length})`, icon: '🖼️' },
            { id: 'videos', label: `Videos (${videos.length})`, icon: '🎬' },
            { id: 'voice', label: `Voice Notes (${voiceNotes.length})`, icon: '🎙️' },
            { id: 'messages', label: `Stories (${messages.length})`, icon: '💌' },
            { id: 'upload', label: 'Upload', icon: '⬆️' },
          ].map(tab => (
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

        {/* Tab Content */}
        <div className="mt-6">
          {/* Photos */}
          {activeTab === 'photos' && (
            <div>
              {photos.length > 0 ? (
                <div className="masonry-grid">
                  {photos.map(m => (
                    <MediaCard key={m.id} media={m} onDelete={handleMediaDelete} />
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-stone-500 font-medium">No photos yet</p>
                  <button onClick={() => setActiveTab('upload')} className="btn-primary inline-flex mt-4">
                    Upload Photos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Videos */}
          {activeTab === 'videos' && (
            <div>
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map(m => (
                    <MediaCard key={m.id} media={m} onDelete={handleMediaDelete} />
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="text-4xl mb-3">🎬</div>
                  <p className="text-stone-500 font-medium">No videos yet</p>
                  <button onClick={() => setActiveTab('upload')} className="btn-primary inline-flex mt-4">
                    Upload Videos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Voice Notes */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <VoiceRecorder memberId={id} onUpload={handleMediaUpload} />
              {voiceNotes.length > 0 ? (
                <div className="space-y-3">
                  {voiceNotes.map(m => (
                    <MediaCard key={m.id} media={m} onDelete={handleMediaDelete} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-stone-400 text-sm">No voice notes yet — record one above!</p>
                </div>
              )}
            </div>
          )}

          {/* Stories/Messages */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {/* New message form */}
              <div className="card p-5">
                <h3 className="font-bold text-stone-700 mb-4">Leave a story or message</h3>
                <form onSubmit={handleMessageSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newMessage.author_name}
                    onChange={e => setNewMessage(p => ({ ...p, author_name: e.target.value }))}
                    className="input"
                    required
                  />
                  <textarea
                    placeholder={`Write a story or memory about ${member.name}...`}
                    value={newMessage.content}
                    onChange={e => setNewMessage(p => ({ ...p, content: e.target.value }))}
                    rows={4}
                    className="textarea"
                    required
                  />
                  <button type="submit" disabled={submittingMsg} className="btn-primary">
                    {submittingMsg ? 'Posting...' : '💌 Post Story'}
                  </button>
                </form>
              </div>

              {/* Messages list */}
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="card p-5 group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-rose-200 flex items-center justify-center font-bold text-amber-700 text-sm flex-shrink-0">
                            {msg.author_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-700">{msg.author_name}</p>
                            <p className="text-xs text-stone-400">
                              {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-stone-300 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-stone-600 mt-3 leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-3xl mb-2">💌</div>
                  <p className="text-stone-400 text-sm">No stories yet — be the first!</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="card p-6 space-y-6">
              <h3 className="font-bold text-stone-700 text-lg">Upload Media</h3>
              <FileUpload
                memberId={id}
                onUpload={handleMediaUpload}
                label="Upload Photos or Videos"
                accept="image/*,video/*"
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Member Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold text-stone-800 text-lg mb-2">Delete {member.name}?</h3>
            <p className="text-stone-500 text-sm mb-6">
              This will permanently delete this family member's profile. Their media and messages will remain.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeleteMember} className="btn-danger flex-1 justify-center">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

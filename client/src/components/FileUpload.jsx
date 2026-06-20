import React, { useState, useRef, useCallback } from 'react';

export default function FileUpload({ onUpload, memberId, accept = 'image/*,video/*', label = 'Upload Photos or Videos' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);

    try {
      for (const preview of previews) {
        const formData = new FormData();
        formData.append('file', preview.file);
        if (memberId) formData.append('member_id', memberId);
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const media = await res.json();
        onUpload?.(media);
      }

      // Clear after upload
      previews.forEach(p => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setTitle('');
      setDescription('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-amber-500 bg-amber-50'
            : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="text-4xl mb-3">📁</div>
        <p className="font-semibold text-stone-600">{label}</p>
        <p className="text-stone-400 text-sm mt-1">Drag and drop or click to browse</p>
        <p className="text-stone-300 text-xs mt-1">Images and videos up to 100MB</p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {previews.map((preview, i) => (
              <div key={i} className="relative group">
                {preview.type.startsWith('image/') ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ) : (
                  <video
                    src={preview.url}
                    className="w-full h-32 object-cover rounded-xl"
                    preload="metadata"
                  />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Optional title/description */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Add a title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="textarea"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary mt-4 w-full justify-center"
          >
            {uploading ? (
              <>
                <div className="spinner w-4 h-4" />
                Uploading...
              </>
            ) : (
              <>
                <span>⬆️</span>
                Upload {previews.length} {previews.length === 1 ? 'file' : 'files'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

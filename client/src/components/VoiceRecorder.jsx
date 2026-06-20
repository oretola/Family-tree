import React, { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ memberId, onUpload }) {
  const [status, setStatus] = useState('idle'); // idle | recording | paused | done
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setAudioUrl(null);
      setAudioBlob(null);
      setSeconds(0);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        setStatus('done');
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(100);
      setStatus('recording');

      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setStatus('idle');
    setSeconds(0);
    setTitle('');
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;
    setUploading(true);

    try {
      const ext = audioBlob.type.includes('ogg') ? '.ogg' : '.webm';
      const file = new File([audioBlob], `voice-note${ext}`, { type: audioBlob.type });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'voice');
      if (memberId) formData.append('member_id', memberId);
      if (title.trim()) formData.append('title', title.trim());

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const media = await res.json();
      onUpload?.(media);
      discardRecording();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card p-5 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-xl">🎙️</span>
        </div>
        <div>
          <h3 className="font-bold text-stone-700">Voice Note</h3>
          <p className="text-stone-400 text-sm">Record a message for the family</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 text-rose-600 text-sm">
          {error}
        </div>
      )}

      {status === 'idle' && (
        <button
          onClick={startRecording}
          className="btn-primary w-full justify-center"
        >
          <span className="w-3 h-3 rounded-full bg-white inline-block"></span>
          Start Recording
        </button>
      )}

      {status === 'recording' && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-4 h-4 rounded-full bg-rose-500 animate-pulse"></div>
            <span className="text-2xl font-mono font-bold text-stone-700">{formatTime(seconds)}</span>
          </div>
          <div className="flex justify-center gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-rose-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 24 + 8}px`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
          <button
            onClick={stopRecording}
            className="btn-danger w-full justify-center"
          >
            <span className="w-3 h-3 rounded bg-white inline-block"></span>
            Stop Recording
          </button>
        </div>
      )}

      {status === 'done' && (
        <div className="space-y-3">
          <audio src={audioUrl} controls className="w-full rounded-lg" />

          <input
            type="text"
            placeholder="Give this voice note a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />

          <div className="flex gap-2">
            <button
              onClick={uploadRecording}
              disabled={uploading}
              className="btn-primary flex-1 justify-center"
            >
              {uploading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Voice Note
                </>
              )}
            </button>
            <button
              onClick={discardRecording}
              disabled={uploading}
              className="btn-secondary"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

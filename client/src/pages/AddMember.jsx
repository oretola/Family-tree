import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const RELATIONSHIPS = [
  'Grandmother', 'Grandfather', 'Grandparent',
  'Mother', 'Father', 'Parent',
  'Son', 'Daughter', 'Child',
  'Brother', 'Sister', 'Sibling',
  'Husband', 'Wife', 'Spouse', 'Partner',
  'Aunt', 'Uncle', 'Cousin',
  'Grandchild', 'Grandson', 'Granddaughter',
  'Other',
];

export default function AddMember() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const photoInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    birthdate: '',
    relationship: '',
    bio: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && id) {
      fetch(`/api/members/${id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            name: data.name || '',
            birthdate: data.birthdate || '',
            relationship: data.relationship || '',
            bio: data.bio || '',
          });
          if (data.photo_path) setExistingPhoto(data.photo_path);
          setLoading(false);
        })
        .catch(() => { navigate('/members'); });
    }
  }, [id, isEditing]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      if (form.birthdate) formData.append('birthdate', form.birthdate);
      if (form.relationship) formData.append('relationship', form.relationship);
      if (form.bio) formData.append('bio', form.bio.trim());
      if (photoFile) formData.append('photo', photoFile);

      const url = isEditing ? `/api/members/${id}` : '/api/members';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error('Failed to save member');

      const member = await res.json();
      navigate(`/members/${member.id}`);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to={isEditing ? `/members/${id}` : '/members'}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors font-medium mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isEditing ? 'Back to Profile' : 'Back to Members'}
        </Link>
        <h1 className="text-3xl font-bold text-stone-800">
          {isEditing ? 'Edit Member' : 'Add Family Member'}
        </h1>
        <p className="text-stone-500 mt-1">
          {isEditing ? 'Update the profile information' : 'Fill in what you know — you can always add more later'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Photo Upload */}
        <div>
          <label className="label">Profile Photo</label>
          <div
            className="flex items-center gap-5 cursor-pointer"
            onClick={() => photoInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 hover:border-amber-400 flex-shrink-0 transition-colors">
              {photoPreview || existingPhoto ? (
                <img
                  src={photoPreview || existingPhoto}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-amber-50 flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl">📷</span>
                  <span className="text-xs text-stone-400 text-center px-1">Add photo</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-600">Upload a profile photo</p>
              <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, GIF up to 10MB</p>
              <button type="button" className="mt-2 text-sm text-amber-600 font-semibold hover:text-amber-700">
                {photoPreview || existingPhoto ? 'Change photo' : 'Choose file'}
              </button>
            </div>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="label" htmlFor="name">Full Name *</label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Grandma Rose"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className={`input ${errors.name ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
            autoFocus={!isEditing}
          />
          {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Relationship */}
        <div>
          <label className="label" htmlFor="relationship">Relationship</label>
          <div className="relative">
            <select
              id="relationship"
              value={form.relationship}
              onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
              className="input appearance-none pr-8"
            >
              <option value="">Select relationship...</option>
              {RELATIONSHIPS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              ▾
            </div>
          </div>
          {!RELATIONSHIPS.includes(form.relationship) && form.relationship && (
            <p className="text-xs text-stone-400 mt-1">Custom relationship saved</p>
          )}
          {/* Allow custom input */}
          {form.relationship === 'Other' && (
            <input
              type="text"
              placeholder="Describe the relationship..."
              className="input mt-2"
              onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
            />
          )}
        </div>

        {/* Birthdate */}
        <div>
          <label className="label" htmlFor="birthdate">Birthdate</label>
          <input
            id="birthdate"
            type="date"
            value={form.birthdate}
            onChange={e => setForm(p => ({ ...p, birthdate: e.target.value }))}
            className="input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="label" htmlFor="bio">About</label>
          <textarea
            id="bio"
            placeholder="Share something special about this family member — their personality, stories, what makes them unique..."
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            rows={4}
            className="textarea"
          />
        </div>

        {/* Error */}
        {errors.submit && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 justify-center"
          >
            {submitting ? (
              <>
                <div className="spinner w-4 h-4" />
                {isEditing ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              <>
                <span>{isEditing ? '✓' : '+'}</span>
                {isEditing ? 'Save Changes' : 'Add Family Member'}
              </>
            )}
          </button>
          <Link
            to={isEditing ? `/members/${id}` : '/members'}
            className="btn-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

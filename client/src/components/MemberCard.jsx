import React from 'react';
import { Link } from 'react-router-dom';

function formatAge(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function MemberCard({ member }) {
  const age = formatAge(member.birthdate);

  return (
    <Link to={`/members/${member.id}`} className="group">
      <div className="card group-hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
        {/* Photo */}
        <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
          {member.photo_path ? (
            <img
              src={member.photo_path}
              alt={member.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">👤</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-stone-800 text-lg truncate">{member.name}</h3>
          {member.relationship && (
            <p className="text-amber-600 text-sm font-medium mt-0.5">{member.relationship}</p>
          )}
          {age !== null && (
            <p className="text-stone-500 text-sm mt-1">Age {age}</p>
          )}
          {member.bio && (
            <p className="text-stone-500 text-sm mt-2 line-clamp-2">{member.bio}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

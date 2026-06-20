import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberCard from '../components/MemberCard';
import FamilyTree from '../components/FamilyTree';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // grid | tree

  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => { setMembers(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.relationship || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Family Members</h1>
          <p className="text-stone-500 mt-1">{members.length} members in your family</p>
        </div>
        <Link to="/members/add" className="btn-primary">
          <span>+</span> Add Member
        </Link>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or relationship..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-stone-200 bg-white">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              view === 'grid' ? 'bg-amber-500 text-white' : 'text-stone-500 hover:bg-amber-50'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('tree')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              view === 'tree' ? 'bg-amber-500 text-white' : 'text-stone-500 hover:bg-amber-50'
            }`}
          >
            Tree
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-stone-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-100 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {!loading && view === 'grid' && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              {search ? (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-semibold text-stone-600">No members found for "{search}"</p>
                  <button onClick={() => setSearch('')} className="mt-4 text-amber-600 font-medium hover:underline">
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
                  <p className="font-semibold text-stone-600">No family members yet</p>
                  <Link to="/members/add" className="btn-primary inline-flex mt-4">
                    Add First Member
                  </Link>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Tree View */}
      {!loading && view === 'tree' && (
        <div className="card p-6">
          <FamilyTree members={search ? filtered : members} />
        </div>
      )}
    </div>
  );
}

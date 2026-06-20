import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberCard from '../components/MemberCard';

function StatCard({ icon, value, label, to }) {
  const inner = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-stone-800">{value}</p>
        <p className="text-stone-500 text-sm">{label}</p>
      </div>
    </div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Home() {
  const [members, setMembers] = useState([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const familyName = localStorage.getItem('familyName') || 'Our Family';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, mediaRes, messagesRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/media'),
          fetch('/api/messages'),
        ]);
        const [membersData, mediaData, messagesData] = await Promise.all([
          membersRes.json(),
          mediaRes.json(),
          messagesRes.json(),
        ]);
        setMembers(membersData);
        setMediaCount(mediaData.length);
        setMessageCount(messagesData.length);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentMembers = members.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-rose-400 p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-white/70 font-medium mb-2">Welcome to</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{familyName} 🌳</h1>
          <p className="text-white/80 text-lg max-w-lg">
            A warm place to share memories, stories, and love with the people who matter most.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/members/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition shadow-md">
              <span>👤</span> Add Family Member
            </Link>
            <Link to="/gallery" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition">
              <span>📸</span> Browse Gallery
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-16 -right-8 w-64 h-64 rounded-full bg-white/5"></div>
        <div className="absolute top-8 right-32 w-20 h-20 rounded-full bg-white/10"></div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-bold text-stone-700 mb-4">Family at a Glance</h2>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 h-20 animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon="👨‍👩‍👧‍👦" value={members.length} label="Members" to="/members" />
            <StatCard icon="📸" value={mediaCount} label="Memories" to="/gallery" />
            <StatCard icon="💌" value={messageCount} label="Stories" to="/messages" />
          </div>
        )}
      </div>

      {/* Recent Members */}
      {members.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-700">Family Members</h2>
            <Link to="/members" className="text-amber-600 font-semibold text-sm hover:text-amber-700">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">Start your family tree</h3>
          <p className="text-stone-500 mb-6">Add your first family member to get started.</p>
          <Link to="/members/add" className="btn-primary inline-flex">
            Add First Member
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-stone-700 mb-4">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/gallery" className="card p-5 hover:shadow-lg transition-shadow group">
            <div className="text-3xl mb-2">📸</div>
            <h3 className="font-bold text-stone-700 group-hover:text-amber-600 transition-colors">Photo Gallery</h3>
            <p className="text-stone-400 text-sm mt-1">Browse family photos, videos, and voice notes</p>
          </Link>
          <Link to="/messages" className="card p-5 hover:shadow-lg transition-shadow group">
            <div className="text-3xl mb-2">💌</div>
            <h3 className="font-bold text-stone-700 group-hover:text-amber-600 transition-colors">Stories & Messages</h3>
            <p className="text-stone-400 text-sm mt-1">Share memories and stories with the family</p>
          </Link>
          <Link to="/members" className="card p-5 hover:shadow-lg transition-shadow group">
            <div className="text-3xl mb-2">🌳</div>
            <h3 className="font-bold text-stone-700 group-hover:text-amber-600 transition-colors">Family Tree</h3>
            <p className="text-stone-400 text-sm mt-1">View your family connections</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

export default function Layout() {
  const [familyName, setFamilyName] = useState(() => {
    return localStorage.getItem('familyName') || 'Our Family';
  });
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(familyName);
  const [menuOpen, setMenuOpen] = useState(false);

  const saveFamilyName = () => {
    const trimmed = tempName.trim() || 'Our Family';
    setFamilyName(trimmed);
    localStorage.setItem('familyName', trimmed);
    setEditingName(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/members', label: 'Members', icon: '👨‍👩‍👧‍👦' },
    { to: '/gallery', label: 'Gallery', icon: '📸' },
    { to: '/messages', label: 'Stories', icon: '💌' },
  ];

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Family Name / Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌳</span>
              {editingName ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); saveFamilyName(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-3 py-1 rounded-lg text-stone-800 font-bold text-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-white w-48"
                    onBlur={saveFamilyName}
                  />
                  <button type="submit" className="text-white/80 hover:text-white text-sm">✓</button>
                </form>
              ) : (
                <button
                  onClick={() => { setTempName(familyName); setEditingName(true); }}
                  className="text-white font-bold text-xl hover:text-amber-100 transition-colors"
                  title="Click to rename"
                >
                  {familyName}
                </button>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-3 border-t border-white/20">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-100 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-stone-400 text-sm">
            Made with <span className="text-rose-400">♥</span> for our family
          </p>
        </div>
      </footer>
    </div>
  );
}

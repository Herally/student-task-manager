// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, CheckSquare, Tags, LogOut, GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Daftar Tugas', icon: CheckSquare },
  { to: '/categories', label: 'Kategori Matkul', icon: Tags },
]

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const userInitial = (currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform border border-white/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight block leading-tight">
                StudyTrack
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-400 tracking-wide block truncate max-w-[260px] sm:max-w-none">
                Manajemen Tugas Mahasiswa • Visualisasi Progres
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User profile & Action */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shadow-xs">
                {userInitial}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-100 truncate max-w-[140px] leading-tight">
                  {currentUser?.displayName || 'Mahasiswa'}
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari akun"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in shadow-2xl">
          <div className="pb-2.5 mb-2 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-100 truncate">
                {currentUser?.displayName || 'Mahasiswa'}
              </p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>

          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700/80'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                {label}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      )}
    </header>
  )
}

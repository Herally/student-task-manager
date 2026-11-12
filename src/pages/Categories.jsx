// src/pages/Categories.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tags, Plus, Trash2, Loader2, BookOpen, AlertCircle, ArrowLeft, Palette } from 'lucide-react'
import { useTask } from '../contexts/TaskContext'

const PRESET_COLORS = [
  { hex: '#6366f1', label: 'Indigo' },
  { hex: '#0ea5e9', label: 'Sky' },
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#ef4444', label: 'Rose' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#06b6d4', label: 'Cyan' },
]

export default function Categories() {
  const { categories, tasks, addCategory, deleteCategory } = useTask()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0].hex)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Count tasks associated with category name
  const taskCount = (catName) => tasks.filter((t) => t.category === catName).length

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      return setError('Nama mata kuliah / kategori wajib diisi.')
    }
    if (categories.some((c) => (c.name || '').toLowerCase() === trimmed.toLowerCase())) {
      return setError('Kategori mata kuliah ini sudah terdaftar.')
    }

    setLoading(true)
    setError('')
    try {
      await addCategory(trimmed, color)
      setName('')
      setColor(PRESET_COLORS[0].hex)
    } catch (err) {
      setError('Gagal menambahkan kategori: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, catName) {
    const count = taskCount(catName)
    const confirmed = window.confirm(
      count > 0
        ? `Mata kuliah "${catName}" memiliki ${count} tugas aktif. Hapus kategori ini? (Tugas tidak akan dihapus, hanya labelnya dilepas).`
        : `Hapus mata kuliah "${catName}"?`
    )
    if (!confirmed) return
    await deleteCategory(id)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Tugas</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kategori & Mata Kuliah
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelompokkan tugas berdasarkan mata kuliah atau proyek agar belajar lebih terstruktur.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Tambah Kategori */}
        <div className="md:col-span-5 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl h-fit space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/25">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Tambah Matkul Baru</h2>
              <p className="text-[11px] text-slate-400">Buat label warna untuk matkul semester ini</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nama Mata Kuliah <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Algoritma & Struktur Data"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Pilih Label Warna
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map(({ hex, label }) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    title={label}
                    className={`w-7 h-7 rounded-xl transition-all duration-150 cursor-pointer ${
                      color === hex
                        ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 shadow-md'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}

                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-xl border border-slate-700 cursor-pointer p-0 opacity-0 absolute inset-0"
                    title="Pilih warna kustom"
                  />
                  <div
                    className="w-7 h-7 rounded-xl border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors pointer-events-none"
                    title="Warna kustom"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Mata Kuliah</span>
            </button>
          </form>
        </div>

        {/* Daftar Kategori */}
        <div className="md:col-span-7 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Daftar Mata Kuliah Terdaftar</h2>
              <p className="text-[11px] text-slate-400">Total {categories.length} kategori aktif</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {categories.length} Matkul
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-500">
              <Tags className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <p className="text-xs font-semibold text-slate-300">Belum ada mata kuliah</p>
              <p className="text-[11px] text-slate-500">Tambahkan kategori pertamamu melalui formulir di samping.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {categories.map((cat) => {
                const count = taskCount(cat.name)
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800/90 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-slate-500" />
                          <span>{count} tugas terkait</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

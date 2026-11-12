// src/components/TaskModal.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Calendar,
  Flag,
  Bookmark,
  Plus,
  Trash2,
  ListTodo,
  CheckSquare
} from 'lucide-react'
import { useTask } from '../contexts/TaskContext'
import { breakdownTaskWithAI } from '../services/aiService'

const defaultForm = {
  title: '',
  description: '',
  category: '',
  deadline: '',
  priority: 'medium',
  status: 'todo',
  subtasks: [],
}

export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask, categories } = useTask()
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [newSubtaskInput, setNewSubtaskInput] = useState('')

  const isEdit = Boolean(task)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        category: task.category || '',
        deadline: task.deadline || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      })
    } else {
      setForm(defaultForm)
    }
  }, [task])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle adding a subtask to local form state
  function handleAddSubtask() {
    if (!newSubtaskInput.trim()) return
    const newSt = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text: newSubtaskInput.trim(),
      completed: false,
    }
    setForm((prev) => ({ ...prev, subtasks: [...prev.subtasks, newSt] }))
    setNewSubtaskInput('')
  }

  // Handle deleting subtask from local form state
  function handleRemoveSubtask(id) {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== id),
    }))
  }

  // AI Assistant auto-breakdown feature
  async function handleAutoBreakdown() {
    if (!form.title.trim()) {
      return setError('Isi judul tugas terlebih dahulu agar AI bisa menganalisis langkah pengerjaannya.')
    }

    setAiLoading(true)
    setError('')
    try {
      const plan = await breakdownTaskWithAI(form.title, form.category)
      const generatedSubtasks = (plan.subtasks || []).map((text, i) => ({
        id: `${Date.now()}_${i}`,
        text,
        completed: false,
      }))

      setForm((prev) => ({
        ...prev,
        subtasks: generatedSubtasks,
        priority: plan.suggestedPriority || prev.priority,
        description: prev.description
          ? `${prev.description}\n\n💡 Rencana AI: ${plan.summary}`
          : `${plan.summary}\n\n💡 Tips AI: ${plan.tips || ''}`,
      }))
    } catch (err) {
      setError('Gagal memecah tugas dengan AI: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      return setError('Judul tugas wajib diisi agar mudah dilacak.')
    }

    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        await updateTask(task.id, form)
      } else {
        await addTask(form)
      }
      onClose()
    } catch (err) {
      setError('Gagal menyimpan tugas: ' + (err.message || 'Terjadi kesalahan sistem.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {isEdit ? 'Ubah Rincian Tugas' : 'Tambah Tugas Kuliah Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Perbarui informasi dan tenggat waktu' : 'Catat tugas, kuis, atau proyek matkul'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin">
          {error && (
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold px-4 py-3 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title Field & AI Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Judul Tugas <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoBreakdown}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 px-2.5 py-1 rounded-lg transition-colors border border-indigo-500/30 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{aiLoading ? 'Menganalisis...' : 'Pecah dengan AI'}</span>
              </button>
            </div>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Contoh: Laporan Akhir Praktikum Jaringan Komputer"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Catatan / Instruksi
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Detail instruksi dosen, format penulisan, atau tautan referensi..."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mata Kuliah
                </label>
                <Link
                  to="/categories"
                  onClick={onClose}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                >
                  + Tambah
                </Link>
              </div>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">{categories.length === 0 ? 'Belum ada (Umum)' : '-- Pilih Mata Kuliah --'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-slate-900 text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Prioritas
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="low" className="bg-slate-900 text-white">🟢 Rendah (Santai)</option>
                <option value="medium" className="bg-slate-900 text-white">🟡 Sedang (Standar)</option>
                <option value="high" className="bg-slate-900 text-white">🔴 Tinggi (Mendesak)</option>
              </select>
            </div>
          </div>

          {/* Deadline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tenggat Waktu (Deadline)
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Status Progres
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="todo" className="bg-slate-900 text-white">Belum Mulai</option>
                <option value="inprogress" className="bg-slate-900 text-white">Sedang Dikerjakan</option>
                <option value="done" className="bg-slate-900 text-white">Selesai</option>
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Langkah Checklist Pengerjaan ({form.subtasks.length})
              </label>
              <span className="text-[11px] text-slate-500">
                Pecah tugas menjadi langkah mini
              </span>
            </div>

            {/* List of subtasks */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {form.subtasks.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <span className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px] border border-indigo-500/20">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-medium text-slate-200 truncate">{st.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    title="Hapus checklist ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Subtask input bar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
                placeholder="+ Ketik langkah kerja (tekan Enter)..."
                className="flex-1 px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>
        </form>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEdit ? 'Simpan Perubahan' : 'Buat Tugas'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

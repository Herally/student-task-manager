// src/components/TaskCard.jsx
import { useState } from 'react'
import { format, isPast, isToday } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckSquare,
  Sparkles
} from 'lucide-react'
import { useTask } from '../contexts/TaskContext'

const statusOptions = [
  { value: 'todo', label: 'Belum Mulai', icon: CircleDashed, color: 'text-slate-300 bg-slate-800/90 hover:bg-slate-800 border-slate-700' },
  { value: 'inprogress', label: 'Dikerjakan', icon: CircleDot, color: 'text-sky-300 bg-sky-950/50 hover:bg-sky-900/50 border-sky-800/60' },
  { value: 'done', label: 'Selesai', icon: CheckCircle2, color: 'text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 border-emerald-800/60' },
]

const priorityBadge = {
  low: { label: 'Rendah', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Sedang', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  high: { label: 'Tinggi', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
}

export default function TaskCard({ task, onEdit }) {
  const { deleteTask, updateTaskStatus, toggleSubtask, addSubtaskToTask, removeSubtaskFromTask } = useTask()
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtaskText, setNewSubtaskText] = useState('')

  const isDone = task.status === 'done'
  const isOverdue = Boolean(task.deadline && isPast(new Date(task.deadline)) && !isDone)
  const isDueToday = Boolean(task.deadline && isToday(new Date(task.deadline)) && !isDone)

  const priority = priorityBadge[task.priority] || priorityBadge.medium
  const currentStatus = statusOptions.find((s) => s.value === task.status) || statusOptions[0]
  const StatusIcon = currentStatus.icon

  // Subtask calculations
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []
  const subtasksCount = subtasks.length
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length
  const subtaskProgress = subtasksCount > 0 ? Math.round((completedSubtasksCount / subtasksCount) * 100) : 0

  function handleToggleNextStatus() {
    const sequence = ['todo', 'inprogress', 'done']
    const nextIdx = (sequence.indexOf(task.status) + 1) % sequence.length
    updateTaskStatus(task.id, sequence[nextIdx])
  }

  async function handleDelete() {
    if (window.confirm(`Hapus tugas "${task.title}"?`)) {
      await deleteTask(task.id)
    }
  }

  async function handleAddSubtask(e) {
    e.preventDefault()
    if (!newSubtaskText.trim()) return
    await addSubtaskToTask(task.id, newSubtaskText)
    setNewSubtaskText('')
  }

  return (
    <div
      className={`group relative flex flex-col justify-between bg-slate-900/90 rounded-3xl p-5 border transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 ${
        isDone
          ? 'border-slate-800/80 bg-slate-900/50 opacity-80'
          : isOverdue
          ? 'border-rose-500/50 shadow-rose-950/20 shadow-md'
          : 'border-slate-800 shadow-lg hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Meta: Category & Priority */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[170px]">
            {task.category || 'Umum'}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${priority.badge}`}
          >
            {priority.label}
          </span>
        </div>

        {/* Task Title */}
        <h3
          className={`text-base font-bold leading-snug line-clamp-2 transition-colors ${
            isDone ? 'line-through text-slate-500' : 'text-white group-hover:text-indigo-400'
          }`}
          title={task.title}
        >
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed whitespace-pre-line">
            {task.description}
          </p>
        )}

        {/* Interactive Subtasks Progress Bar & Toggle */}
        {subtasksCount > 0 && (
          <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pelacakan: {completedSubtasksCount}/{subtasksCount}</span>
              </span>
              <span className="text-indigo-400 font-bold">{subtaskProgress}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>{showSubtasks ? 'Sembunyikan Checklist' : 'Tampilkan Langkah Checklist'}</span>
              {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Expandable Interactive Subtasks Checklist */}
        {showSubtasks && (
          <div className="mt-2.5 space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 animate-fade-in text-xs">
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(task.id, st.id)}
                      className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span
                      className={`truncate text-xs ${
                        st.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                      }`}
                    >
                      {st.text}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeSubtaskFromTask(task.id, st.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    title="Hapus checklist ini"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add subtask form */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="+ Tambah langkah baru..."
                className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newSubtaskText.trim()}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Section: Deadline & Quick Status Toggle */}
      <div className="mt-5 pt-3.5 border-t border-slate-800 space-y-3">
        {/* Deadline Indicator & Controls */}
        <div className="flex items-center justify-between text-xs min-h-[20px]">
          {task.deadline ? (
            <div
              className={`inline-flex items-center gap-1.5 font-medium ${
                isDone
                  ? 'text-slate-500'
                  : isOverdue
                  ? 'text-rose-400 font-bold'
                  : isDueToday
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span>
                {isOverdue ? 'Terlambat • ' : isDueToday ? 'Hari Ini • ' : ''}
                {format(new Date(task.deadline), 'dd MMM yyyy, HH:mm', { locale: localeId })}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 italic">Tanpa tenggat waktu</span>
          )}

          {/* Action Buttons: Edit & Delete */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Edit rincian tugas"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Hapus tugas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Pill Button (Click to cycle status) */}
        <button
          type="button"
          onClick={handleToggleNextStatus}
          title="Klik untuk ubah status tugas secara interaktif"
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${currentStatus.color}`}
        >
          <span className="inline-flex items-center gap-1.5">
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </span>
          <span className="text-[10px] font-normal opacity-70">Ganti status ↻</span>
        </button>
      </div>
    </div>
  )
}

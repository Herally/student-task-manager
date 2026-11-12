// src/pages/Tasks.jsx
import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  CircleDot,
  CircleDashed,
  AlertCircle,
  X,
  Sparkles,
  LayoutGrid,
  Kanban,
  Grid2X2,
  ListTodo
} from 'lucide-react'
import { useTask } from '../contexts/TaskContext'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import { isPast } from 'date-fns'

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'todo', label: 'Belum Mulai' },
  { value: 'inprogress', label: 'Dikerjakan' },
  { value: 'done', label: 'Selesai' },
]

export default function Tasks() {
  const { tasks, categories, loading, updateTaskStatus } = useTask()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'kanban' | 'matrix'

  // Filters state
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !search.trim() ||
        (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || t.status === filterStatus
      const matchCat = filterCategory === 'all' || t.category === filterCategory
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority

      return matchSearch && matchStatus && matchCat && matchPriority
    })
  }, [tasks, search, filterStatus, filterCategory, filterPriority])

  const hasActiveFilter = search || filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all'

  function resetFilters() {
    setSearch('')
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterPriority('all')
  }

  function openAdd() {
    setEditTask(null)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditTask(task)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTask(null)
  }

  // Kanban columns definition (Dark Theme)
  const kanbanColumns = [
    { id: 'todo', label: 'Belum Mulai', icon: CircleDashed, color: 'border-slate-700 text-slate-300 bg-slate-800/80' },
    { id: 'inprogress', label: 'Sedang Dikerjakan', icon: CircleDot, color: 'border-sky-800 text-sky-400 bg-sky-950/40' },
    { id: 'done', label: 'Selesai', icon: CheckCircle2, color: 'border-emerald-800 text-emerald-400 bg-emerald-950/40' },
  ]

  // Eisenhower Matrix grouping
  const matrixQuadrants = useMemo(() => {
    const q1 = [] // Penting & Mendesak
    const q2 = [] // Penting tapi Tidak Mendesak
    const q3 = [] // Tidak Penting tapi Mendesak
    const q4 = [] // Tidak Penting & Santai

    filtered.forEach((t) => {
      const isUrgent = Boolean(t.deadline && (isPast(new Date(t.deadline)) || (new Date(t.deadline) - new Date()) < 3 * 24 * 60 * 60 * 1000))
      const isImportant = t.priority === 'high' || t.priority === 'medium'

      if (isImportant && isUrgent) q1.push(t)
      else if (isImportant && !isUrgent) q2.push(t)
      else if (!isImportant && isUrgent) q3.push(t)
      else q4.push(t)
    })

    return { q1, q2, q3, q4 }
  }, [filtered])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pelacakan Tugas Interaktif
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau dan kelola seluruh tugas kuliah dengan papan Kanban interaktif, checklist langkah pengerjaan, dan matriks prioritas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Papan Kanban Interaktif"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Matriks Eisenhower"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matriks Prioritas</span>
            </button>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan judul, instruksi, atau mata kuliah..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Select */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">Semua Mata Kuliah</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Priority Select */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="high">🔴 Prioritas Tinggi</option>
              <option value="medium">🟡 Prioritas Sedang</option>
              <option value="low">🟢 Prioritas Rendah</option>
            </select>

            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                title="Reset semua filter"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Tab Pills (Visible in Grid View) */}
        {viewMode === 'grid' && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800 overflow-x-auto scrollbar-thin">
            {STATUS_FILTERS.map((s) => {
              const count =
                s.value === 'all'
                  ? tasks.length
                  : tasks.filter((t) => t.status === s.value).length
              const active = filterStatus === s.value

              return (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{s.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      active ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Task View Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Menyinkronkan daftar tugas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Filter className="w-7 h-7" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">Tidak ada tugas ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              {hasActiveFilter
                ? 'Tidak ada tugas yang sesuai dengan kombinasi pencarian atau filter yang dipilih.'
                : 'Belum ada tugas kuliah yang dicatat. Buat tugas pertamamu atau gunakan StudyBot AI!'}
            </p>
          </div>
          {hasActiveFilter ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Hapus Filter
            </button>
          ) : (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tugas Pertama</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* 1. GRID VIEW */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
            <span>Menampilkan {filtered.length} tugas mahasiswa</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} />
            ))}
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* 2. INTERACTIVE KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id)
            const ColIcon = col.icon

            return (
              <div
                key={col.id}
                className="bg-slate-900/60 rounded-3xl p-4 border border-slate-800 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl border ${col.color}`}>
                      <ColIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">{col.label}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center">
                      <p className="text-xs font-medium">Tidak ada tugas di kolom ini</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={openEdit} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* 3. EISENHOWER PRIORITY MATRIX */
        <div className="space-y-4">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3">
            <Grid2X2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-xs text-indigo-200 leading-relaxed">
              <strong>Matriks Prioritas Eisenhower:</strong> Mengelompokkan tugas berdasarkan tingkat kepentingan dan urgensi tenggat waktu untuk mencegah kepanikan saat mendekati ujian atau tugas akhir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Q1: Mendesak & Penting */}
            <div className="bg-rose-950/20 rounded-3xl p-5 border border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-bold text-rose-200">Kuadran 1: Mendesak & Penting</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {matrixQuadrants.q1.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-rose-300/80">Dikerjakan sekarang juga (Prioritas tinggi / deadline sangat dekat)</p>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {matrixQuadrants.q1.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">Aman! Tidak ada tugas di kuadran ini.</p>
                ) : (
                  matrixQuadrants.q1.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} />)
                )}
              </div>
            </div>

            {/* Q2: Penting tapi Santai */}
            <div className="bg-indigo-950/20 rounded-3xl p-5 border border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-bold text-indigo-200">Kuadran 2: Rencana & Dicicil</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {matrixQuadrants.q2.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-indigo-300/80">Penting untuk masa depan (Proyek besar, belajar UTS/UAS jauh hari)</p>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {matrixQuadrants.q2.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">Belum ada tugas di kuadran ini.</p>
                ) : (
                  matrixQuadrants.q2.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} />)
                )}
              </div>
            </div>

            {/* Q3: Mendesak tapi Kurang Penting */}
            <div className="bg-amber-950/20 rounded-3xl p-5 border border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold text-amber-200">Kuadran 3: Selesaikan Cepat</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {matrixQuadrants.q3.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80">Tenggat dekat namun bobot nilai ringan (Kuis harian, presensi online)</p>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {matrixQuadrants.q3.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">Kosong.</p>
                ) : (
                  matrixQuadrants.q3.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} />)
                )}
              </div>
            </div>

            {/* Q4: Santai / Fleksibel */}
            <div className="bg-slate-900/40 rounded-3xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <h3 className="text-sm font-bold text-slate-200">Kuadran 4: Fleksibel / Baca Tambahan</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                  {matrixQuadrants.q4.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Materi pengayaan atau tugas opsional untuk dikerjakan saat senggang</p>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {matrixQuadrants.q4.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">Kosong.</p>
                ) : (
                  matrixQuadrants.q4.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} />)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal Dialog */}
      {modalOpen && <TaskModal task={editTask} onClose={closeModal} />}
    </div>
  )
}

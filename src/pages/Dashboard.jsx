// src/pages/Dashboard.jsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Plus,
  ArrowRight, Sparkles, BookOpen, Calendar, Target, CheckSquare, Zap, Bot
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useTask } from '../contexts/TaskContext'
import { useAuth } from '../contexts/AuthContext'
import { format, isPast } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

const STATUS_COLORS = ['#475569', '#38bdf8', '#10b981']

export default function Dashboard() {
  const { tasks, stats, loading } = useTask()
  const { currentUser } = useAuth()

  const pieData = [
    { name: 'Belum Mulai', value: stats.todo },
    { name: 'Dikerjakan', value: stats.inProgress },
    { name: 'Selesai', value: stats.done },
  ]

  // Category breakdown for chart
  const categoryData = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      const cat = t.category || 'Umum'
      map[cat] = (map[cat] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [tasks])

  // Upcoming deadlines (nearest first)
  const upcoming = useMemo(() => {
    return tasks
      .filter((t) => t.deadline && !isPast(new Date(t.deadline)) && t.status !== 'done')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
  }, [tasks])

  // Completion progress percentage
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  // Productivity Level Badge
  const productivityLevel = useMemo(() => {
    if (stats.total === 0) return { title: 'Mulai Langkah Pertama', color: 'text-slate-400' }
    if (completionRate >= 80) return { title: 'Sangat Produktif! 🏆', color: 'text-emerald-400' }
    if (completionRate >= 50) return { title: 'On Track! 🔥', color: 'text-indigo-400' }
    if (completionRate >= 20) return { title: 'Sedang Berprogres ⚡', color: 'text-sky-400' }
    return { title: 'Perlu Gaspol 🎯', color: 'text-amber-400' }
  }, [completionRate, stats.total])

  const statCards = [
    {
      label: 'Total Tugas',
      value: stats.total,
      hint: `${stats.todo} belum disentuh`,
      icon: ListTodo,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      label: 'Selesai',
      value: stats.done,
      hint: `${completionRate}% tugas rampung`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Sedang Dikerjakan',
      value: stats.inProgress,
      hint: 'Dalam proses aktif',
      icon: TrendingUp,
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      label: 'Checklist Subtask',
      value: `${stats.completedSubtasks || 0}/${stats.totalSubtasks || 0}`,
      hint: `${stats.subtaskRate || 0}% langkah selesai`,
      icon: CheckSquare,
      color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Memuat dashboard tugas mahasiswa...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Welcome Banner Card with Official App Title */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>StudyTrack Academic Hub</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Aplikasi Manajemen Tugas Mahasiswa Berbasis Web dengan Pelacakan Tugas Interaktif dan Visualisasi Progres
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Selamat datang kembali, <strong className="text-white">{currentUser?.displayName || 'Sobat Mahasiswa'}</strong>! {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}. 
              {stats.overdue > 0 
                ? ` Kamu memiliki ${stats.overdue} tugas yang melewati deadline. Yuk cicil satu per satu!`
                : ` Sejauh ini ${completionRate}% tugasmu sudah selesai. Pertahankan performamu!`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Buka Pelacakan Tugas</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Interactive Progress Bar & Gamification Header */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/25 border border-white/10">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Visualisasi Progres Tugas</h2>
              <span className={`text-xs font-bold ${productivityLevel.color}`}>
                • {productivityLevel.title}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {stats.done} dari {stats.total} tugas selesai ({completionRate}%) • {stats.completedSubtasks || 0} subtask checklist tercentang
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Tingkat Penyelesaian Keseluruhan</span>
            <span className="text-indigo-400">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, hint, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-lg hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Status Breakdown */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">Distribusi Status Tugas</h2>
              <span className="text-xs font-semibold text-slate-400">{stats.total} total</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Peta kemajuan tugas akademik saat ini</p>
          </div>

          {stats.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ListTodo className="w-12 h-12 mb-2 stroke-1 text-slate-600" />
              <p className="text-xs font-semibold">Belum ada data tugas</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Subject Breakdown */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">Beban per Mata Kuliah</h2>
              <span className="text-xs font-semibold text-slate-400">{categoryData.length} matkul</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Jumlah tugas di tiap kategori mata kuliah</p>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <BookOpen className="w-12 h-12 mb-2 stroke-1 text-slate-600" />
              <p className="text-xs font-semibold">Belum ada tugas berkategori</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">Tenggat Terdekat</h2>
              <Link to="/tasks" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4">5 tugas yang harus segera diselesaikan</p>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mb-2 stroke-1 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300">Semua deadline beres!</p>
              <p className="text-[11px] text-slate-500">Tidak ada tugas mendesak saat ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800/90 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                        {task.category || 'Umum'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {format(new Date(task.deadline), 'dd MMM, HH:mm', { locale: localeId })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

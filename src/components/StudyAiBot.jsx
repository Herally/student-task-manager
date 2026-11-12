// src/components/StudyAiBot.jsx
import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  Send,
  X,
  ListPlus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Loader2,
  Lightbulb,
  Plus,
  Settings,
  Key,
  ExternalLink
} from 'lucide-react'
import { useTask } from '../contexts/TaskContext'
import {
  breakdownTaskWithAI,
  chatWithStudyAI,
  getStoredApiKey,
  setStoredApiKey
} from '../services/aiService'

export default function StudyAiBot() {
  const { tasks, categories, addTask } = useTask()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('generator') // 'generator' | 'chat'
  const [showSettings, setShowSettings] = useState(false)

  // API Key management
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)

  // Load API key on mount
  useEffect(() => {
    const key = getStoredApiKey()
    setHasApiKey(Boolean(key))
    setApiKeyInput(key || '')
  }, [isOpen])

  function handleSaveKey(e) {
    e?.preventDefault()
    setStoredApiKey(apiKeyInput)
    setHasApiKey(Boolean(apiKeyInput.trim()))
    setShowSettings(false)
    alert(
      apiKeyInput.trim()
        ? 'API Key Gemini berhasil disimpan! StudyBot AI sekarang aktif dengan kecerdasan penuh 🚀'
        : 'API Key dihapus. Kembali ke mode respons cepat.'
    )
  }

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Halo Sobat Mahasiswa! 🎓 Saya **StudyBot AI**, asisten pembuat & perencana tugas kuliahmu.\n\nPunya tugas yang membingungkan atau banyak tahap? Saya siap bantu memecahnya menjadi langkah-langkah praktis dan checklist interaktif!',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Generator state
  const [genTitle, setGenTitle] = useState('')
  const [genCategory, setGenCategory] = useState('')
  const [genDeadline, setGenDeadline] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [genResult, setGenResult] = useState(null)
  const [genAdded, setGenAdded] = useState(false)

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab, isOpen])

  // Handle send message
  async function handleSendMessage(e) {
    e?.preventDefault()
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg = { id: Date.now().toString(), sender: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const reply = await chatWithStudyAI(text, tasks)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Maaf, terjadi gangguan sementara saat memproses jawaban. Silakan coba lagi ya.',
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  // Handle Quick Prompt
  function handleQuickPrompt(promptText) {
    setChatInput(promptText)
    setActiveTab('chat')
  }

  // Handle Task Breakdown Generator
  async function handleGenerateBreakdown(e) {
    e?.preventDefault()
    if (!genTitle.trim()) return

    setGenLoading(true)
    setGenAdded(false)
    try {
      const result = await breakdownTaskWithAI(genTitle, genCategory)
      setGenResult(result)
    } catch (err) {
      alert('Gagal membuat rencana tugas: ' + err.message)
    } finally {
      setGenLoading(false)
    }
  }

  // Inject generated plan directly into Firestore
  async function handleSaveAITaskToFirestore() {
    if (!genResult || !genTitle.trim()) return

    const subtasksList = (genResult.subtasks || []).map((text, idx) => ({
      id: `${Date.now()}_${idx}`,
      text,
      completed: false,
    }))

    const taskPayload = {
      title: genTitle.trim(),
      description: `${genResult.summary}\n\n💡 Tips AI: ${genResult.tips || ''}`,
      category: genCategory || 'Umum',
      deadline: genDeadline || '',
      priority: genResult.suggestedPriority || 'medium',
      status: 'todo',
      subtasks: subtasksList,
    }

    try {
      await addTask(taskPayload)
      setGenAdded(true)
      setTimeout(() => {
        setGenTitle('')
        setGenCategory('')
        setGenDeadline('')
        setGenResult(null)
        setGenAdded(false)
      }, 2500)
    } catch (err) {
      alert('Gagal menyimpan tugas ke Firestore: ' + err.message)
    }
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30 cursor-pointer"
          aria-label="Buka StudyBot AI Asisten Tugas"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold tracking-tight">StudyBot AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                {hasApiKey ? 'Gemini Live' : 'Asisten'}
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium">Bantu pecah & rencanakan tugas</p>
          </div>
        </button>
      )}

      {/* Main AI Chat & Generator Dialog Widget (Dark Mode) */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-[440px] h-[640px] max-h-[90vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header Bar */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/10">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">StudyBot AI</h3>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      hasApiKey
                        ? 'text-emerald-400 bg-emerald-500/20 border-emerald-400/30'
                        : 'text-amber-300 bg-amber-500/20 border-amber-400/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {hasApiKey ? 'Gemini AI Aktif' : 'Mode Offline'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Asisten Pelacak & Pembuat Tugas</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  showSettings ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Pengaturan API Key Gemini"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Asisten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Modal (API Key Configuration) */}
          {showSettings && (
            <div className="p-4 bg-slate-950 text-white border-b border-slate-800 animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Koneksi Google Gemini API (Gratis)</span>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tempel API Key dari Google AI Studio agar StudyBot bisa menjawab pertanyaan apa pun secara live (seperti ChatGPT).
              </p>

              <form onSubmit={handleSaveKey} className="space-y-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Tempel API Key: AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between gap-2">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    <span>Dapatkan API Key Gratis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Simpan Key
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab Switcher (Dark Mode) */}
          <div className="flex items-center p-1.5 bg-slate-950 border-b border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-slate-900 text-indigo-300 border border-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pecah Tugas Otomatis</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-slate-900 text-indigo-300 border border-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Konsultasi AI</span>
            </button>
          </div>

          {/* TAB 1: GENERATOR PEMUTUS TUGAS */}
          {activeTab === 'generator' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin bg-slate-950/40">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                    Masukkan judul tugas kuliahmu. AI akan menganalisis dan membaginya ke dalam subtask checklist yang siap dieksekusi!
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateBreakdown} className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Judul Tugas / Topik <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={genTitle}
                    onChange={(e) => setGenTitle(e.target.value)}
                    placeholder="Misal: Makalah Etika AI 10 Halaman atau Proyek CRUD React"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Mata Kuliah
                    </label>
                    <select
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">Umum</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} className="bg-slate-900 text-white">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Target Tenggat
                    </label>
                    <input
                      type="datetime-local"
                      value={genDeadline}
                      onChange={(e) => setGenDeadline(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={genLoading || !genTitle.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {genLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>StudyBot sedang menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Analisis & Rancang Checklist Tugas</span>
                    </>
                  )}
                </button>
              </form>

              {/* Breakdown Results */}
              {genResult && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-indigo-500/30 shadow-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-lg border border-indigo-500/25">
                      Rekomendasi Rencana Tugas
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {genResult.estimatedHours}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {genResult.summary}
                  </p>

                  {/* Checklist Subtasks */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-white block">
                      Checklist Langkah Kerja ({genResult.subtasks?.length || 0} Tahap):
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {genResult.subtasks?.map((st, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        >
                          <span className="w-4 h-4 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {genResult.tips && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                      <strong>💡 Tips Sukses:</strong> {genResult.tips}
                    </div>
                  )}

                  {/* Save to Firestore Button */}
                  <button
                    onClick={handleSaveAITaskToFirestore}
                    disabled={genAdded}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                      genAdded
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-101'
                    }`}
                  >
                    {genAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Tersimpan di Daftar Tugas! 🎉</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>Masukkan Otomatis ke Daftar Tugas</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT KONSULTASI AKADEMIK */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
              {/* Quick Prompts Bar */}
              <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                <button
                  onClick={() => handleQuickPrompt('Bagaimana struktur standar makalah ilmiah yang baik?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition-colors whitespace-nowrap shrink-0 border border-slate-800 cursor-pointer"
                >
                  📄 Struktur Makalah
                </button>
                <button
                  onClick={() => handleQuickPrompt('Tips mengatasi rasa malas dan cicil tugas kuliah')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition-colors whitespace-nowrap shrink-0 border border-slate-800 cursor-pointer"
                >
                  💪 Lawan Malas
                </button>
                <button
                  onClick={() => handleQuickPrompt('Bagaimana langkah debug error dalam tugas coding?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition-colors whitespace-nowrap shrink-0 border border-slate-800 cursor-pointer"
                >
                  💻 Debug Coding
                </button>
                <button
                  onClick={() => handleQuickPrompt('Beri saya tips membagi waktu belajar ujian yang efektif')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition-colors whitespace-nowrap shrink-0 border border-slate-800 cursor-pointer"
                >
                  🕒 Tips Ujian
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {messages.map((m) => {
                  const isBot = m.sender === 'bot'
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                    >
                      {isBot && (
                        <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-white/10">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isBot
                            ? 'bg-slate-900 text-slate-100 border border-slate-800 shadow-md whitespace-pre-line'
                            : 'bg-indigo-600 text-white font-medium rounded-br-none shadow-md'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  )
                })}

                {chatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-fit text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>StudyBot sedang meracik jawaban...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    hasApiKey
                      ? 'Tanya apa saja seputar tugas, skripsi, atau materi kuliah...'
                      : 'Tanya tips tugas (atau pasang API Key Gemini via ikon ⚙️)'
                  }
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}

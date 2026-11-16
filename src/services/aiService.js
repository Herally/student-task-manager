// src/services/aiService.js

/**
 * Academic AI Assistant Service for Student Task Manager.
 * Optimized for ultra-fast, zero-lag responses.
 * Dynamically detects active Google Gemini models to avoid 404 Model Not Found errors.
 */

let cachedModelName = null

export function getStoredApiKey() {
  return localStorage.getItem('studybot_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
}

export function setStoredApiKey(key) {
  cachedModelName = null // Reset cache when key changes
  if (key) {
    localStorage.setItem('studybot_gemini_key', key.trim())
  } else {
    localStorage.removeItem('studybot_gemini_key')
  }
}

/**
 * Dynamically query Google AI Studio for the best active model available for this API Key.
 */
async function getBestModelName(apiKey) {
  if (cachedModelName) return cachedModelName

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`)
    if (res.ok) {
      const data = await res.json()
      const available = data.models?.filter(m => m.supportedGenerationMethods?.includes('generateContent')) || []

      // Prioritize flash models (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash)
      const flashModel = available.find(m => m.name?.includes('flash') && !m.name?.includes('8b'))
        || available.find(m => m.name?.includes('flash'))
        || available[0]

      if (flashModel?.name) {
        cachedModelName = flashModel.name // e.g. "models/gemini-2.0-flash"
        return cachedModelName
      }
    }
  } catch (err) {
    console.warn('Could not auto-list models, using default:', err)
  }

  // Fallback defaults
  return 'models/gemini-2.0-flash'
}

// Smart template matching for university assignments
function generateIntelligentAcademicBreakdown(title, category = '') {
  const lower = (title + ' ' + category).toLowerCase()

  // 1. Makalah / Esai / Paper Ilmiah
  if (lower.includes('makalah') || lower.includes('paper') || lower.includes('esai') || lower.includes('essay') || lower.includes('karya ilmiah')) {
    return {
      summary: `Rencana sistematis penyusunan makalah akademik "${title}". Disusun berdasar kaidah penulisan ilmiah standar perguruan tinggi.`,
      subtasks: [
        'Tentukan rumusan masalah & batasan topik bahasan',
        'Cari 3-5 literatur/jurnal rujukan relevan (Google Scholar / Scopus)',
        'Susun Bab I: Latar Belakang, Rumusan Masalah, dan Tujuan',
        'Susun Bab II: Tinjauan Pustaka & Landasan Teori',
        'Susun Bab III: Pembahasan & Analisis Kritis',
        'Susun Bab IV: Kesimpulan dan Saran Solutif',
        'Tulis Daftar Pustaka format standar (APA / IEEE / Chicago)',
        'Proofreading akhir: Cek typo, layout margin 4-4-3-3, dan ekspor ke PDF'
      ],
      estimatedHours: '8-12 Jam (Dapat dicicil 3 hari)',
      suggestedPriority: 'high',
      tips: 'Gunakan reference manager seperti Mendeley atau Zotero agar kutipan dan daftar pustaka otomatis rapi.'
    }
  }

  // 2. Pemrograman / Coding / Web / Mobile App
  if (lower.includes('coding') || lower.includes('web') || lower.includes('aplikasi') || lower.includes('program') || lower.includes('basis data') || lower.includes('database') || lower.includes('frontend') || lower.includes('backend') || lower.includes('react') || lower.includes('api') || lower.includes('javascript') || lower.includes('network') || lower.includes('jaringan')) {
    return {
      summary: `Rencana pengerjaan proyek teknik/jaringan/software "${title}". Berfokus pada perancangan, konfigurasi, dan pengujian fungsionalitas.`,
      subtasks: [
        'Analisis kebutuhan sistem, topologi jaringan/arsitektur sistem',
        'Setup environment, repository Git & tools konfigurasi',
        'Implementasi logika utama / konfigurasi protokol & routing',
        'Kembangkan antarmuka pengguna atau modul fungsional',
        'Uji alur data dan pengujian koneksi / packet simulation',
        'Testing fungsionalitas, edge-cases, dan perbaikan error/bug',
        'Susun dokumentasi teknis & cara running / laporan topologi',
        'Persiapkan demonstrasi proyek untuk sesi asistensi dosen'
      ],
      estimatedHours: '8-14 Jam',
      suggestedPriority: 'high',
      tips: 'Simpan backup konfigurasi dan riwayat git commit secara berkala untuk setiap milestone.'
    }
  }

  // 3. Laporan Praktikum
  if (lower.includes('praktikum') || lower.includes('laboratorium') || lower.includes('lab') || lower.includes('modul')) {
    return {
      summary: `Panduan pelaporan praktikum "${title}". Menitikberatkan pada pengolahan data hasil uji laboratorium dan analisis fenomena.`,
      subtasks: [
        'Salin tujuan percobaan, alat & bahan, serta prosedur kerja dari modul',
        'Tabulasikan data mentah hasil pengamatan praktikum ke dalam spreadsheet',
        'Lakukan perhitungan matematis & visualisasikan grafik tren data',
        'Tulis Pembahasan: Bandingkan hasil uji dengan teori referensi',
        'Jawab pertanyaan tugas pasca-praktikum dari asisten lab',
        'Tarik kesimpulan spesifik yang menjawab tujuan praktikum',
        'Lampirkan logbook asistensi / dokumentasi foto percobaan'
      ],
      estimatedHours: '4-6 Jam',
      suggestedPriority: 'medium',
      tips: 'Jelaskan faktor galat (error percentage) jika hasil percobaan berbeda dengan teori ideal di modul.'
    }
  }

  // 4. Bahasa Inggris / Presentasi / Essay
  if (lower.includes('inggris') || lower.includes('english') || lower.includes('presentasi') || lower.includes('ppt') || lower.includes('speaking')) {
    return {
      summary: `Rencana pengerjaan tugas bahasa Inggris / presentasi "${title}".`,
      subtasks: [
        'Tentukan tema utama dan outline poin argumen',
        'Susun vocabulary dan frasa akademik (academic transitional words)',
        'Tulis draf pertama (Introduction, Body Paragraphs, Conclusion)',
        'Grammar & spell checking menggunakan Grammarly atau kamus resmi',
        'Buat slide presentasi visual (maksimal 6-8 slide ringkas)',
        'Latihan pelafalan (pronunciation) dan intonasi presentasi',
        'Review final sebelum jadwal pengumpulan'
      ],
      estimatedHours: '4-6 Jam',
      suggestedPriority: 'medium',
      tips: 'Gunakan active voice dan variasi kosakata agar tulisan atau presentasi lebih meyakinkan.'
    }
  }

  // Default General Academic Task Breakdown
  return {
    summary: `Pecahan langkah pengerjaan terstruktur untuk tugas "${title}".`,
    subtasks: [
      `Pahami rubrik penilaian dan instruksi tugas "${title}"`,
      'Kumpulkan bahan bacaan materi dan sumber data yang diperlukan',
      'Buat kerangka garis besar (outline) pengerjaan awal',
      'Eksekusi pengerjaan draf bagian utama secara bertahap',
      'Review kelengkapan hasil kerja terhadap kriteria dosen',
      'Finishing dan submit sebelum tenggat waktu ditentukan'
    ],
    estimatedHours: '4-6 Jam',
    suggestedPriority: 'medium',
    tips: 'Kerjakan bagian yang paling sulit terlebih dahulu di pagi hari saat fokus otak masih prima.'
  }
}

/**
 * Breakdown a task into manageable subtasks using AI.
 */
export async function breakdownTaskWithAI(taskTitle, categoryName = '') {
  if (!taskTitle || !taskTitle.trim()) {
    throw new Error('Judul tugas harus diisi terlebih dahulu.')
  }

  const apiKey = getStoredApiKey().trim()

  // Try live Gemini if API Key is configured
  if (apiKey) {
    try {
      const modelPath = await getBestModelName(apiKey)
      const prompt = `Kamu adalah asisten akademik pintar mahasiswa universitas di Indonesia.
Pecah tugas kuliah berikut menjadi langkah-langkah terstruktur:
Judul Tugas: "${taskTitle}"
Mata Kuliah: "${categoryName || 'Umum'}"

Keluarkan output DALAM FORMAT JSON SAJA tanpa markdown block atau teks lain:
{
  "summary": "penjelasan singkat strategi 1-2 kalimat",
  "subtasks": ["Langkah 1", "Langkah 2", "Langkah 3", "Langkah 4", "Langkah 5", "Langkah 6"],
  "estimatedHours": "contoh: 6-8 Jam",
  "suggestedPriority": "high" | "medium" | "low",
  "tips": "1 tips praktis mengerjakan tugas ini"
}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 7000)

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed.subtasks) && parsed.subtasks.length > 0) {
            return parsed
          }
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to built-in academic intelligence engine:', e)
    }
  }

  // Built-in intelligent academic engine (Instant, 0ms latency)
  return generateIntelligentAcademicBreakdown(taskTitle, categoryName)
}

/**
 * Chat conversation with the AI Study Assistant.
 * Dynamically queries the model that is active for the user's API Key.
 */
export async function chatWithStudyAI(userMessage, activeTasks = []) {
  if (!userMessage || !userMessage.trim()) return 'Halo! Ada tugas kuliah yang bisa saya bantu analisa atau rencanakan?'

  const apiKey = getStoredApiKey().trim()
  const q = userMessage.trim().toLowerCase()

  // 1. JIKA MEMILIKI API KEY GEMINI -> PANGGIL MODEL AKTIF SECARA DINAMIS
  if (apiKey) {
    const tasksContext = activeTasks.length > 0
      ? `Daftar tugas kuliah mahasiswa saat ini:\n` + activeTasks.slice(0, 6).map(t => `- "${t.title}" (Status: ${t.status}, Matkul: ${t.category || 'Umum'}, Deadline: ${t.deadline || 'tidak ada'})`).join('\n')
      : 'Mahasiswa belum memiliki tugas di daftar.'

    const promptText = `Peran: Kamu adalah StudyBot AI, asisten dan mentor akademik cerdas mahasiswa Indonesia pada web "Aplikasi Manajemen Tugas Mahasiswa Berbasis Web dengan Pelacakan Tugas Interaktif dan Visualisasi Progres".
Karakter: Ramah, solutif, cerdas, berikan jawaban to-the-point dan jelas dengan bahasa Indonesia yang santun.

Konteks Tugas Mahasiswa Saat Ini:
${tasksContext}

Pertanyaan Mahasiswa:
${userMessage}`

    try {
      const modelPath = await getBestModelName(apiKey)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }]
            }
          ]
        })
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text
      } else {
        const errData = await response.json().catch(() => ({}))
        const errorMsg = errData?.error?.message || `HTTP ${response.status} (${response.statusText})`
        return `⚠️ **Kendala pada Kunci Gemini:**\n\n` +
          `*Pesan Google:* \`${errorMsg}\`\n\n` +
          `💡 *Solusi Cepat:* Pastikan API Key di ikon ⚙️ disalin dari akun **Gmail pribadi** di [Google AI Studio](https://aistudio.google.com/app/apikey) dan berawalan **AIzaSy...**.`
      }
    } catch (fetchErr) {
      console.warn('Gemini live fetch error, using instant fallback:', fetchErr)
    }
  }

  // 2. OFFLINE ENGINE SUPER CEPAT (INSTAN 0MS TANPA LAG)

  // A. Cara Belajar Efektif / Tips Belajar (termasuk typo "efetif", "bljr")
  if (q.includes('belajar') || q.includes('efetif') || q.includes('efektif') || q.includes('metode') || q.includes('cara') || q.includes('bljr')) {
    return `📚 **5 Cara Belajar Efektif Menurut Sains untuk Mahasiswa:**\n\n` +
      `1. **Active Recall (Uji Diri Sendiri):**\n` +
      `   Jangan hanya membaca ulang slide atau modul! Tutup buku, lalu tuliskan atau jelaskan kembali konsep materi tersebut dengan kata-katamu sendiri.\n\n` +
      `2. **Teknik Feynman:**\n` +
      `   Coba jelaskan materi yang sulit seolah-olah kamu menjelaskannya kepada anak berusia 10 tahun. Jika kamu tersendat di bagian tertentu, di situlah letak konsep yang belum kamu kuasai.\n\n` +
      `3. **Spaced Repetition (Pengulangan Berkala):**\n` +
      `   Ulangi materi pada interval waktu: H+1, H+3, H+7, dan H+14. Ini mencegah efek lupa (*forgetting curve*).\n\n` +
      `4. **Teknik Pomodoro (25 + 5 Menit):**\n` +
      `   Fokus belajar penuh tanpa HP selama 25 menit, lalu istirahat 5 menit. Ulangi 4 siklus sebelum istirahat panjang.\n\n` +
      `5. **Pecah Tugas Jadi Subtask Kecil:**\n` +
      `   Buka tab **Pecah Tugas Otomatis** di atas. Otak manusia lebih mudah memulai pekerjaan saat dibagi menjadi langkah-langkah kecil!`
  }

  // B. Manajemen Waktu / Jadwal
  if (q.includes('jadwal') || q.includes('bagi waktu') || q.includes('time management') || q.includes('cicil') || q.includes('waktu')) {
    return `🕒 **Tips Manajemen Waktu & Menyusun Jadwal Belajar Efektif:**\n\n` +
      `1. **Terapkan Teknik Pomodoro**: Belajar fokus 25 menit, lalu istirahat 5 menit. Setelah 4 sesi, ambil istirahat panjang 15-20 menit.\n` +
      `2. **Aturan 2 Menit**: Jika ada tugas kecil yang bisa selesai dalam 2 menit, kerjakan seketika.\n` +
      `3. **Gunakan Matriks Eisenhower**: Dahulukan tugas yang *Mendesak & Penting* sebelum tugas yang santai.\n` +
      `4. **Blok Waktu Harian**: Sisihkan 2 jam tetap setiap sore/malam khusus untuk menyelesaikan subtask tugas kuliah di aplikasi ini.`
  }

  // C. Makalah / Laporan / Skripsi
  if (q.includes('makalah') || q.includes('skripsi') || q.includes('abstrak') || q.includes('bab') || q.includes('karya ilmiah') || q.includes('laporan')) {
    return `📄 **Struktur Standar Makalah & Laporan Ilmiah Perguruan Tinggi:**\n\n` +
      `• **Bab I Pendahuluan**: Latar belakang fenomena, rumusan masalah (5W+1H), tujuan, dan batasan masalah.\n` +
      `• **Bab II Tinjauan Pustaka**: Teori dasar, penelitian terdahulu yang relevan, serta kerangka pemikiran.\n` +
      `• **Bab III Metodologi / Pembahasan**: Data hasil kajian, perbandingan dengan teori, analisis kritis, dan solusi.\n` +
      `• **Bab IV Penutup**: Kesimpulan konkret dan saran pengembangan.\n\n` +
      `💡 *Tips Sitasi*: Pastikan merujuk jurnal terindeks SINTA atau Scopus 5 tahun terakhir, dan gunakan format APA 7th Edition.`
  }

  // D. Koding / Pemrograman
  if (q.includes('coding') || q.includes('error') || q.includes('bug') || q.includes('react') || q.includes('javascript') || q.includes('python') || q.includes('web') || q.includes('koding')) {
    return `💻 **Langkah Debugging & Menyelesaikan Tugas Pemrograman:**\n\n` +
      `1. **Baca Pesan Error di Console**: Perhatikan nama file dan nomor baris penyebab error (Stack Trace).\n` +
      `2. **Gunakan console.log() atau Debugger**: Pantau nilai variabel dan state sebelum dan sesudah fungsi dieksekusi.\n` +
      `3. **Pecah Masalah Jadi Logika Terkecil**: Jangan langsung selesaikan semua fungsi sekaligus; selesaikan alur input-proses-output per komponen.\n` +
      `4. **Cek Edge Cases**: Uji apakah input kosong (null/undefined) sudah di-handle dengan baik agar aplikasi tidak crash.`
  }

  // E. Jaringan Komputer
  if (q.includes('network') || q.includes('jaringan') || q.includes('cisco') || q.includes('ip address') || q.includes('subnet')) {
    return `🌐 **Panduan Tugas Mata Kuliah Jaringan Komputer (Computer Networks):**\n\n` +
      `1. **Pemahaman Topologi**: Pastikan diagram topologi (Star/Mesh) dan pengalamatan IP (CIDR / Subnetting) sudah benar.\n` +
      `2. **Uji Konektivitas**: Gunakan perintah ping dan traceroute untuk memastikan paket data bisa berpindah antar segmen.\n` +
      `3. **Routing & VLAN**: Periksa konfigurasi gateway dan tabel routing jika antar subnet belum bisa saling terhubung.\n` +
      `4. **Dokumentasikan Hasil**: Ambil tangkapan layar output pengujian untuk dilampirkan ke laporan akhir.`
  }

  // F. Rasa Malas / Prokrastinasi
  if (q.includes('malas') || q.includes('prokrastinasi') || q.includes('semangat') || q.includes('burnout')) {
    return `💪 **Mengatasi Rasa Malas & Menunda Tugas (Procrastination):**\n\n` +
      `• **Turunkan Hambatan Mulai**: Cukup buka laptop dan kerjakan 5 menit pertama tanpa tekanan.\n` +
      `• **Pecah Jadi Sub-Langkah Mini**: Buka tab *Pecah Tugas* di asisten ini. Mengerjakan 1 subtask kecil memberi otakmu dopamin keberhasilan!\n` +
      `• **Ciptakan Ruang Kerja Kondusif**: Jauhkan ponsel dari jangkauan tangan dan pasang musik instrumental atau suara hujan.\n` +
      `• **Beri Reward Diri Sendiri**: Janjikan segelas kopi atau camilan setelah 2 subtask berhasil dicentang.`
  }

  // G. Sapaan / Tes
  if (q === 'tes' || q === 'test' || q === 'halo' || q === 'hai' || q === 'hi' || q === 'p' || q.includes('assalamu')) {
    return `👋 **Halo! Saya StudyBot AI, asisten tugas kuliahmu.**\n\n` +
      `Sistem chat dan aplikasi manajemen tugas siap digunakan tanpa kendala! 🎓\n\n` +
      `Ada yang bisa saya bantu hari ini? Kamu bisa menanyakan:\n` +
      `• Tips menyusun makalah atau laporan praktikum\n` +
      `• Cara belajar efektif & membagi waktu ujian\n` +
      `• Solusi debug error koding atau jaringan\n` +
      `• Atau buka tab **Pecah Tugas Otomatis** untuk merancang checklist tugas!`
  }

  return `Halo! Pertanyaanmu: "${userMessage}".\n\n` +
    `💡 **Tips dari StudyBot AI:**\n` +
    `Kamu bisa menanyakan seputar **cara belajar efektif**, **tips makalah/skripsi**, **debug koding**, atau **manajemen waktu**.\n\n` +
    `Kamu juga bisa menggunakan tab **Pecah Tugas Otomatis** di samping untuk membagi tugas kuliah menjadi checklist langkah kerja yang siap disimpan ke Firebase!`
}

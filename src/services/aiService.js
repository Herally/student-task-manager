// src/services/aiService.js

/**
 * Academic AI Assistant Service for Student Task Manager.
 * Supports Google Gemini API (Free tier from Google AI Studio).
 * API Key can be set via UI (localStorage) or VITE_GEMINI_API_KEY in .env.
 */

export function getStoredApiKey() {
  return localStorage.getItem('studybot_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
}

export function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem('studybot_gemini_key', key.trim())
  } else {
    localStorage.removeItem('studybot_gemini_key')
  }
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

  const apiKey = getStoredApiKey()

  // Try live Gemini if API Key is configured
  if (apiKey) {
    try {
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      })

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

  // Built-in intelligent academic engine (instant & zero latency)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateIntelligentAcademicBreakdown(taskTitle, categoryName))
    }, 400)
  })
}

/**
 * Chat conversation with the AI Study Assistant.
 */
export async function chatWithStudyAI(userMessage, activeTasks = []) {
  if (!userMessage || !userMessage.trim()) return 'Halo! Ada tugas kuliah yang bisa saya bantu analisa atau rencanakan?'

  const apiKey = getStoredApiKey()
  const q = userMessage.trim().toLowerCase()

  // 1. LIVE GEMINI AI (Full Generative AI jika API Key sudah dipasang)
  if (apiKey) {
    try {
      const tasksContext = activeTasks.length > 0
        ? `Daftar tugas kuliah mahasiswa saat ini:\n` + activeTasks.slice(0, 6).map(t => `- "${t.title}" (Status: ${t.status}, Matkul: ${t.category || 'Umum'}, Deadline: ${t.deadline || 'tidak ada'})`).join('\n')
        : 'Mahasiswa belum memiliki tugas di daftar.'

      const systemPrompt = `Kamu adalah StudyBot AI, asisten virtual dan mentor akademik mahasiswa Indonesia pada web "Aplikasi Manajemen Tugas Mahasiswa Berbasis Web dengan Pelacakan Tugas Interaktif dan Visualisasi Progres".
Karakter: Ramah, solutif, cerdas, edukatif, berbahasa Indonesia santun dan mudah dipahami, berikan jawaban to-the-point dan terstruktur jika perlu.
Data Tugas Mahasiswa Saat Ini:
${tasksContext}

Instruksi: Jawablah pertanyaan mahasiswa di bawah ini secara bebas dan cerdas sesuai konteks.`

      // Coba model gemini-1.5-flash terlebih dahulu, jika gagal coba gemini-2.0-flash
      const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest']
      let lastError = null

      for (const model of models) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nPertanyaan Mahasiswa: ${userMessage}` }] }
              ]
            })
          })

          if (response.ok) {
            const data = await response.json()
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) return text
          } else {
            const errData = await response.json().catch(() => ({}))
            lastError = errData?.error?.message || `HTTP ${response.status}`
          }
        } catch (fetchErr) {
          lastError = fetchErr.message
        }
      }

      console.warn('Gemini API Error details:', lastError)

      // Jika error karena permission/email kampus
      if (lastError && (lastError.includes('API key not valid') || lastError.includes('PERMISSION_DENIED') || lastError.includes('CONSUMER_INVALID') || lastError.includes('403') || lastError.includes('400'))) {
        return `⚠️ **Kunci Tidak Diizinkan oleh Akun Kampus:**\n\n` +
          `Pesan dari Google: *${lastError}*\n\n` +
          `📌 **Penyebab:**\n` +
          `Anda sedang login menggunakan **email kampus/mahasiswa** (@student...). Kebanyakan kampus membatasi akses API eksternal.\n\n` +
          `✅ **Solusi Mudah (1 Menit):**\n` +
          `1. Buka tab baru di browser Anda: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)\n` +
          `2. Di pojok kanan atas, ganti akun ke **akun Google / Gmail pribadi biasa** (@gmail.com).\n` +
          `3. Klik **Create API key** (kuncinya akan diawali **AIzaSy...**).\n` +
          `4. Tempelkan kunci tersebut ke ikon ⚙️ StudyBot AI di aplikasi ini. Dijamin langsung berhasil 100%!`
      }
    } catch (err) {
      console.warn('Gemini chat failed, fallback to local engine:', err)
    }
  }

  // 2. OFFLINE FALLBACK ENGINE
  await new Promise(r => setTimeout(r, 400))

  // Sapaan / Tes
  if (q === 'tes' || q === 'test' || q === 'halo' || q === 'hai' || q === 'hi' || q === 'p' || q.includes('assalamu')) {
    return `👋 **Halo! Saya StudyBot AI, asisten tugas kuliahmu.**\n\n` +
      `Sistem chat dan aplikasi manajemen tugas siap digunakan! 🎓\n\n` +
      `Ada yang bisa saya bantu hari ini? Kamu bisa menanyakan:\n` +
      `• Tips menyusun makalah atau laporan praktikum\n` +
      `• Cara membagi waktu dan cicil tugas\n` +
      `• Solusi debug error koding atau jaringan\n` +
      `• Atau buka tab **Pecah Tugas Otomatis** untuk merancang checklist tugas!`
  }

  if (q.includes('jadwal') || q.includes('bagi waktu') || q.includes('time management') || q.includes('cicil')) {
    return `🕒 **Tips Manajemen Waktu & Menyusun Jadwal Belajar Efektif:**\n\n` +
      `1. **Terapkan Teknik Pomodoro**: Belajar fokus 25 menit, lalu istirahat 5 menit. Setelah 4 sesi, ambil istirahat panjang 15-20 menit.\n` +
      `2. **Aturan 2 Menit**: Jika ada tugas kecil yang bisa selesai dalam 2 menit, kerjakan seketika.\n` +
      `3. **Gunakan Matriks Eisenhower**: Dahulukan tugas yang *Mendesak & Penting* sebelum tugas yang santai.\n` +
      `4. **Blok Waktu Harian**: Sisihkan 2 jam tetap setiap sore/malam khusus untuk menyelesaikan subtask tugas kuliah di aplikasi ini.`
  }

  if (q.includes('makalah') || q.includes('skripsi') || q.includes('abstrak') || q.includes('bab') || q.includes('karya ilmiah')) {
    return `📄 **Struktur Standar Makalah & Laporan Ilmiah Perguruan Tinggi:**\n\n` +
      `• **Bab I Pendahuluan**: Latar belakang fenomena, rumusan masalah (5W+1H), tujuan, dan batasan masalah.\n` +
      `• **Bab II Tinjauan Pustaka**: Teori dasar, penelitian terdahulu yang relevan, serta kerangka pemikiran.\n` +
      `• **Bab III Metodologi / Pembahasan**: Data hasil kajian, perbandingan dengan teori, analisis kritis, dan solusi.\n` +
      `• **Bab IV Penutup**: Kesimpulan konkret dan saran pengembangan.\n\n` +
      `💡 *Tips Sitasi*: Pastikan merujuk jurnal terindeks SINTA atau Scopus 5 tahun terakhir, dan gunakan format APA 7th Edition.`
  }

  if (q.includes('coding') || q.includes('error') || q.includes('bug') || q.includes('react') || q.includes('javascript') || q.includes('python')) {
    return `💻 **Langkah Debugging & Menyelesaikan Tugas Pemrograman:**\n\n` +
      `1. **Baca Pesan Error di Console**: Perhatikan nama file dan nomor baris penyebab error (Stack Trace).\n` +
      `2. **Gunakan console.log() atau Debugger**: Pantau nilai variabel dan state sebelum dan sesudah fungsi dieksekusi.\n` +
      `3. **Pecah Masalah Jadi Logika Terkecil**: Jangan langsung selesaikan semua fungsi sekaligus; selesaikan alur input-proses-output per komponen.\n` +
      `4. **Cek Edge Cases**: Uji apakah input kosong (null/undefined) sudah di-handle dengan baik agar aplikasi tidak crash.`
  }

  if (q.includes('network') || q.includes('jaringan') || q.includes('cisco') || q.includes('ip address') || q.includes('subnet')) {
    return `🌐 **Panduan Tugas Mata Kuliah Jaringan Komputer (Computer Networks):**\n\n` +
      `1. **Pemahaman Topologi**: Pastikan diagram topologi (Star/Mesh) dan pengalamatan IP (CIDR / Subnetting) sudah benar.\n` +
      `2. **Uji Konektivitas**: Gunakan perintah ping dan traceroute untuk memastikan paket data bisa berpindah antar segmen.\n` +
      `3. **Routing & VLAN**: Periksa konfigurasi gateway dan tabel routing jika antar subnet belum bisa saling terhubung.\n` +
      `4. **Dokumentasikan Hasil**: Ambil tangkapan layar output pengujian untuk dilampirkan ke laporan akhir.`
  }

  if (q.includes('malas') || q.includes('prokrastinasi') || q.includes('semangat') || q.includes('burnout')) {
    return `💪 **Mengatasi Rasa Malas & Menunda Tugas (Procrastination):**\n\n` +
      `• **Turunkan Hambatan Mulai**: Cukup buka laptop dan kerjakan 5 menit pertama tanpa tekanan.\n` +
      `• **Pecah Jadi Sub-Langkah Mini**: Buka tab *Pecah Tugas* di asisten ini. Mengerjakan 1 subtask kecil memberi otakmu dopamin keberhasilan!\n` +
      `• **Ciptakan Ruang Kerja Kondusif**: Jauhkan ponsel dari jangkauan tangan dan pasang musik instrumental atau suara hujan.\n` +
      `• **Beri Reward Diri Sendiri**: Janjikan segelas kopi atau camilan setelah 2 subtask berhasil dicentang.`
  }

  return `Saya menerima pertanyaanmu: "${userMessage}".\n\n` +
    `StudyBot AI siap membantumu mengelola tugas kuliah, menyusun checklist langkah kerja, atau memberi tips akademik.\n` +
    `Coba tanyakan seputar pembuatan makalah, cara belajar ujian, atau gunakan tab **Pecah Tugas Otomatis** di atas!`
}

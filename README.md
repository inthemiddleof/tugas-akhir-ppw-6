# Cuaca - Weather Dashboard

**Cuaca** adalah dashboard cuaca modern berbasis web yang dirancang dengan antarmuka yang bersih (Clean UI), minimalis, dan responsif. Aplikasi ini menyediakan data cuaca _real-time_, prakiraan per jam, dan prakiraan 5 hari ke depan menggunakan data akurat dari Open-Meteo API.

## ✨ Fitur Utama

- **Lokasi & Pencarian:**
  - Pencarian kota di seluruh dunia dengan fitur _Autocomplete_.
  - Sidebar navigasi dengan kategori: Lokasi Utama, Kota Besar, dan Favorit.
- **weather Data Lengkap:**
  - Kondisi saat ini (Suhu, Angin, Kelembaban, UV Index).
  - Prakiraan per jam (24 jam ke depan) dengan deteksi siang/malam.
  - Prakiraan 5 hari ke depan.
- **UI/UX Modern:**
  - **Dark Mode & Light Mode** toggle dengan penyesuaian kontras otomatis.
  - **Ikon Animasi/Warna:** Menggunakan ikon SVG berkualitas tinggi yang berubah sesuai kondisi siang/malam.
  - **Responsif:** Tampilan sidebar _slide-in_ untuk perangkat mobile.
- **Fungsionalitas:**
  - Konversi satuan suhu (Celsius / Fahrenheit).
  - Kota Favorit.
  - Auto-refresh data.

## 🛠️ Teknologi yang Digunakan

- **HTML5** - Struktur semantik.
- **CSS3 & Tailwind CSS (CDN)** - Styling modern dan responsif.
- **Vanilla JavaScript (ES6+)** - Logika aplikasi, fetch API, dan manipulasi DOM.
- **API:** [Open-Meteo API](https://open-meteo.com/) (Gratis, tanpa API Key).
- **Icons:**
  - UI Icons: [Phosphor Icons](https://phosphoricons.com/).
  - Weather Icons: [Basmilius Weather Icons](https://github.com/basmilius/weather-icons).

## 📂 Struktur Folder

```text
/ (root)
├── index.html      # Struktur utama halaman web
├── style.css       # Kustomisasi CSS & animasi tambahan
├── script.js       # Logika utama (Fetch data, Render UI, Events)
└── README.md       # Dokumentasi proyek
```

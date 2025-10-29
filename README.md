# Embu Smart - Kalkulator Nilai Embu Shorinji Kempo

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

Sistem kalkulator cerdas untuk penilaian Embu (demonstrasi teknik) dalam kompetisi Shorinji Kempo. Aplikasi web-based yang memudahkan perhitungan nilai dan penentuan pemenang secara otomatis dengan tiebreaker logic yang akurat.

## 🌟 Fitur Utama

### ✨ Penilaian Otomatis
- **Input nilai wasit** - Ekspresi (max 40) dan Teknik (max 60) per wasit
- **Auto-discard** - Nilai tertinggi dan terendah otomatis dicoret
- **Perhitungan cerdas** - Hitung 3 nilai tengah untuk Nilai Awal
- **Denda otomatis** - Input denda waktu dan waza

### 🏆 Tiebreaker Logic
Sistem menentukan pemenang dengan urutan prioritas:
1. **Nilai Akhir** (ekspresi - denda)
2. **Total Teknik** (jika nilai akhir sama)
3. **Nilai Ekspresi Wasit Utama** (jika total teknik sama)
4. **Nilai Teknik Wasit Utama** (jika ekspresi wasit utama sama)
5. **Manual Decision** (jika semua nilai identik)

### 📊 Manajemen Pertandingan
- **Multi-tab dinamis** - Kelola banyak pertandingan dalam satu session
- **Rename tab** - Double-click untuk ganti nama pertandingan
- **Wasit dinamis** - Tambah/kurangi wasit (minimal 5)
- **Wasit utama** - Pilih wasit utama dengan radio button
- **Auto-save** - Data otomatis tersimpan ke localStorage

### 💾 Backup & Export
- **Backup JSON** - Download data sebagai file JSON
- **Import/Restore** - Restore data dari file backup
- **Export PDF** - Export semua pertandingan ke PDF

### 🎨 User Interface
- **Tabel interaktif** - Input langsung seperti Excel
- **Color-coded** - Warna berbeda untuk wasit utama, nilai dicoret, winner/looser
- **Responsive** - Desain yang clean dan mudah digunakan

## 📸 Screenshot

### Tampilan Utama
Tabel penilaian dengan kolom wasit yang dapat diinput langsung, perhitungan otomatis, dan penentuan pemenang real-time.

### Dropdown Manual Decision
Ketika semua nilai identik, dropdown muncul untuk keputusan wasit utama.

## 🚀 Cara Penggunaan

### 1. Buka Aplikasi
```
Buka file embu-calculator.html di browser modern (Chrome, Firefox, Edge, Safari)
```

### 2. Setup Pertandingan
1. Klik **"+ Tambah"** untuk pertandingan baru
2. **Double-click tab** untuk rename pertandingan
3. Input **nomor pertandingan** dan **nama tim**
4. Setup **daftar wasit** dan pilih **wasit utama** (radio button)

### 3. Input Nilai
1. Input **nilai ekspresi** (max 40) untuk setiap wasit
2. Input **nilai teknik** (max 60) untuk setiap wasit
3. Input **denda waktu** dan **waza** jika ada
4. Input **durasi** pertandingan

### 4. Lihat Hasil
- **Nilai Awal** otomatis terhitung (terpisah ekspresi & teknik)
- **Nilai Akhir** otomatis dikurangi denda
- **Nilai Final** menampilkan informasi tiebreaker
- **Kolom JUARA** menampilkan MENANG/KALAH
- **Dropdown manual** muncul jika semua nilai sama

### 5. Backup & Export
- Klik **"Backup Data"** untuk download file JSON
- Klik **"Import Backup"** untuk restore data
- Klik **"Export ke PDF"** untuk cetak hasil

## 📋 Persyaratan

- Browser modern dengan JavaScript enabled
- Koneksi internet (untuk load library jsPDF & html2canvas)
- Tidak perlu instalasi server

## 🛠️ Teknologi

- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Logic & interactivity
- **localStorage** - Data persistence
- **jsPDF** - PDF export
- **html2canvas** - Screenshot to PDF

## 📖 Dokumentasi Teknis

### Struktur Data
```javascript
{
  id: timestamp,
  name: "Pertandingan 1",
  nomor: "Embu Berpasangan Campuran Kyukenshi",
  wasits: [
    { name: "Wasit 1", isUtama: true },
    { name: "Wasit 2", isUtama: false },
    ...
  ],
  teams: [
    {
      name: "Merah",
      scores: [40, 38, 39, 40, 37], // Ekspresi
      tekniks: [54, 53, 53, 53, 54], // Teknik
      durasi: "1:51",
      dendaWaktu: 0,
      dendaWaza: 0,
      manualDecision: ""
    },
    ...
  ]
}
```

### Algoritma Discard
```javascript
// Sort by ekspresi first, then by total if same
sortedScores = scores.sort((a, b) => {
  if (a.ekspresi !== b.ekspresi) return a.ekspresi - b.ekspresi;
  return a.total - b.total;
});
// Discard lowest and highest
```

## ⚠️ Penting

### 🚫 DILARANG MEMPERJUALBELIKAN SISTEM INI

Software ini gratis dan open-source. Dilarang keras untuk:
- Menjual software ini sebagai produk komersial
- Mengklaim sebagai karya sendiri
- Menghapus credit pembuat

### ✅ Diperbolehkan
- Gunakan untuk keperluan pribadi/organisasi
- Modifikasi sesuai kebutuhan
- Kontribusi perbaikan/fitur baru
- Distribusikan secara gratis dengan mencantumkan credit

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur X'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## 📝 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

**Additional Terms:**
- Software ini untuk penggunaan personal dan organisasi
- Dilarang dijual kembali sebagai produk komersial
- Modifikasi dan kontribusi dipersilakan dengan license yang sama

## 👤 Author

**Muhammad Seman**

- GitHub: [@muhammad-seman](https://github.com/muhammad-seman)
- Repository: [embu-smart](https://github.com/muhammad-seman/embu-smart)

## 🙏 Acknowledgments

- Shorinji Kempo Indonesia
- Semua kontributor dan pengguna sistem ini
- Komunitas open-source

---

**© 2025 Muhammad Seman - All Rights Reserved**

*Made with ❤️ for Shorinji Kempo Community*

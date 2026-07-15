# Backend Generate Gambar (proxy ke OpenAI)

Fungsi folder ini cuma satu: menyimpan API key OpenAI kamu **di server**, bukan di app yang dibuka orang lain. App (frontend) manggil server ini, server ini yang manggil OpenAI.

Kenapa perlu begini: kalau API key ditaruh langsung di frontend, siapa pun yang buka app-nya bisa lihat key itu lewat DevTools browser dan pakai kuota OpenAI kamu.

---

## Langkah deploy (gratis, pakai Vercel)

### 1. Push folder ini ke GitHub
```bash
cd marketing-assistant-image-backend
git init
git add .
git commit -m "init backend"
```
Buat repo baru di github.com, lalu:
```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git branch -M main
git push -u origin main
```
(Kalau belum familiar dengan langkah ini, upload manual lewat tombol "Add file > Upload files" di halaman repo GitHub juga bisa.)

### 2. Deploy ke Vercel
1. Buka https://vercel.com, login pakai akun GitHub kamu.
2. Klik "Add New" > "Project".
3. Pilih repo yang baru kamu push tadi.
4. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan dua ini:
   - `OPENAI_API_KEY` = API key OpenAI kamu (yang sudah kamu punya)
   - `APP_SECRET` = bikin string acak sendiri, contoh: `mira-secret-9x7k2m` (ini kunci tambahan biar orang lain gak bisa pakai endpoint kamu diam-diam kalau URL-nya ketebak)
5. Klik **Deploy**. Tunggu sampai selesai (biasanya <1 menit).

### 3. Ambil URL endpoint kamu
Setelah deploy selesai, Vercel kasih domain seperti:
```
https://nama-project-kamu.vercel.app
```
Endpoint gambar kamu jadinya:
```
https://nama-project-kamu.vercel.app/api/generate-image
```

### 4. Masukkan ke app
Buka app-nya, masuk ke **Brand Kit**, isi:
- **Image API URL**: endpoint di atas
- **App Secret**: string yang sama persis dengan `APP_SECRET` yang kamu set di Vercel

---

## Catatan penting

- **Biaya**: setiap generate gambar = biaya nyata dari OpenAI (dibebankan ke akun OpenAI kamu, bukan gratis). Cek harga model `gpt-image-1` di dashboard OpenAI kamu sebelum dipakai banyak orang.
- **APP_SECRET wajib diisi** — tanpa ini, endpoint kamu bisa dipakai siapa saja yang menemukan URL-nya, dan kamu yang kena tagihan.
- Kalau mau ganti model atau ukuran gambar, edit `api/generate-image.js`.

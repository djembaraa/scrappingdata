Aplikasi Pencari Tempat Google Maps dengan Next.js
Aplikasi ini adalah contoh implementasi Next.js yang memungkinkan Anda mencari tempat-tempat menggunakan Google Maps Places API resmi dan mengunduh hasilnya dalam format CSV. Aplikasi ini dirancang untuk menunjukkan cara berinteraksi dengan API Google secara etis dan sesuai kebijakan, menghindari praktik web scraping yang tidak sah.

Daftar Isi
Pendahuluan

Screenshot Aplikasi

Fitur

Prasyarat

Setup Proyek

Konfigurasi Google Maps API

Menjalankan Aplikasi

Penggunaan Aplikasi

Ekspor Data ke CSV

Catatan Penting & Batasan

Pendahuluan
Proyek ini dibangun sebagai solusi yang aman dan legal untuk mendapatkan data lokasi dari Google Maps. Alih-alih melakukan web scraping langsung (yang melanggar Syarat & Ketentuan Google dan berisiko pemblokiran IP), aplikasi ini memanfaatkan Google Maps Places API resmi. Ini memastikan data yang akurat, terstruktur, dan sesuai dengan kebijakan Google.

Screenshot Aplikasi
Untuk memberikan gambaran visual tentang bagaimana aplikasi ini terlihat dan berfungsi, Anda dapat menambahkan tangkapan layar (screenshot) di sini.

Ganti URL placeholder di atas dengan tautan ke screenshot aplikasi Anda yang sebenarnya.

Fitur
Pencarian Tempat: Cari tempat berdasarkan kata kunci (misalnya, "restoran jakarta", "hotel bandung").

Pengambilan Detail Tempat: Mendapatkan detail seperti alamat, rating, total ulasan, nomor telepon umum, dan URL situs web dari setiap tempat.

Pagination Otomatis: Mengambil hingga 3 halaman hasil pencarian (sekitar 60 tempat) menggunakan next_page_token API.

Tampilan Hasil Interaktif: Menampilkan hasil pencarian di antarmuka web yang rapi.

Ekspor ke CSV: Mengunduh semua data yang ditemukan ke dalam file CSV yang siap diimpor ke Google Sheets atau aplikasi spreadsheet lainnya.

Kolom Email & WhatsApp di CSV: Menyediakan kolom kosong untuk "Email" dan "Nomor WhatsApp" di CSV, yang dapat Anda isi secara manual.

Prasyarat
Sebelum memulai, pastikan Anda telah menginstal yang berikut ini:

Node.js (versi 18.x atau lebih tinggi) & npm: Unduh Node.js

Editor Teks: Seperti VS Code

Akun Google Cloud: Diperlukan untuk mendapatkan Google Maps API Key.

Setup Proyek
Ikuti langkah-langkah ini untuk menyiapkan proyek di komputer lokal Anda:

Kloning Repositori (jika ini adalah repositori Git):

git clone <URL_REPO_ANDA>
cd my-places-app

Jika Anda membuat proyek dari awal, pastikan Anda berada di direktori proyek:

cd my-places-app

Instal Dependensi:

npm install

# atau

yarn install

Konfigurasi Google Maps API
Ini adalah langkah paling krusial untuk membuat aplikasi berfungsi.

Buat atau Pilih Proyek Google Cloud:

Buka Google Cloud Console.

Pilih atau buat proyek baru.

Aktifkan API yang Diperlukan:

Di Google Cloud Console, navigasikan ke "APIs & Services" > "Library".

Cari dan aktifkan:

Places API

Maps JavaScript API (Opsional, jika Anda berencana menambahkan peta interaktif di masa depan, tetapi tidak wajib untuk fungsionalitas saat ini).

Buat Kredensial (API Key):

Di Google Cloud Console, navigasikan ke "APIs & Services" > "Credentials".

Klik "+ Create Credentials" dan pilih "API Key".

Salin API Key yang dihasilkan.

Batasi API Key Anda (Sangat Penting untuk Keamanan & Biaya):

Setelah API Key dibuat, klik "Restrict Key".

Di bagian "Application restrictions":

Pilih "HTTP referrers (web sites)".

Tambahkan referer untuk pengembangan: http://localhost:3000/\*

Jika Anda akan men-deploy aplikasi, tambahkan juga domain produksi Anda (misalnya, https://your-domain.com/*).

Di bagian "API restrictions":

Pilih "Restrict API Key".

Pilih "Places API".

Klik "Save".

Buat File .env.local:

Di root direktori proyek Anda (my-places-app/), buat file baru bernama .env.local.

Tambahkan baris berikut, ganti YOUR_GOOGLE_MAPS_API_KEY dengan API Key yang Anda salin:

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

Penting: Jangan pernah membagikan file .env.local Anda atau menyimpan API Key langsung di kode sumber yang akan di-commit ke repositori publik.

Menjalankan Aplikasi
Setelah semua dependensi terinstal dan API Key dikonfigurasi:

Hentikan server pengembangan jika sedang berjalan (tekan Ctrl + C di terminal).

Mulai server pengembangan:

npm run dev

# atau

yarn dev

Aplikasi akan berjalan di http://localhost:3000.

Penggunaan Aplikasi
Buka browser web Anda dan navigasikan ke http://localhost:3000.

Anda akan melihat antarmuka pencarian sederhana.

Masukkan kata kunci pencarian di kolom input (misalnya, "restoran jakarta", "hotel bandung", "kafe surabaya").

Klik tombol "Cari Data".

Aplikasi akan memanggil Google Maps Places API di sisi server, mengambil data, dan menampilkannya di halaman. Proses ini mungkin memakan waktu beberapa detik karena adanya pagination dan panggilan Place Details API.

Ekspor Data ke CSV
Setelah hasil pencarian ditampilkan:

Klik tombol "Download as CSV".

File CSV bernama google_places_data.csv akan diunduh ke komputer Anda.

File CSV ini dapat dibuka dengan Google Sheets, Microsoft Excel, atau aplikasi spreadsheet lainnya.

Catatan: Kolom "Email" dan "Nomor WhatsApp" akan ada di file CSV, namun akan terisi "N/A" atau kosong karena data ini tidak disediakan secara otomatis oleh Google Maps Places API. Anda perlu mengisi kolom ini secara manual jika Anda berhasil menemukan informasi tersebut dari situs web bisnis atau sumber lain.

Catatan Penting & Batasan
Biaya Google Maps API: Penggunaan Google Maps Platform API, terutama panggilan Place Details dan pagination Text Search, akan dikenakan biaya setelah kuota gratis terlampaui. Pastikan Anda memahami harga Google Maps Platform dan memantau penggunaan API Anda di Google Cloud Console untuk menghindari biaya yang tidak terduga.

Batasan Data: Google Maps Places API (Text Search) secara default hanya mengembalikan hingga 20 hasil per permintaan, dan memungkinkan hingga 3 halaman hasil (total sekitar 60 tempat) menggunakan next_page_token. Anda tidak dapat mengambil semua tempat yang ada di Google Maps melalui API ini.

Privasi Data: Google Maps Places API tidak menyediakan alamat email atau nomor WhatsApp secara langsung karena alasan privasi. Informasi kontak yang paling spesifik yang tersedia adalah nomor telepon umum dan URL situs web.

Pengisian Manual: Jika Anda membutuhkan email atau nomor WhatsApp, Anda perlu mengunjungi situs web yang terdaftar dari setiap tempat secara manual dan mencari informasi tersebut di sana.

Semoga tutorial ini membantu Anda dalam menggunakan aplikasi ini!

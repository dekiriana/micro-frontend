# ⚡ DevPulse

DevPulse adalah purwarupa arsitektur **Micro-Frontend (MFE)** lintas *framework* yang didesain dengan estetika *Dark Industrial Terminal*. Proyek ini mendemonstrasikan bagaimana aplikasi skala besar dapat dipecah menjadi unit-unit kecil yang independen (*remotes*), dikembangkan dengan *tech-stack* yang berbeda, namun tetap menyatu secara mulus dalam satu cangkang (*App Shell*) tunggal.

## 🏗️ Arsitektur & Tech Stack

Proyek ini menggunakan pola **App Shell Architecture** yang difragmentasi menjadi 3 repositori/folder utama:

| Service | Peran | Tech Stack | Port | Deskripsi |
| --- | --- | --- | --- | --- |
| **`host-react`** | **App Shell / Host** | React 19 + Vite | `3000` | Mengatur navigasi global (Sidebar/Topbar), Context API, tema, dan *Remote Loader* (Skeleton UI). |
| **`remote-vue`** | **"The Feed" Remote** | Vue 3 + Vite | `4202` | Menyajikan *news feed* dengan fitur *real-time search* dan filter. Sangat reaktif dan ringan. |
| **`remote-angular`** | **"The Board" Remote** | Angular 21 (Zoneless) | `4201` | Menyajikan tabel metrik dan *sparkline charts* berbasis Canvas. Tangguh untuk kalkulasi data berat. |

---

## 🚀 Cara Menjalankan Aplikasi (Step-by-Step)

Karena arsitektur ini terdiri dari beberapa *service* independen, kamu perlu menjalankan terminal terpisah untuk masing-masing *service*.

### 1. Jalankan Remote Angular (The Board)

Angular menggunakan Webpack *dev-server* yang secara otomatis men- *serve* file `remoteEntry.js` di memori.

```bash
cd remote-angular
npm install
ng serve --port 4201

```

### 2. Jalankan Remote Vue (The Feed)

Vite mensyaratkan proses *build* untuk menghasilkan `remoteEntry.js`. Kita menggunakan perintah khusus yang menjalankan *build watch mode* dan *preview server* secara paralel.

```bash
cd remote-vue
npm install
npm run serve:mfe

```

*(Catatan: Perintah ini akan menjalankan `concurrently "vite build --watch" "vite preview --port 4202"`)*

### 3. Jalankan Host React (The Shell)

Host React berjalan dalam mode *development* standar dan akan secara dinamis menarik modul dari port `4201` dan `4202`.

```bash
cd host-react
npm install
npm run dev

```

Buka browser dan navigasikan ke **`http://localhost:3000`**.

> **💡 Tips Development:** Jika kamu mengubah kode di React, UI akan ter- *update* secara instan (HMR). Jika kamu mengubah kode di Vue atau Angular, server mereka akan me- *rebuild* di latar belakang; kamu cukup menekan **F5 (Refresh)** di tab React Host untuk melihat perubahannya.

---

## 🧩 Bagaimana Host dan Remote Terkoneksi?

Menyatukan React, Vue, dan Angular dalam satu DOM bukanlah hal yang bisa dilakukan dengan `import` komponen biasa. DevPulse menyelesaikan masalah ini menggunakan pola **Agnostic Mount Functions** melalui Module Federation.

Berikut adalah penjelasan mendalam tentang bagaimana mereka terhubung:

### 1. Kontrak di Sisi Remote (The Exposer)

Daripada mengekspos komponen langsung (seperti `App.vue` atau `AppComponent`), setiap *Remote* mengekspos sebuah **fungsi murni JavaScript** bernama `mount`.

* **Di Vue (`mount.js`)**: Fungsi ini menerima sebuah elemen DOM (`HTMLElement`), lalu memanggil `createApp(App).mount(el)` di dalam elemen tersebut.
* **Di Angular (`mount.ts`)**: Fungsi ini membuat elemen `<app-root>`, menyisipkannya ke dalam elemen DOM target, lalu menjalankan `bootstrapApplication(AppComponent)`.

File `mount` inilah yang diekspos melalui `vite.config.js` atau `webpack.config.js` dengan nama kontrak seragam, misalnya `./VueRoot` atau `./AngularRoot`.

### 2. Kontrak di Sisi Host (The Consumer)

Host React tidak tahu menahu bahwa yang di- *render* adalah Vue atau Angular. React hanya menyediakan sebuah **Wadah Kosong** (berupa `div` dengan React `useRef`).

Alur di komponen `RemoteLoader.jsx` milik React:

1. **Loading State**: React merender *Skeleton UI* untuk memberikan ilusi performa saat menunggu jaringan.
2. **Dynamic Import**: React mengunduh `remoteEntry.js` dari URL *Remote*.
3. **Eksekusi Mount**: Setelah modul diterima, React mencari fungsi `mount` milik remote tersebut, lalu "menyerahkan" elemen `div` (dari `useRef`) ke dalam fungsi tersebut.
4. **Takeover**: Sejak detik itu, framework *Remote* (Vue/Angular) mengambil alih sepenuhnya proses *rendering*, reaktivitas, dan DOM manipulasi di dalam `div` tersebut, sementara React hanya mengurus area luar (Sidebar & Topbar).

### 3. Error Boundary & Fallback

Jika sebuah *Remote* mati (port tidak berjalan), `RemoteLoader.jsx` akan mendeteksinya dan membatalkan *render*, lalu menampilkan UI **Terminal Placeholder** yang elegan dengan tombol *Retry*, memastikan bahwa aplikasi Host secara keseluruhan tidak ikut *crash* (Resiliensi Sistem).

---

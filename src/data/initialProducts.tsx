import { Product } from '../types/types';

export const initialProducts: Product[] = [
  // === ELEKTRONIK ===
  {
    id: 1,
    nama: "PlayStation 5 Pro",
    harga: 13000000,
    urlGambar: "https://www.cnet.com/a/img/resize/75a55c7b9c563ac79090b072ba21b9a363133150/hub/2024/11/05/75bc8592-5b67-4ebc-990c-1097dd27f7e7/intro-00-00-01-47-still001.jpg?auto=webp&width=1200", 
    deskripsi: "PS5 Pro adalah konsol PlayStation 5 yang lebih bertenaga dengan peningkatan grafis signifikan...",
    kategori: "Elektronik",
  },
  {
    id: 2,
    nama: "STIK PS 5 Dualsense ORI",
    harga: 1270000,
    urlGambar: "https://asset.kompas.com/crops/K_VSYZtAehPs3g6MSanUCWgH978=/85x0:1098x675/1200x800/data/photo/2022/08/24/63057a3eefaae.png",
    deskripsi: "Stik nirkabel DualSense asli dari Sony dengan teknologi haptic feedback...",
    kategori: "Elektronik",
  },
  {
    id: 3,
    nama: "Nintendo Switch 2",
    harga: 8000000,
    urlGambar: "https://assets.pikiran-rakyat.com/crop/0x0:0x0/1200x675/photo/2025/04/04/3283799775.jpg",
    deskripsi: "Konsol penerus generasi sebelumnya dengan peningkatan performa dan fitur...",
    kategori: "Elektronik",
  },
  {
    id: 4,
    nama: "Legion Pro 7i Gen 9",
    harga: 60000000,
    urlGambar: "https://laptopmedia.com/wp-content/uploads/2024/05/5-1.jpg",
    deskripsi: "Laptop gaming kelas atas dengan prosesor Intel Core Ultra 9 dan grafis NVIDIA RTX...",
    kategori: "Elektronik",
  },
  {
    id: 10,
    nama: "TCL C655 QLED Pro 43Inch",
    harga: 4899000,
    urlGambar: "https://down-id.img.susercontent.com/file/sg-11134201-7rdwo-lzq4cqrrmm120e@resize_w900_nl.webp",
    deskripsi: "TV 4K UHD dengan teknologi QLED Pro dan fitur Game Master...",
    kategori: "Elektronik",
  },

  // === OTOMOTIF ===
  {
    id: 5,
    nama: "Velg HSR DAIMON 7007 R15 BLACK CHROME",
    harga: 6000000,
    urlGambar: "https://hsrwheel.com/wp-content/uploads/2025/11/DAIMON-7007-HSR-Ring-15X6.5-Hole-8X100-114.3-ET40-BLACK-CHROME-kanan.jpg",
    deskripsi: "Accent, Agya, Avanza, Ayla, Baleno, Brio, Jazz, Karimun, Kijang LGX, Lancer, March, Mazda 2, Mirage, Mobilio, Panther, Raize, Rocky, Sigra, Sirion, Splash, Swift, Vios, Xenia, Yaris, dan type mobil lain dengan ukuran PCD 8X100-114,3",
    kategori: "Otomotif",
  },
  {
    id: 6,
    nama: "Sparco Grid-Q",
    harga: 2600000,
    urlGambar: "https://www.raceanywhere.co.uk/cdn/shop/products/SPA008009RN-SparcoSeatGridIIQRT_1024x1024_dfa52d16-9fa6-4a4f-94af-e20574c6b9d6_1024x1024.jpg?v=1618845313",
    deskripsi: "Jok Sparco terpopuler di Race Anywhere! Diperbarui dengan teknologi QRT terbaru, jok GRID tetap mempertahankan fitur mobilitas tingginya berkat bobotnya yang ringan di bawah.",
    kategori: "Otomotif",
  },
  {
    id: 7,
    nama: "Shell Advance AX7 Scooter 10W-30",
    harga: 64000,
    urlGambar: "https://img.id.my-best.com/product_images/ab1eace8097462ff26f6355674fe87ba.jpeg?ixlib=rails-4.3.1&q=70&lossless=0&w=800&h=800&fit=clip&s=f5a0e6dc1ec95e827df93642f67e35ff",
    deskripsi: "Shell Advance AX7 Scooter 10W-30 adalah pelumas skuter 4-tak semisintesis dengan Teknologi RCE (Reliability of oil-performance, Control, Enjoyable ride)..",
    kategori: "Otomotif",
  },

  // === BAYI ===
  {
    id: 8,
    nama: "Baby Stroller Lipat",
    harga: 1900000,
    urlGambar: "https://image.made-in-china.com/202f0j00oqublSGBhQkV/Lightweight-Baby-Strollers-One-Handed-One-Step-Fold-Stands-Folded-Baby-Strollers.webp",
    deskripsi: "Roller bayi ringan yang dapat dilipat satu tangan satu Langkah dapat dilipat Lipat.",
    kategori: "Bayi",
  },
  {
    id: 9,
    nama: "Ranjang Bayi",
    harga: 990000,
    urlGambar: "https://image.made-in-china.com/202f0j00eMbktZSqnrcQ/Multifunctional-Baby-Crib-Removable-Portable-Folding-Newborn-Baby-Bedside-Bed-Cradle-Bed.webp",
    deskripsi: "Buaian bayi multifungsi, tempat tidur bayi portabel melipat bayi Tempat Tidur Cradle.",
    kategori: "Bayi",
  },

  // === PAKAIAN ===
  {
    id: 11,
    nama: "Rucas",
    harga: 1200000,
    urlGambar: "https://assets.voila.id/voila/images/product/rucas/1product-RCSINSPLTS001-Xms-2025-05-21T1157150700.jpeg",
    deskripsi: "Initial Splash T-Shirt Grey",
    kategori: "Pakaian",
  },
  {
    id: 12,
    nama: "Praedae",
    harga: 220000,
    urlGambar: "https://s3-ap-southeast-1.amazonaws.com/plugolive/vendor/5924/product/45_1754799333687.png",
    deskripsi: "Hopeless Romantic Black Tee (without box)",
    kategori: "Pakaian",
  },

  // === MAKANAN ===
  {
    id: 13,
    nama: "Chitato Lite",
    harga: 22000,
    urlGambar: "https://id-live-01.slatic.net/p/3b2eec46ac6e48bb9c20d4069c1bbad6.jpg",
    deskripsi: "Chitato Lite adalah varian camilan kentang dari merek Chitato yang dibuat dengan tekstur lebih tipis dan ringan dibanding versi originalnya.",
    kategori: "Makanan",
  },
  {
    id: 14,
    nama: "Chocopie",
    harga: 48000,
    urlGambar: "https://cdn.kibrispdr.org/data/312/gambar-choco-pie-45.jpg",
    deskripsi: "Choco Pie adalah camilan manis berbentuk bulat yang terdiri dari dua lapis kue lembut dengan isi marshmallow manis di tengahnya, lalu dilapisi cokelat di bagian luar.",
    kategori: "Makanan",
  },
];
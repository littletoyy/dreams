import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Image as ImageIcon,
  Camera,
  Megaphone,
  Video,
  MessageCircle,
  Calendar,
  Send,
  Star,
  ChevronLeft,
  Check,
  Download,
  Copy,
  Share2,
  RefreshCw,
  Lock,
  Upload,
  X,
  Sparkles,
  Palette,
  User,
  Wifi,
  Signal,
  BatteryFull,
} from "lucide-react";

const COLORS = {
  ink: "#1B2A27",
  paper: "#FBF8F1",
  paperDeep: "#F1ECDD",
  teal: "#1F4B43",
  tealLight: "#2F6459",
  tealPale: "#DCEAE5",
  marigold: "#F2A93B",
  marigoldPale: "#FCE9C7",
  chili: "#D8564A",
  chiliPale: "#F8DBD6",
  leaf: "#6B9B5E",
  line: "#E4DFCF",
  white: "#FFFFFF",
};

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY = "'Plus Jakarta Sans', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const CATEGORY_ICON = {
  Makanan: "🍽️",
  Minuman: "🥤",
  Bakery: "🍞",
  Cafe: "☕",
  "Frozen Food": "🧊",
  Catering: "🍱",
  Lainnya: "🏪",
};

const WARNA_HEX = {
  Merah: COLORS.chili,
  Hijau: COLORS.leaf,
  Kuning: COLORS.marigold,
  Hitam: COLORS.ink,
  Putih: "#FFFFFF",
};

const MENU_ITEMS = [
  { key: "feed", label: "Feed Instagram", emoji: "📷", locked: false },
  { key: "story", label: "Story Instagram", emoji: "📱", locked: false },
  { key: "poster", label: "Poster Promo", emoji: "🎨", locked: false },
  { key: "video", label: "Video Reel", emoji: "🎬", locked: true },
  { key: "wastatus", label: "Status WhatsApp", emoji: "💬", locked: true },
  { key: "kalender", label: "Konten 30 Hari", emoji: "📅", locked: true },
  { key: "broadcast", label: "Broadcast WhatsApp", emoji: "📢", locked: true },
  { key: "testimoni", label: "Testimoni", emoji: "⭐", locked: true },
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

const OPENERS = {
  "Menambah penjualan": [
    "🔥 Waktunya {product} jadi pilihan utama hari ini!",
    "Yuk, saatnya cobain {product} sebelum kehabisan!",
  ],
  "Mengenalkan produk": [
    "Kenalan yuk sama {product} 👋",
    "Ini dia {product} yang lagi jadi perbincangan!",
  ],
  "Mengingatkan pelanggan": [
    "Udah lama gak mampir? {product} kangen kamu 😄",
    "Jangan lupa, {product} masih setia menunggu kamu!",
  ],
  Promo: [
    "🎉 Promo spesial buat kamu: {product}!",
    "Diskon gede-gedean cuma untuk {product}!",
  ],
  Branding: [
    "{business} hadir dengan {product}, dibuat dengan sepenuh hati.",
    "Kualitas terbaik, itu janji kami lewat {product}.",
  ],
};

const BODY_BY_CATEGORY = {
  Makanan: ["Dibuat fresh setiap hari pakai bahan pilihan.", "Rasanya bikin nagih, porsinya bikin puas."],
  Minuman: ["Segar diminum kapan aja, cocok nemenin harimu.", "Manis pas, dingin pas, bikin mood naik seketika."],
  Bakery: ["Lembut di setiap gigitan, wangi baru keluar dari oven.", "Cocok buat sarapan atau teman ngeteh sore."],
  Cafe: ["Tempat nongkrong nyaman dengan rasa yang gak biasa.", "Racikan spesial buat kamu yang butuh me time."],
  "Frozen Food": ["Praktis, tinggal goreng, langsung siap disantap.", "Stok di freezer, siap masak kapan aja."],
  Catering: ["Cocok buat acara kecil sampai besar, tinggal pesan.", "Menu lengkap, rasa restoran, harga bersahabat."],
  Lainnya: ["Kualitas terjamin, pelayanan ramah, harga bersahabat.", "Pilihan tepat buat kebutuhan kamu hari ini."],
};

const TARGET_LINE = {
  "Anak Sekolah": "Cocok banget buat jajan sepulang sekolah! 🎒",
  Mahasiswa: "Solusi hemat buat anak kost dan mahasiswa! 📚",
  Karyawan: "Teman ngantor paling pas buat jam istirahat! 💼",
  Keluarga: "Pas buat momen kumpul bareng keluarga. 👨‍👩‍👧",
  "Semua Orang": "Cocok buat siapa aja, kapan aja! ✨",
};

const PROMO_LINE = (promo, nominal) => {
  if (promo === "Diskon") return `💥 Diskon ${nominal || "spesial"} khusus hari ini!`;
  if (promo === "Buy 1 Get 1") return "🎁 Beli 1 gratis 1, jangan sampai kelewatan!";
  if (promo === "Cashback") return "💸 Cashback spesial buat kamu, order sekarang!";
  if (promo === "Gratis Ongkir") return "🚚 Gratis ongkir se-kota, order sekarang juga!";
  if (promo === "Promo Spesial") return "✨ Ada promo spesial yang lagi menantimu!";
  return null;
};

const CTA_POOL = [
  "Order sekarang, jangan sampai kehabisan!",
  "Chat WhatsApp kami sekarang juga!",
  "Kunjungi outlet terdekat hari ini!",
  "Klik link di bio buat pesan sekarang!",
];

function slugTag(s) {
  return s.replace(/[^a-zA-Z0-9]/g, "");
}

async function callTextAI({ flow, answers, brandKit, variation }) {
  const sys =
    'Kamu adalah Mira, asisten marketing untuk UMKM Indonesia. Balas HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan tambahan, tanpa backtick. Format wajib: {"caption": "string", "hashtags": ["tag1","tag2","tag3","tag4","tag5"], "cta": "string"}. Caption: Bahasa Indonesia santai dan ramah, maksimal 4 kalimat pendek, boleh pakai emoji secukupnya. Hashtags: 5 buah, relevan, tanpa spasi, tanpa tanda pagar di depan (pagar akan ditambahkan sistem). CTA: satu kalimat pendek mengajak aksi.';

  const userPrompt = `Buatkan konten promosi untuk:
Nama usaha: ${brandKit.name || "Usaha Kami"}
Jenis konten: ${flow === "feed" ? "Feed Instagram" : flow === "story" ? "Story Instagram" : "Poster Promo"}
Produk/promo: ${answers.nama || "-"}
Kategori: ${answers.kategori || "-"}
Promo: ${answers.promo && answers.promo !== "Tidak" ? `${answers.promo} ${answers.nominal || ""}` : "Tidak ada promo"}
Target pembeli: ${answers.target || "Semua orang"}
Tujuan posting: ${answers.tujuan || "Mengenalkan produk"}
${variation ? "Buat versi yang beda dari sebelumnya, kata-kata lebih segar." : ""}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: sys,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) throw new Error("Gagal menghubungi AI (status " + response.status + ")");
  const data = await response.json();
  const text = (data.content || []).map((b) => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!parsed.caption || !Array.isArray(parsed.hashtags)) throw new Error("Format balasan AI tidak sesuai");
  parsed.hashtags = parsed.hashtags.map((h) => (h.startsWith("#") ? h : "#" + h));
  return parsed;
}

async function callImageAI({ product, category, style, brandKit }) {
  if (!brandKit.imageApiUrl) return null;
  const prompt = `Professional commercial product photography of ${product}, category: ${category || "food and beverage"}, visual style: ${
    style || "realistic"
  }, appetizing presentation, clean simple background, natural vibrant lighting, no text overlay, no watermark, square framing`;

  const res = await fetch(brandKit.imageApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-App-Secret": brandKit.appSecret || "" },
    body: JSON.stringify({ prompt, size: "1024x1024" }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && data.error) || "Backend gambar menolak permintaan (status " + res.status + ")");
  if (data.b64) return "data:image/png;base64," + data.b64;
  if (data.url) return data.url;
  throw new Error("Backend gambar tidak mengembalikan gambar");
}

function generateContent({ flow, answers, brandKit, seed }) {
  const product = answers.nama || "Produk Andalan";
  const category = answers.kategori || "Lainnya";
  const purpose = answers.tujuan || "Mengenalkan produk";
  const target = answers.target || "Semua Orang";
  const promo = answers.promo || "Tidak";

  const opener = pick(OPENERS[purpose] || OPENERS["Mengenalkan produk"], seed)
    .replace("{product}", product)
    .replace("{business}", brandKit.name || "Usaha Kami");
  const body = pick(BODY_BY_CATEGORY[category] || BODY_BY_CATEGORY.Lainnya, seed + 1);
  const targetLine = TARGET_LINE[target] || TARGET_LINE["Semua Orang"];
  const promoLine = PROMO_LINE(promo, answers.nominal);
  const cta = pick(CTA_POOL, seed + 2);

  const captionLines = [opener, body, targetLine];
  if (promoLine) captionLines.splice(1, 0, promoLine);
  const caption = captionLines.join("\n\n");

  const businessTag = brandKit.name ? "#" + slugTag(brandKit.name) : "#UMKMIndonesia";
  const productTag = "#" + slugTag(product).slice(0, 20);
  const categoryTag = "#" + slugTag(category);
  const genericTags = ["#UMKMLokal", "#KulinerIndonesia", "#SupportLocalBusiness", "#PromoHariIni"];
  const hashtags = [businessTag, productTag, categoryTag, pick(genericTags, seed), pick(genericTags, seed + 3)];

  return { caption, hashtags: [...new Set(hashtags)], cta };
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 84,
        left: "50%",
        transform: "translateX(-50%)",
        background: COLORS.ink,
        color: COLORS.paper,
        padding: "10px 18px",
        borderRadius: 999,
        fontSize: 13,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        zIndex: 50,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
      }}
    >
      {toast}
    </div>
  );
}

function Chip({ children, active, onClick, tone = "teal" }) {
  const toneMap = {
    teal: { bg: active ? COLORS.teal : COLORS.white, fg: active ? COLORS.white : COLORS.teal, bd: COLORS.teal },
    marigold: { bg: active ? COLORS.marigold : COLORS.white, fg: active ? COLORS.ink : COLORS.ink, bd: COLORS.marigold },
  };
  const t = toneMap[tone];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 16px",
        borderRadius: 999,
        border: `1.5px solid ${t.bd}`,
        background: t.bg,
        color: t.fg,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 13.5,
        cursor: "pointer",
        transition: "all .15s",
        margin: "3px",
      }}
    >
      {children}
    </button>
  );
}

function getSteps(flow, answers) {
  const feed = [
    { id: "nama", type: "text", q: "Apa nama produk yang mau dipromosikan?", placeholder: "Contoh: Bakso Lava, Es Teh Jumbo" },
    { id: "kategori", type: "choice", q: "Kategori usahanya apa?", options: Object.keys(CATEGORY_ICON) },
    { id: "foto", type: "photo", q: "Punya foto produknya?" },
    {
      id: "gaya",
      type: "choice",
      q: "Oke, gaya gambar seperti apa yang kamu mau?",
      options: ["Realistis", "Premium", "Minimalis", "Dark", "Luxury", "Street Food", "Korean", "Japanese"],
      cond: (a) => a.foto && a.foto.choice === "Tidak",
    },
    { id: "promo", type: "choice", q: "Lagi ada promo, gak?", options: ["Tidak", "Diskon", "Buy 1 Get 1", "Cashback", "Gratis Ongkir", "Promo Spesial"] },
    { id: "nominal", type: "nominal", q: "Diskonnya berapa persen?", cond: (a) => a.promo === "Diskon" },
    { id: "target", type: "choice", q: "Target pembelinya siapa nih?", options: ["Anak Sekolah", "Mahasiswa", "Karyawan", "Keluarga", "Semua Orang"] },
    { id: "tujuan", type: "choice", q: "Tujuan posting kali ini apa?", options: ["Menambah penjualan", "Mengenalkan produk", "Mengingatkan pelanggan", "Promo", "Branding"] },
    { id: "warna", type: "choice", q: "Warna dominan yang kamu mau?", options: ["Otomatis", "Merah", "Hijau", "Kuning", "Hitam", "Putih"] },
    { id: "jumlah", type: "choice", q: "Butuh berapa desain sekaligus?", options: ["1", "3", "5", "10"] },
  ];

  const story = [
    { id: "nama", type: "text", q: "Nama produk yang mau ditampilkan?", placeholder: "Contoh: Kopi Susu Gula Aren" },
    { id: "promo", type: "choice", q: "Lagi ada promo?", options: ["Tidak", "Diskon", "Buy 1 Get 1", "Cashback", "Gratis Ongkir", "Promo Spesial"] },
    { id: "nominal", type: "nominal", q: "Diskonnya berapa persen?", cond: (a) => a.promo === "Diskon" },
    { id: "foto", type: "photo", q: "Ada foto produknya?" },
  ];

  const poster = [
    { id: "nama", type: "text", q: "Nama produk atau promonya apa?", placeholder: "Contoh: Paket Hemat Ramadan" },
    { id: "promo", type: "choice", q: "Jenis promonya apa?", options: ["Tidak", "Diskon", "Buy 1 Get 1", "Cashback", "Gratis Ongkir", "Promo Spesial"] },
    { id: "nominal", type: "nominal", q: "Diskonnya berapa persen?", cond: (a) => a.promo === "Diskon" },
    { id: "tanggal", type: "tanggal", q: "Promonya berlaku tanggal berapa?" },
    { id: "foto", type: "photo", q: "Ada foto produknya?" },
  ];

  const map = { feed, story, poster };
  return (map[flow] || []).filter((s) => !s.cond || s.cond(answers));
}

function PhoneChrome({ children }) {
  return (
    <div
      style={{
        width: 390,
        height: 780,
        background: COLORS.paper,
        borderRadius: 40,
        border: `10px solid ${COLORS.ink}`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_BODY,
        boxShadow: "0 30px 60px rgba(27,42,39,0.35)",
      }}
    >
      <div
        style={{
          height: 30,
          background: COLORS.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.ink,
          flexShrink: 0,
        }}
      >
        <span>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <Signal size={13} />
          <Wifi size={13} />
          <BatteryFull size={15} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

function ScreenHeader({ title, onBack, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: `1px solid ${COLORS.line}`,
        background: COLORS.paper,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: COLORS.teal }}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div style={{ width: 22 }} />
        )}
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

function Dashboard({ brandKit, onSelect, onBrandKit, showLockedToast }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          padding: "18px 20px 22px",
          background: COLORS.teal,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: COLORS.tealPale, fontSize: 12.5, fontFamily: FONT_BODY, fontWeight: 600 }}>
              Selamat pagi 👋
            </div>
            <div style={{ color: "white", fontSize: 21, fontFamily: FONT_DISPLAY, fontWeight: 700, marginTop: 2 }}>
              {brandKit.name || "Usaha Kamu"}
            </div>
          </div>
          <button
            onClick={onBrandKit}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: COLORS.marigold,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: COLORS.ink,
            }}
          >
            <User size={18} />
          </button>
        </div>
        <div style={{ color: "white", fontSize: 15, fontFamily: FONT_BODY, fontWeight: 600, marginTop: 14 }}>
          Hari ini mau buat apa?
        </div>
      </div>

      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => (item.locked ? showLockedToast() : onSelect(item.key))}
            style={{
              background: COLORS.white,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 18,
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              cursor: "pointer",
              position: "relative",
              opacity: item.locked ? 0.55 : 1,
              textAlign: "left",
            }}
          >
            {item.locked && (
              <div style={{ position: "absolute", top: 10, right: 10, color: COLORS.ink }}>
                <Lock size={13} />
              </div>
            )}
            <div style={{ fontSize: 26 }}>{item.emoji}</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.25 }}>
              {item.label}
            </div>
            {item.locked && (
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: COLORS.chili,
                  background: COLORS.chiliPale,
                  padding: "2px 6px",
                  borderRadius: 6,
                }}
              >
                SEGERA HADIR
              </div>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px 20px", marginTop: "auto" }}>
        <div
          style={{
            background: COLORS.marigoldPale,
            borderRadius: 16,
            padding: "13px 14px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Sparkles size={18} color={COLORS.ink} />
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.ink, fontWeight: 600, lineHeight: 1.4 }}>
            Belum lengkap Brand Kit kamu. Lengkapi biar semua desain otomatis pakai warna & logo usahamu.
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandKitScreen({ brandKit, setBrandKit, onBack, showToast }) {
  const swatches = [COLORS.teal, COLORS.chili, COLORS.marigold, COLORS.leaf, "#3C3489", "#185FA5"];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <ScreenHeader title="Brand Kit" onBack={onBack} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div>
          <label style={labelStyle}>Nama usaha</label>
          <input
            style={inputStyle}
            value={brandKit.name}
            onChange={(e) => setBrandKit({ ...brandKit, name: e.target.value })}
            placeholder="Contoh: Kedai Bahagia"
          />
        </div>
        <div>
          <label style={labelStyle}>Tagline</label>
          <input
            style={inputStyle}
            value={brandKit.tagline}
            onChange={(e) => setBrandKit({ ...brandKit, tagline: e.target.value })}
            placeholder="Contoh: Rasa yang bikin nagih"
          />
        </div>
        <div>
          <label style={labelStyle}>Nomor WhatsApp</label>
          <input
            style={inputStyle}
            value={brandKit.whatsapp}
            onChange={(e) => setBrandKit({ ...brandKit, whatsapp: e.target.value })}
            placeholder="Contoh: 081234567890"
          />
        </div>
        <div>
          <label style={labelStyle}>Warna utama</label>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            {swatches.map((c) => (
              <button
                key={c}
                onClick={() => setBrandKit({ ...brandKit, color: c })}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: c,
                  border: brandKit.color === c ? `3px solid ${COLORS.ink}` : `2px solid ${COLORS.white}`,
                  boxShadow: "0 0 0 1px " + COLORS.line,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14, marginTop: 4 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, fontWeight: 700, color: COLORS.tealLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
            AI Image Generation (opsional)
          </div>
          <label style={labelStyle}>Image API URL</label>
          <input
            style={inputStyle}
            value={brandKit.imageApiUrl}
            onChange={(e) => setBrandKit({ ...brandKit, imageApiUrl: e.target.value })}
            placeholder="https://nama-project-kamu.vercel.app/api/generate-image"
          />
          <div style={{ marginTop: 10 }}>
            <label style={labelStyle}>App Secret</label>
            <input
              style={inputStyle}
              value={brandKit.appSecret}
              onChange={(e) => setBrandKit({ ...brandKit, appSecret: e.target.value })}
              placeholder="Sama persis dengan APP_SECRET di Vercel"
            />
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLORS.tealLight, marginTop: 8, lineHeight: 1.5 }}>
            Kosongkan kalau belum deploy backend-nya. App tetap jalan pakai desain template.
          </div>
        </div>
        <button
          onClick={() => {
            showToast("Brand Kit tersimpan!");
            onBack();
          }}
          style={primaryButtonStyle}
        >
          Simpan Brand Kit
        </button>
      </div>
    </div>
  );
}

const labelStyle = { fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700, color: COLORS.tealLight };
const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 12,
  border: `1.5px solid ${COLORS.line}`,
  fontFamily: FONT_BODY,
  fontSize: 14,
  color: COLORS.ink,
  outline: "none",
  boxSizing: "border-box",
};
const primaryButtonStyle = {
  marginTop: "auto",
  background: COLORS.teal,
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "13px",
  fontFamily: FONT_BODY,
  fontWeight: 700,
  fontSize: 14.5,
  cursor: "pointer",
};

function TypingBubble() {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      <Avatar />
      <div
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.line}`,
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 16px",
          display: "flex",
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COLORS.tealLight,
              display: "inline-block",
              animation: `bounceDot 1s ${i * 0.15}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: COLORS.teal,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      M
    </div>
  );
}

function WizardScreen({ flow, answers, setAnswers, onBack, onGenerate }) {
  const activeSteps = useMemo(() => getSteps(flow, answers), [flow, answers]);
  const answeredCount = activeSteps.filter((s) => answers[s.id] !== undefined).length;
  const allAnswered = activeSteps.length > 0 && answeredCount === activeSteps.length;
  const [isTyping, setIsTyping] = useState(false);
  const [nominalCustom, setNominalCustom] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const scrollRef = useRef(null);
  const prevCount = useRef(answeredCount);

  useEffect(() => {
    if (answeredCount !== prevCount.current) {
      prevCount.current = answeredCount;
      setIsTyping(true);
      const t = setTimeout(() => setIsTyping(false), 420);
      return () => clearTimeout(t);
    }
  }, [answeredCount]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [answeredCount, isTyping]);

  const flowLabel = { feed: "Feed Instagram", story: "Story Instagram", poster: "Poster Promo" }[flow];

  function answerStep(id, value) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function renderInput(step) {
    if (step.type === "text") {
      return (
        <TextInputRow
          placeholder={step.placeholder}
          onSubmit={(v) => v.trim() && answerStep(step.id, v.trim())}
        />
      );
    }
    if (step.type === "choice") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", marginLeft: 38 }}>
          {step.options.map((opt) => (
            <Chip key={opt} onClick={() => answerStep(step.id, opt)}>
              {step.id === "kategori" ? CATEGORY_ICON[opt] + " " : ""}
              {opt}
            </Chip>
          ))}
        </div>
      );
    }
    if (step.type === "nominal") {
      return (
        <div style={{ marginLeft: 38 }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {["10%", "20%", "30%"].map((opt) => (
              <Chip key={opt} onClick={() => answerStep(step.id, opt)}>
                {opt}
              </Chip>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              style={{ ...inputStyle, marginTop: 0, flex: 1 }}
              placeholder="Nominal bebas, contoh 25%"
              value={nominalCustom}
              onChange={(e) => setNominalCustom(e.target.value)}
            />
            <button
              onClick={() => nominalCustom.trim() && answerStep(step.id, nominalCustom.trim())}
              style={{ ...primaryButtonStyle, marginTop: 0, padding: "0 16px" }}
            >
              OK
            </button>
          </div>
        </div>
      );
    }
    if (step.type === "tanggal") {
      return (
        <div style={{ marginLeft: 38, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="date" style={{ ...inputStyle, marginTop: 0, width: 140 }} value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.tealLight }}>s/d</span>
          <input type="date" style={{ ...inputStyle, marginTop: 0, width: 140 }} value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          <button
            disabled={!dateStart || !dateEnd}
            onClick={() => answerStep(step.id, `${dateStart} s/d ${dateEnd}`)}
            style={{ ...primaryButtonStyle, marginTop: 0, padding: "10px 16px", opacity: !dateStart || !dateEnd ? 0.5 : 1 }}
          >
            Lanjut
          </button>
        </div>
      );
    }
    if (step.type === "photo") {
      return <PhotoStep onAnswer={(v) => answerStep(step.id, v)} />;
    }
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ScreenHeader
        title={flowLabel}
        onBack={onBack}
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.tealLight, fontWeight: 600 }}>
            {Math.min(answeredCount + 1, activeSteps.length)}/{activeSteps.length}
          </span>
        }
      />
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", background: COLORS.paperDeep }}>
        {activeSteps.map((step, i) => {
          if (i > answeredCount) return null;
          const answered = answers[step.id] !== undefined;
          return (
            <div key={step.id}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <Avatar />
                <div
                  style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: "4px 16px 16px 16px",
                    padding: "10px 14px",
                    fontFamily: FONT_BODY,
                    fontSize: 13.5,
                    color: COLORS.ink,
                    maxWidth: 260,
                    fontWeight: 600,
                  }}
                >
                  {step.q}
                </div>
              </div>
              {answered && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <div
                    style={{
                      background: COLORS.marigold,
                      borderRadius: "16px 4px 16px 16px",
                      padding: "9px 14px",
                      fontFamily: FONT_BODY,
                      fontSize: 13.5,
                      color: COLORS.ink,
                      fontWeight: 700,
                      maxWidth: 220,
                    }}
                  >
                    {formatAnswer(step, answers[step.id])}
                  </div>
                </div>
              )}
              {!answered && !isTyping && <div style={{ marginBottom: 18 }}>{renderInput(step)}</div>}
            </div>
          );
        })}
        {isTyping && <TypingBubble />}
        {allAnswered && !isTyping && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Avatar />
              <div
                style={{
                  background: COLORS.white,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: "4px 16px 16px 16px",
                  padding: "10px 14px",
                  fontFamily: FONT_BODY,
                  fontSize: 13.5,
                  color: COLORS.ink,
                  fontWeight: 600,
                }}
              >
                Siap! Semua informasi sudah lengkap 🎉
              </div>
            </div>
            <button onClick={() => onGenerate(activeSteps)} style={{ ...primaryButtonStyle, marginTop: 0, marginLeft: 38, width: "calc(100% - 38px)" }}>
              ✨ Generate Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatAnswer(step, value) {
  if (step.type === "photo") return value.choice === "Ya" ? "Ya, ada foto 📸" : "Tidak ada foto";
  return String(value);
}

function TextInputRow({ placeholder, onSubmit }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, marginLeft: 38 }}>
      <input
        style={{ ...inputStyle, marginTop: 0 }}
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit(val)}
      />
      <button onClick={() => onSubmit(val)} style={{ ...primaryButtonStyle, marginTop: 0, padding: "0 16px" }}>
        <Send size={16} />
      </button>
    </div>
  );
}

function PhotoStep({ onAnswer }) {
  const [choice, setChoice] = useState(null);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFile(reader.result);
      onAnswer({ choice: "Ya", file: reader.result });
    };
    reader.readAsDataURL(f);
  }

  if (choice === null) {
    return (
      <div style={{ display: "flex", marginLeft: 38 }}>
        <Chip onClick={() => setChoice("Ya")}>Ya, punya foto</Chip>
        <Chip onClick={() => { setChoice("Tidak"); onAnswer({ choice: "Tidak" }); }}>Tidak ada</Chip>
      </div>
    );
  }
  if (choice === "Ya" && !file) {
    return (
      <div style={{ marginLeft: 38 }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${COLORS.teal}`,
            borderRadius: 14,
            padding: "18px",
            width: 200,
            background: COLORS.tealPale,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            color: COLORS.teal,
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          <Upload size={20} />
          Pilih foto produk
        </button>
      </div>
    );
  }
  return null;
}

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = ["Menyusun ide konten...", "Meracik caption...", "Menata desain...", "Hampir selesai..."];
  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % msgs.length), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: COLORS.paper }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: `4px solid ${COLORS.tealPale}`,
          borderTopColor: COLORS.teal,
          animation: "spin 0.9s linear infinite",
        }}
      />
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: COLORS.ink }}>Mira sedang bekerja</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.tealLight, fontWeight: 600 }}>{msgs[msgIdx]}</div>
    </div>
  );
}

function Poster({ flow, answers, brandKit, svgRef, generatedImage }) {
  const ratio = { feed: [400, 400], story: [400, 711], poster: [400, 500] }[flow];
  const [w, h] = ratio;
  const category = answers.kategori || "Lainnya";
  const promo = answers.promo || "Tidak";
  const hasPromo = promo && promo !== "Tidak";
  const photo = (answers.foto && answers.foto.file) || generatedImage;
  const bgColor = answers.warna && answers.warna !== "Otomatis" ? WARNA_HEX[answers.warna] : brandKit.color;
  const imgAreaH = flow === "poster" ? h * 0.62 : h * 0.66;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", background: COLORS.white, borderRadius: 14 }}>
      <defs>
        <clipPath id="imgClip">
          <rect x="0" y="0" width={w} height={imgAreaH} rx="0" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width={w} height={h} fill={COLORS.white} />
      {photo ? (
        <image href={photo} x="0" y="0" width={w} height={imgAreaH} preserveAspectRatio="xMidYMid slice" clipPath="url(#imgClip)" />
      ) : (
        <g clipPath="url(#imgClip)">
          <rect x="0" y="0" width={w} height={imgAreaH} fill={bgColor} />
          <circle cx={w * 0.78} cy={imgAreaH * 0.28} r={w * 0.22} fill="#ffffff22" />
          <circle cx={w * 0.16} cy={imgAreaH * 0.78} r={w * 0.16} fill="#ffffff18" />
          <text x={w / 2} y={imgAreaH / 2 + 18} fontSize={w * 0.22} textAnchor="middle">
            {CATEGORY_ICON[category] || "🏪"}
          </text>
        </g>
      )}
      {hasPromo && (
        <g>
          <rect x={w - 108} y={14} width={94} height={30} rx={15} fill={COLORS.chili} />
          <text x={w - 61} y={34} fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily={FONT_BODY}>
            {promo === "Diskon" ? `DISKON ${answers.nominal || ""}` : promo.toUpperCase()}
          </text>
        </g>
      )}
      <rect x="0" y={imgAreaH} width={w} height={h - imgAreaH} fill={COLORS.paper} />
      <text x="20" y={imgAreaH + 30} fontSize="11" fontWeight="700" fill={COLORS.tealLight} fontFamily={FONT_BODY} style={{ textTransform: "uppercase", letterSpacing: 1 }}>
        {brandKit.name || "Brand Kamu"}
      </text>
      <text x="20" y={imgAreaH + 58} fontSize="22" fontWeight="800" fill={COLORS.ink} fontFamily={FONT_DISPLAY}>
        {(answers.nama || "Produk Andalan").slice(0, 22)}
      </text>
      <rect x="20" y={h - 44} width={w - 40} height={28} rx={14} fill={COLORS.teal} />
      <text x={w / 2} y={h - 25} fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily={FONT_BODY}>
        {brandKit.tagline || "Order sekarang!"}
      </text>
    </svg>
  );
}

function downloadSvg(svgRef, filename) {
  try {
    const svgEl = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if (!source.includes("xmlns=")) {
      source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

function PreviewScreen({ flow, answers, brandKit, content, generatedImage, imageError, onBack, onNewFlow, onRegenerate, showToast }) {
  const svgRef = useRef(null);
  const [regenerating, setRegenerating] = useState(false);
  const flowLabel = { feed: "Feed Instagram", story: "Story Instagram", poster: "Poster Promo" }[flow];

  async function handleRegenerate() {
    setRegenerating(true);
    await onRegenerate();
    setRegenerating(false);
    showToast("Variasi baru dibuat!");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ScreenHeader title={`Preview - ${flowLabel}`} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: 16, background: COLORS.paperDeep }}>
        <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <Poster flow={flow} answers={answers} brandKit={brandKit} svgRef={svgRef} generatedImage={generatedImage} />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 6,
              background: content && content._real ? COLORS.tealPale : COLORS.marigoldPale,
              color: content && content._real ? COLORS.teal : COLORS.ink,
            }}
          >
            {content && content._real ? "TEKS DARI AI" : "TEKS TEMPLATE (AI gagal, fallback)"}
          </span>
          {answers.foto && answers.foto.choice === "Tidak" && (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
                background: generatedImage ? COLORS.tealPale : COLORS.chiliPale,
                color: generatedImage ? COLORS.teal : COLORS.chili,
              }}
            >
              {generatedImage ? "GAMBAR DARI AI" : brandKit.imageApiUrl ? "GAMBAR GAGAL, PAKAI TEMPLATE" : "GAMBAR TEMPLATE (belum ada Image API)"}
            </span>
          )}
        </div>
        {imageError && (
          <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: COLORS.chili, marginBottom: 12, lineHeight: 1.5 }}>
            Gambar AI gagal dibuat: {imageError}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => {
              const ok = downloadSvg(svgRef, `${flow}-${slugTag(answers.nama || "desain")}.svg`);
              showToast(ok ? "Desain diunduh!" : "Gagal mengunduh, coba lagi.");
            }}
            style={{ ...actionBtnStyle, background: COLORS.teal, color: "white" }}
          >
            <Download size={15} /> Unduh
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{ ...actionBtnStyle, background: COLORS.white, color: COLORS.ink, border: `1.5px solid ${COLORS.line}`, opacity: regenerating ? 0.6 : 1 }}
          >
            <RefreshCw size={15} className={regenerating ? "spin-icon" : ""} /> {regenerating ? "Membuat..." : "Ulang"}
          </button>
          <button
            onClick={() => showToast("Dibagikan ke Instagram!")}
            style={{ ...actionBtnStyle, background: COLORS.white, color: COLORS.ink, border: `1.5px solid ${COLORS.line}` }}
          >
            <Share2 size={15} />
          </button>
        </div>

        <SectionLabel>Caption</SectionLabel>
        <div style={cardBoxStyle}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.ink, whiteSpace: "pre-line", lineHeight: 1.55 }}>
            {content.caption}
          </div>
          <button
            onClick={async () => showToast((await copyText(content.caption)) ? "Caption disalin!" : "Gagal menyalin.")}
            style={copyBtnStyle}
          >
            <Copy size={12} /> Salin
          </button>
        </div>

        <SectionLabel>Hashtag</SectionLabel>
        <div style={cardBoxStyle}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {content.hashtags.map((h) => (
              <span key={h} style={{ background: COLORS.tealPale, color: COLORS.teal, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, fontFamily: FONT_BODY }}>
                {h}
              </span>
            ))}
          </div>
          <button
            onClick={async () => showToast((await copyText(content.hashtags.join(" "))) ? "Hashtag disalin!" : "Gagal menyalin.")}
            style={copyBtnStyle}
          >
            <Copy size={12} /> Salin
          </button>
        </div>

        <SectionLabel>Call to action</SectionLabel>
        <div style={cardBoxStyle}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.ink, fontWeight: 700 }}>{content.cta}</div>
        </div>

        <button onClick={onNewFlow} style={{ ...primaryButtonStyle, marginTop: 16, width: "100%" }}>
          Buat Konten Baru
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, fontWeight: 700, color: COLORS.tealLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6, marginTop: 4 }}>
      {children}
    </div>
  );
}

const cardBoxStyle = {
  background: COLORS.white,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 14,
  position: "relative",
};
const copyBtnStyle = {
  marginTop: 8,
  background: "none",
  border: "none",
  color: COLORS.teal,
  fontFamily: FONT_BODY,
  fontWeight: 700,
  fontSize: 11.5,
  display: "flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  padding: 0,
};
const actionBtnStyle = {
  flex: 1,
  border: "none",
  borderRadius: 12,
  padding: "11px 10px",
  fontFamily: FONT_BODY,
  fontWeight: 700,
  fontSize: 12.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  cursor: "pointer",
};

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [flow, setFlow] = useState(null);
  const [answers, setAnswers] = useState({});
  const [brandKit, setBrandKit] = useState({
    name: "Kedai Bahagia",
    tagline: "Rasa yang bikin nagih",
    whatsapp: "081234567890",
    color: COLORS.teal,
    imageApiUrl: "",
    appSecret: "",
  });
  const [toast, setToast] = useState(null);
  const [content, setContent] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageError, setImageError] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function startFlow(key) {
    setFlow(key);
    setAnswers({});
    setContent(null);
    setGeneratedImage(null);
    setImageError(null);
    setScreen("wizard");
  }

  async function runGeneration(variation) {
    let nextContent;
    try {
      nextContent = await callTextAI({ flow, answers, brandKit, variation });
      nextContent._real = true;
    } catch (e) {
      nextContent = generateContent({ flow, answers, brandKit, seed: hashStr((answers.nama || "") + flow + (variation || 0)) });
      nextContent._real = false;
    }
    setContent(nextContent);

    if (answers.foto && answers.foto.choice === "Tidak" && brandKit.imageApiUrl) {
      try {
        const img = await callImageAI({ product: answers.nama, category: answers.kategori, style: answers.gaya, brandKit });
        setGeneratedImage(img);
        setImageError(null);
      } catch (e) {
        setGeneratedImage(null);
        setImageError(e.message);
      }
    }
  }

  async function handleGenerate() {
    setScreen("loading");
    await runGeneration(0);
    setScreen("preview");
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes bounceDot { 0%,80%,100% { transform: translateY(0); opacity: .5; } 40% { transform: translateY(-4px); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.9s linear infinite; }
        input:focus { outline: none; border-color: ${COLORS.teal} !important; }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
      <PhoneChrome>
        {screen === "dashboard" && (
          <Dashboard
            brandKit={brandKit}
            onSelect={startFlow}
            onBrandKit={() => setScreen("brandkit")}
            showLockedToast={() => showToast("Fitur ini akan hadir di versi berikutnya 🚧")}
          />
        )}
        {screen === "brandkit" && (
          <BrandKitScreen brandKit={brandKit} setBrandKit={setBrandKit} onBack={() => setScreen("dashboard")} showToast={showToast} />
        )}
        {screen === "wizard" && (
          <WizardScreen
            flow={flow}
            answers={answers}
            setAnswers={setAnswers}
            onBack={() => setScreen("dashboard")}
            onGenerate={handleGenerate}
          />
        )}
        {screen === "loading" && <LoadingScreen />}
        {screen === "preview" && (
          <PreviewScreen
            flow={flow}
            answers={answers}
            brandKit={brandKit}
            content={content}
            generatedImage={generatedImage}
            imageError={imageError}
            onBack={() => setScreen("wizard")}
            onNewFlow={() => setScreen("dashboard")}
            onRegenerate={() => runGeneration(1)}
            showToast={showToast}
          />
        )}
        <Toast toast={toast} />
      </PhoneChrome>
    </div>
  );
}

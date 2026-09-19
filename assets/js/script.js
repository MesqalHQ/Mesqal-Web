// ============================================================
// CONFIG — Change this to point to your API
// ============================================================
const CONFIG = {
  API_BASE: "https://mesqalhq.github.io/Mesqal-API",
  FIN_API: "https://api.dastyar.io/express/financial-item",
  PAMP_API: "https://amirmasoud.netlify.app/api/v1/pamp",
  REFRESH_INTERVAL: 60 * 1000, // 60 seconds (future use)
};

// ============================================================
// STORAGE
// ============================================================
function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {}
}

// ============================================================
// CORS-SAFE FETCH (handles opaque responses + errors)
// ============================================================
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      mode: "cors",
      credentials: "omit",
    });
    if (!res.ok) {
      console.warn(`Fetch failed: ${res.status} ${res.statusText} for ${url}`);
      return null;
    }
    return res;
  } catch (err) {
    console.warn(`Network error fetching ${url}:`, err.message);
    return null;
  }
}

// ============================================================
// TRANSLATIONS
// ============================================================
const translations = {
  en: {
    daily: "Daily",
    monthly: "Monthly",
    loading: "Loading...",
    tagline: "Gold, currency & PAMP — live from Tehran",
    all: "All",
    currencies: "Currencies",
    gold: "Gold",
    crypto: "Crypto",
    favorites: "Favorites",
    charts: "Charts",
    heatmap: "Heatmap",
    table: "Table",
    wallet: "Wallet",
    calendar: "Calendar",
    afford: "Afford",
    search: "Search assets...",
    trend: "Trend",
    columns: "Columns",
    asset: "Asset",
    now: "Now",
    low: "Low",
    high: "High",
    change: "Change",
    value: "Value",
    noData: "No data loaded.",
    noFavorites: "No favorite assets yet. Click the star on a card to add one.",
    noAssets: "No assets found.",
    lastUpdated: "Last updated",
    monthlyView: "Monthly view",
    totalValue: "Total Value",
    holdings: "Holdings",
    addHolding: "Add Holding",
    quantity: "Quantity",
    remove: "Remove",
    walletEmpty:
      "No holdings yet. Click 'Add Holding' to start tracking your portfolio.",
    selectAsset: "Select Asset",
    enterQuantity: "Enter Quantity",
    add: "Add",
    cancel: "Cancel",
    dayChange: "Day change",
    start: "Start",
    end: "End",
    affordHave: "I have (Toman)",
    perUnit: "Price per unit",
    units: "units",
    loadingCalendar: "Loading calendar data...",
  },
  fa: {
    daily: "روزانه",
    monthly: "ماهانه",
    loading: "در حال بارگذاری...",
    tagline: "طلا، ارز و پمپ — زنده از تهران",
    all: "همه",
    currencies: "ارزها",
    gold: "طلا",
    crypto: "کریپتو",
    favorites: "علاقه‌مندی‌ها",
    charts: "نمودار",
    heatmap: "نقشه حرارتی",
    table: "جدول",
    wallet: "کیف پول",
    calendar: "تقویم",
    afford: "قدرت خرید",
    search: "جستجوی دارایی‌ها...",
    trend: "روند",
    columns: "ستون‌ها",
    asset: "دارایی",
    now: "اکنون",
    low: "کمترین",
    high: "بیشترین",
    change: "تغییر",
    value: "ارزش",
    noData: "داده‌ای بارگذاری نشده است.",
    noFavorites: "هنوز علاقه‌مندی ندارید. روی ستاره کارت کلیک کنید.",
    noAssets: "دارایی یافت نشد.",
    lastUpdated: "آخرین به‌روزرسانی",
    monthlyView: "نمای ماهانه",
    totalValue: "ارزش کل",
    holdings: "دارایی‌ها",
    addHolding: "افزودن دارایی",
    quantity: "مقدار",
    remove: "حذف",
    walletEmpty: "هنوز دارایی ندارید. روی 'افزودن دارایی' کلیک کنید.",
    selectAsset: "انتخاب دارایی",
    enterQuantity: "مقدار را وارد کنید",
    add: "افزودن",
    cancel: "انصراف",
    dayChange: "تغییر روز",
    start: "ابتدا",
    end: "پایان",
    affordHave: "مبلغ من (تومان)",
    perUnit: "قیمت هر واحد",
    units: "واحد",
    loadingCalendar: "در حال بارگذاری داده‌های تقویم...",
  },
};

let currentLang = storageGet("lang") || "en";
function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}
function numLocale() {
  return currentLang === "fa" ? "fa-IR" : "en-US";
}

// ============================================================
// UTILS
// ============================================================
function toEnglishDigits(s) {
  return String(s)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}

function debounce(fn, wait = 200) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
}

function fmt(v) {
  const n = Number(v);
  if (v == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(numLocale(), { maximumFractionDigits: 2 });
}

function fmtQty(q) {
  if (q == null || !Number.isFinite(q)) return "—";
  if (q >= 1)
    return q.toLocaleString(numLocale(), { maximumFractionDigits: 2 });
  return q.toLocaleString(numLocale(), { maximumFractionDigits: 6 });
}

function animateIn(el) {
  if (!el) return;
  el.classList.remove("anim-in");
  void el.offsetWidth;
  el.classList.add("anim-in");
}

// ============================================================
// JALALI DATE
// ============================================================
let jalaliFullFormatter, jalaliShortFormatter, jalaliMonthFormatter;
const jalaliMonthKeyFormatter = new Intl.DateTimeFormat(
  "en-US-u-ca-persian-nu-latn",
  {
    year: "numeric",
    month: "numeric",
  },
);

function buildDateFormatters() {
  const locale =
    currentLang === "fa" ? "fa-IR-u-ca-persian" : "en-US-u-ca-persian-nu-latn";
  jalaliFullFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  jalaliShortFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  jalaliMonthFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  });
}

function parseDate(d) {
  return new Date(`${d}T12:00:00Z`);
}
function toJalali(d) {
  return jalaliFullFormatter.format(parseDate(d));
}
function toJalaliShort(d) {
  return jalaliShortFormatter.format(parseDate(d));
}
function getJalaliMonthLabel(d) {
  return jalaliMonthFormatter.format(parseDate(d));
}
function getJalaliMonthKey(d) {
  const parts = jalaliMonthKeyFormatter.formatToParts(parseDate(d));
  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  return `${y}-${m.padStart(2, "0")}`;
}

// ============================================================
// ASSETS
// ============================================================
const ASSETS = [
  {
    id: "usd",
    key: "usd",
    label: "USD",
    color: "#3b82f6",
    category: "currency",
  },
  {
    id: "eur",
    key: "eur",
    label: "EUR",
    color: "#a855f7",
    category: "currency",
  },
  {
    id: "gbp",
    key: "gbp",
    label: "GBP",
    color: "#8b5cf6",
    category: "currency",
  },
  {
    id: "rob",
    key: "rob",
    label: "Roub",
    color: "#ec4899",
    category: "currency",
  },
  {
    id: "try",
    key: "try",
    label: "TRY",
    color: "#ef4444",
    category: "currency",
  },
  {
    id: "aed",
    key: "aed",
    label: "AED",
    color: "#10b981",
    category: "currency",
  },
  {
    id: "sekkeh",
    key: "sekkeh",
    label: "Sekkeh",
    color: "#eab308",
    category: "gold",
  },
  {
    id: "gold",
    key: "18ayar",
    label: "Gold 18k",
    color: "#f59e0b",
    category: "gold",
  },
  {
    id: "btc",
    key: "usd_btc",
    label: "Bitcoin",
    color: "#f97316",
    category: "crypto",
  },
  {
    id: "usdt",
    key: "usd_usdt",
    label: "Tether",
    color: "#22c55e",
    category: "crypto",
  },
  { id: "pamp1", key: 1, label: "PAMP 1g", color: "#eab308", category: "pamp" },
  {
    id: "pamp2_5",
    key: 2.5,
    label: "PAMP 2.5g",
    color: "#eab308",
    category: "pamp",
  },
  { id: "pamp5", key: 5, label: "PAMP 5g", color: "#f97316", category: "pamp" },
  {
    id: "pamp10",
    key: 10,
    label: "PAMP 10g",
    color: "#f97316",
    category: "pamp",
  },
  {
    id: "pamp15",
    key: 15.55175,
    label: "PAMP 15.55g",
    color: "#ef4444",
    category: "pamp",
  },
  {
    id: "pamp20",
    key: 20,
    label: "PAMP 20g",
    color: "#ef4444",
    category: "pamp",
  },
  {
    id: "pamp31_1",
    key: 31.1035,
    label: "PAMP 1oz",
    color: "#ec4899",
    category: "pamp",
  },
  {
    id: "pamp50",
    key: 50,
    label: "PAMP 50g",
    color: "#8b5cf6",
    category: "pamp",
  },
  {
    id: "pamp100",
    key: 100,
    label: "PAMP 100g",
    color: "#a855f7",
    category: "pamp",
  },
];

const ICON_FALLBACKS = {
  usd: "https://liara-s3.dastyar.io/Img/icons/finance/dollar.svg",
  eur: "https://liara-s3.dastyar.io/Img/icons/finance/euro.svg",
  gbp: "https://liara-s3.dastyar.io/Img/icons/finance/pound.svg",
  aed: "https://liara-s3.dastyar.io/Img/icons/finance/aed.svg",
  try: "https://liara-s3.dastyar.io/Img/icons/finance/tl.svg",
  pamp1: "https://zcoinn.com/wp-content/uploads/2022/08/1g-blue-copy.webp",
  pamp2_5: "https://zcoinn.com/wp-content/uploads/2022/08/2.5-blue-copy.webp",
  pamp5: "https://zcoinn.com/wp-content/uploads/2022/08/5g-blue-copy.webp",
  pamp10: "https://zcoinn.com/wp-content/uploads/2022/08/1.2oz-blue-copy.webp",
  pamp15: "https://zcoinn.com/wp-content/uploads/2022/08/10g-blue-copy.webp",
  pamp20: "https://zcoinn.com/wp-content/uploads/2022/08/20g-blue-copy.webp",
  pamp31_1: "https://zcoinn.com/wp-content/uploads/2022/12/1oz-blue-copy.webp",
  pamp50: "https://zcoinn.com/wp-content/uploads/2022/08/50blue.png",
  pamp100: "https://zcoinn.com/wp-content/uploads/2022/08/50blue.png",
};

const assetMeta = {};

function mergeFinMeta(item) {
  const asset = ASSETS.find((a) => String(a.key) === String(item.key));
  if (asset && (item.icon || item.image)) {
    assetMeta[asset.id] = {
      icon: item.icon || item.image,
      faTitle: item.title || "",
    };
  }
}

function mergePampMeta(item) {
  const asset = ASSETS.find((a) => Number(a.key) === Number(item.weightGram));
  if (asset && item.image) {
    assetMeta[asset.id] = { icon: item.image, faTitle: item.name || "" };
  }
}

function extractMetaFromEntry(entry) {
  if (!entry) return;
  const fin = Array.isArray(entry.financial)
    ? entry.financial
    : Array.isArray(entry.data)
      ? entry.data
      : null;
  if (fin) fin.forEach(mergeFinMeta);
  if (entry.pamp && Array.isArray(entry.pamp.items)) {
    entry.pamp.items.forEach(mergePampMeta);
  }
}

async function loadAssetMetaFromAPI() {
  try {
    const [finRes, pampRes] = await Promise.allSettled([
      safeFetch(CONFIG.FIN_API).then((r) => r?.json()),
      safeFetch(CONFIG.PAMP_API).then((r) => r?.json()),
    ]);
    if (finRes.status === "fulfilled" && Array.isArray(finRes.value)) {
      finRes.value.forEach(mergeFinMeta);
    }
    if (
      pampRes.status === "fulfilled" &&
      pampRes.value &&
      Array.isArray(pampRes.value.items)
    ) {
      pampRes.value.items.forEach(mergePampMeta);
    }
  } catch (e) {
    console.warn("Meta API load failed:", e);
  }
  if (currentEntries.length) renderDashboard();
}

function getAssetIcon(asset) {
  return assetMeta[asset.id]?.icon || ICON_FALLBACKS[asset.id] || null;
}

function assetLabel(asset) {
  if (currentLang === "fa") {
    if (asset.category === "pamp") {
      return asset.key === 31.1035 ? "پمپ ۱ اونسی" : `پمپ ${asset.key} گرمی`;
    }
    const fa = assetMeta[asset.id]?.faTitle;
    if (fa) return fa;
  }
  return asset.label;
}

function iconHtml(asset) {
  const src = getAssetIcon(asset);
  const dot = `<span class="asset-icon-fallback" style="background:${asset.color};display:${src ? "none" : "inline-block"}"></span>`;
  if (!src) return dot;
  return `<img class="asset-icon" src="${src}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';">${dot}`;
}

// ============================================================
// DOM ELEMENTS
// ============================================================
const charts = {};
const dataCache = new Map();
const calendarCache = new Map();
let assetStats = {};

const grid = document.getElementById("chartGrid");
const heatmapGrid = document.getElementById("heatmapGrid");
const tableContainer = document.getElementById("tableContainer");
const tableBody = document.getElementById("tableBody");
const walletSection = document.getElementById("walletSection");
const walletSummary = document.getElementById("walletSummary");
const walletActions = document.getElementById("walletActions");
const walletTable = document.getElementById("walletTable");
const calendarSection = document.getElementById("calendarSection");
const calendarHeader = document.getElementById("calendarHeader");
const calendarGrid = document.getElementById("calendarGrid");
const calTooltip = document.getElementById("calTooltip");
const affordSection = document.getElementById("affordSection");
const affordGrid = document.getElementById("affordGrid");
const affordAmountInput = document.getElementById("affordAmount");
const colsToggle = document.getElementById("colsToggle");
const dateBtn = document.getElementById("dateBtn");
const dateBtnText = document.getElementById("dateBtnText");
const dateMenu = document.getElementById("dateMenu");
const appFooter = document.getElementById("appFooter");
const categoryTabs = document.getElementById("categoryTabs");
const assetSearch = document.getElementById("assetSearch");
const viewToggle = document.getElementById("viewToggle");
const modeToggle = document.getElementById("modeToggle");
const themeBtn = document.getElementById("themeBtn");
const langBtn = document.getElementById("langBtn");
const styleBtn = document.getElementById("styleBtn");
const menuBtn = document.getElementById("menuBtn");
const drawerClose = document.getElementById("drawerClose");
const drawerOverlay = document.getElementById("drawerOverlay");
const commandPalette = document.getElementById("commandPalette");
const commandSearch = document.getElementById("commandSearch");
const commandList = document.getElementById("commandList");

const modeSections = {
  charts: grid,
  heatmap: heatmapGrid,
  table: tableContainer,
  wallet: walletSection,
  calendar: calendarSection,
  afford: affordSection,
};

// ============================================================
// STATE
// ============================================================
let currentView = "daily";
let currentMode = "charts";
let activeCategory = "all";
let searchQuery = "";
let allDates = [];
let allMonths = [];
let currentEntries = [];
let currentLabels = [];
let displayLabels = [];
let displayIndices = [];
let selectedDate = null;
let selectedMonthKey = null;
let lastFooter = null;

let favorites = [];
try {
  favorites = JSON.parse(storageGet("favorites") || "[]");
} catch {
  favorites = [];
}

let wallet = [];
try {
  wallet = JSON.parse(storageGet("wallet") || "[]");
} catch {
  wallet = [];
}

let chartsPerRow = parseInt(storageGet("chartsPerRow") || "2", 10);
if (![1, 2, 3, 4].includes(chartsPerRow)) chartsPerRow = 2;

let currentTheme = storageGet("theme");
if (!currentTheme) {
  currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let currentStyle = storageGet("style");
if (currentStyle === "brutal" && !storageGet("styleV2")) {
  currentStyle = "neo";
  storageSet("style", "neo");
}
storageSet("styleV2", "1");
if (!currentStyle) currentStyle = "flat";

const STYLES = ["flat", "neo", "brutal", "glass", "neu"];
const STYLE_NAMES = {
  flat: "Flat",
  neo: "Neo-Brutalism",
  brutal: "Brutalism",
  glass: "Glassmorphism",
  neu: "Neumorphism",
};
const URL_DEFAULTS = {
  view: "daily",
  mode: "charts",
  category: "all",
  lang: "en",
  style: "flat",
};

// ============================================================
// DRAWER
// ============================================================
const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
function openDrawer() {
  document.body.classList.add("drawer-open");
}
function closeDrawer() {
  document.body.classList.remove("drawer-open");
}
function closeDrawerIfMobile() {
  if (isMobile()) closeDrawer();
}

menuBtn.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

// ============================================================
// COLUMNS
// ============================================================
function applyCols() {
  grid.classList.remove("cols-1", "cols-2", "cols-3", "cols-4");
  grid.classList.add("cols-" + chartsPerRow);
  colsToggle.querySelectorAll("button[data-cols]").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.cols) === chartsPerRow);
  });
}

colsToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cols]");
  if (!btn) return;
  chartsPerRow = Number(btn.dataset.cols);
  storageSet("chartsPerRow", String(chartsPerRow));
  applyCols();
});

// ============================================================
// SEO
// ============================================================
function fillSEO() {
  const base = location.origin + location.pathname;
  document.getElementById("canonicalLink")?.setAttribute("href", base);
  document.getElementById("ogUrl")?.setAttribute("content", base);
  document
    .getElementById("ogImage")
    ?.setAttribute("content", base + "favicon.svg");
  document
    .getElementById("twitterImage")
    ?.setAttribute("content", base + "favicon.svg");

  if (!document.querySelector('link[hreflang="fa"]')) {
    [
      ["fa", base + "?lang=fa"],
      ["en", base + "?lang=en"],
      ["x-default", base],
    ].forEach(([hl, href]) => {
      const l = document.createElement("link");
      l.rel = "alternate";
      l.hreflang = hl;
      l.href = href;
      document.head.appendChild(l);
    });
  }

  const today = new Date();
  const g = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const chip = document.getElementById("todayChip");
  if (chip) chip.textContent = toJalali(g);
}

// ============================================================
// URL STATE
// ============================================================
function parseURLState() {
  const p = new URLSearchParams(window.location.search);
  if (p.has("view")) currentView = p.get("view");
  if (p.has("mode")) currentMode = p.get("mode");
  if (p.has("category")) activeCategory = p.get("category");
  if (p.has("lang")) currentLang = p.get("lang");
  if (p.has("style")) currentStyle = p.get("style");
  if (p.has("q")) searchQuery = p.get("q");
}

function updateURLState() {
  const p = new URLSearchParams();
  if (currentView !== URL_DEFAULTS.view) p.set("view", currentView);
  if (currentMode !== URL_DEFAULTS.mode) p.set("mode", currentMode);
  if (activeCategory !== URL_DEFAULTS.category)
    p.set("category", activeCategory);
  if (currentLang !== URL_DEFAULTS.lang) p.set("lang", currentLang);
  if (currentStyle !== URL_DEFAULTS.style) p.set("style", currentStyle);
  if (searchQuery) p.set("q", searchQuery);
  const qs = p.toString();
  window.history.replaceState(
    {},
    "",
    window.location.pathname + (qs ? `?${qs}` : ""),
  );
}

// ============================================================
// AFFORD INPUT
// ============================================================
function getAffordAmount() {
  const raw = toEnglishDigits(affordAmountInput.dataset.raw || "").replace(
    /\D/g,
    "",
  );
  return raw ? parseFloat(raw) : 0;
}

function formatAffordInput() {
  const digits = toEnglishDigits(affordAmountInput.value)
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "");
  affordAmountInput.dataset.raw = digits;
  affordAmountInput.value = digits
    ? Number(digits).toLocaleString(numLocale())
    : "";
}

function refreshAffordInputDisplay() {
  const raw = (affordAmountInput.dataset.raw || "").replace(/\D/g, "");
  affordAmountInput.value = raw ? Number(raw).toLocaleString(numLocale()) : "";
}

affordAmountInput.addEventListener("input", () => {
  formatAffordInput();
  storageSet("affordAmount", affordAmountInput.dataset.raw || "");
  if (currentMode === "afford") renderAfford();
});

// ============================================================
// SKELETON
// ============================================================
function renderSkeletonCards() {
  grid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `<div class="skeleton-line title"></div><div class="skeleton-line price"></div><div class="skeleton-line chart"></div>`;
    grid.appendChild(skeleton);
  }
}

// ============================================================
// CHART COLORS
// ============================================================
function getChartColors() {
  const style = document.documentElement.getAttribute("data-style");
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const flatFont = "'Inter','Vazirmatn',sans-serif";
  const dispFont = "'Space Grotesk','Vazirmatn',sans-serif";

  if (style === "neo") {
    return isDark
      ? {
          text: "#F3E9D2",
          grid: "rgba(243,233,210,0.16)",
          casing: null,
          fill: true,
          fontFamily: dispFont,
          tooltipBg: "#241E17",
          tooltipText: "#F3E9D2",
          tooltipBorder: "#EFE3C8",
        }
      : {
          text: "#141414",
          grid: "rgba(20,20,20,0.22)",
          casing: "#141414",
          fill: false,
          fontFamily: dispFont,
          tooltipBg: "#FBF3E0",
          tooltipText: "#141414",
          tooltipBorder: "#141414",
        };
  }
  if (style === "brutal") {
    return isDark
      ? {
          text: "#EDEDED",
          grid: "rgba(237,237,237,0.2)",
          casing: null,
          fill: false,
          fontFamily: dispFont,
          tooltipBg: "#141414",
          tooltipText: "#EDEDED",
          tooltipBorder: "#EDEDED",
        }
      : {
          text: "#111111",
          grid: "rgba(17,17,17,0.25)",
          casing: null,
          fill: false,
          fontFamily: dispFont,
          tooltipBg: "#D6D3CC",
          tooltipText: "#111111",
          tooltipBorder: "#111111",
        };
  }
  if (style === "glass") {
    return isDark
      ? {
          text: "#9AA7C7",
          grid: "rgba(255,255,255,0.08)",
          casing: null,
          fill: true,
          fontFamily: flatFont,
          tooltipBg: "rgba(20,26,48,0.92)",
          tooltipText: "#F1F5FF",
          tooltipBorder: "rgba(255,255,255,0.2)",
        }
      : {
          text: "#5A6785",
          grid: "rgba(27,35,64,0.08)",
          casing: null,
          fill: true,
          fontFamily: flatFont,
          tooltipBg: "rgba(255,255,255,0.92)",
          tooltipText: "#1B2340",
          tooltipBorder: "rgba(27,35,64,0.2)",
        };
  }
  if (style === "neu") {
    return isDark
      ? {
          text: "#7C8595",
          grid: "rgba(215,220,230,0.08)",
          casing: null,
          fill: true,
          fontFamily: flatFont,
          tooltipBg: "#23272E",
          tooltipText: "#D7DCE6",
          tooltipBorder: "#3A404B",
        }
      : {
          text: "#8A94A6",
          grid: "rgba(138,148,166,0.25)",
          casing: null,
          fill: true,
          fontFamily: flatFont,
          tooltipBg: "#E4E9F2",
          tooltipText: "#4A5568",
          tooltipBorder: "#C6CFDD",
        };
  }
  return isDark
    ? {
        text: "#a1a1aa",
        grid: "rgba(255,255,255,0.06)",
        casing: null,
        fill: true,
        fontFamily: flatFont,
        tooltipBg: "#18181b",
        tooltipText: "#fafafa",
        tooltipBorder: "#27272a",
      }
    : {
        text: "#71717a",
        grid: "rgba(0,0,0,0.06)",
        casing: null,
        fill: true,
        fontFamily: flatFont,
        tooltipBg: "#ffffff",
        tooltipText: "#18181b",
        tooltipBorder: "#e4e4e7",
      };
}

function syncThemeColorMeta() {
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();
  const meta = document.getElementById("metaThemeColor");
  if (meta && bg) meta.content = bg;
}

function applyTheme(theme) {
  currentTheme = theme;
  storageSet("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.innerHTML =
    theme === "dark"
      ? '<i data-feather="moon"></i>'
      : '<i data-feather="sun"></i>';
  feather.replace();
  syncThemeColorMeta();
  closeDrawerIfMobile();
  renderDashboard();
}

function applyStyle(style) {
  currentStyle = style;
  storageSet("style", style);
  document.documentElement.setAttribute("data-style", style);
  styleBtn.title = "Style: " + (STYLE_NAMES[style] || style);
  syncThemeColorMeta();
  closeDrawerIfMobile();
  renderDashboard();
  updateURLState();
}

// ============================================================
// LANGUAGE
// ============================================================
function applyLanguage(lang) {
  currentLang = lang;
  storageSet("lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  buildDateFormatters();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.getAttribute("data-i18n-title"));
  });
  langBtn.textContent = lang === "en" ? "EN" : "فا";
  document
    .getElementById("ogLocale")
    ?.setAttribute("content", lang === "fa" ? "fa_IR" : "en_US");
  refreshAffordInputDisplay();
  rebuildMonths();
  renderDateMenu();
  refreshDateLabel();
  renderFooter();
  fillSEO();
  closeDrawerIfMobile();
  renderDashboard();
}

function refreshDateLabel() {
  if (currentView === "daily") {
    dateBtnText.textContent = selectedDate
      ? toJalali(selectedDate)
      : t("loading");
  } else {
    const m = allMonths.find((m) => m.key === selectedMonthKey);
    dateBtnText.textContent = m ? m.label : t("loading");
  }
}

function renderFooter() {
  if (!lastFooter) {
    appFooter.textContent = "Mesqal | مثقال — data updated via GitHub Actions";
    return;
  }
  const prefix =
    lastFooter.view === "daily" ? t("lastUpdated") : t("monthlyView");
  appFooter.textContent = `Mesqal | مثقال — ${prefix}: ${toJalali(lastFooter.dateStr)} — ${lastFooter.time}`;
}

// ============================================================
// FAVORITES
// ============================================================
function toggleFavorite(id) {
  favorites = favorites.includes(id)
    ? favorites.filter((f) => f !== id)
    : [...favorites, id];
  storageSet("favorites", JSON.stringify(favorites));
}

// ============================================================
// PRICES
// ============================================================
function getAssetPriceInToman(asset, entries) {
  const values = getAssetValues(asset, entries);
  const price = values[values.length - 1];
  if (!price) return null;
  if (String(asset.key).startsWith("usd_")) {
    const usdAsset = ASSETS.find((a) => a.key === "usd");
    const usdValues = getAssetValues(usdAsset, entries);
    const usdPrice = usdValues[usdValues.length - 1];
    return usdPrice ? price * usdPrice : null;
  }
  return price;
}

// ============================================================
// WALLET
// ============================================================
function calculateWalletValue() {
  if (!currentEntries.length || !wallet.length)
    return { total: 0, holdings: [] };
  let total = 0;
  const holdings = wallet
    .map((h) => {
      const asset = ASSETS.find((a) => a.id === h.assetId);
      if (!asset) return null;
      const price = getAssetPriceInToman(asset, currentEntries);
      if (!price) return null;
      const value = price * h.quantity;
      total += value;
      return { asset, quantity: h.quantity, price, value, percentage: 0 };
    })
    .filter(Boolean);
  holdings.forEach((h) => {
    h.percentage = total > 0 ? (h.value / total) * 100 : 0;
  });
  return { total, holdings };
}

function renderWallet() {
  grid.style.display = "none";
  heatmapGrid.style.display = "none";
  tableContainer.style.display = "none";
  calendarSection.style.display = "none";
  affordSection.style.display = "none";
  walletSection.style.display = "";

  if (!currentEntries.length) {
    walletSummary.innerHTML = "";
    walletActions.innerHTML = "";
    walletTable.innerHTML = `<div class="wallet-empty">${t("noData")}</div>`;
    return;
  }

  const { total, holdings } = calculateWalletValue();

  walletSummary.innerHTML = `
    <div class="wallet-stat"><div class="wallet-stat-label">${t("totalValue")}</div><div class="wallet-stat-value">${fmt(total)} T</div></div>
    <div class="wallet-stat"><div class="wallet-stat-label">${t("holdings")}</div><div class="wallet-stat-value">${holdings.length}</div></div>
  `;

  walletActions.innerHTML = `
    <button class="btn" onclick="showAddHoldingModal()">
      <i data-feather="plus"></i> ${t("addHolding")}
    </button>
  `;

  if (!holdings.length) {
    walletTable.innerHTML = `<div class="wallet-empty">${t("walletEmpty")}</div>`;
    feather.replace();
    return;
  }

  walletTable.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${t("asset")}</th><th>${t("quantity")}</th><th>${t("now")}</th>
        <th>${t("value")}</th><th>%</th><th></th>
      </tr></thead>
      <tbody>${holdings
        .map(
          (h) => `
        <tr>
          <td><div class="table-asset">${iconHtml(h.asset)}<span class="table-asset-name">${assetLabel(h.asset)}</span></div></td>
          <td>${fmt(h.quantity)}</td>
          <td>${fmt(h.price)}</td>
          <td>${fmt(h.value)}</td>
          <td>${h.percentage.toFixed(1)}%</td>
          <td><button class="btn" style="padding:6px 10px;height:auto" onclick="removeHolding('${h.asset.id}')"><i data-feather="trash-2" style="width:14px;height:14px"></i></button></td>
        </tr>
      `,
        )
        .join("")}</tbody>
    </table>
  `;
  feather.replace();
}

function showAddHoldingModal() {
  const modal = document.createElement("div");
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);`;
  modal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;max-width:400px;width:90%">
      <h3 style="margin-bottom:16px">${t("addHolding")}</h3>
      <div style="margin-bottom:12px">
        <label style="display:block;margin-bottom:6px;font-size:.875rem;color:var(--muted)">${t("selectAsset")}</label>
        <select id="holdingAsset" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit">
          ${ASSETS.map((a) => `<option value="${a.id}">${assetLabel(a)}</option>`).join("")}
        </select>
      </div>
      <div style="margin-bottom:20px">
        <label style="display:block;margin-bottom:6px;font-size:.875rem;color:var(--muted)">${t("enterQuantity")}</label>
        <input type="number" id="holdingQuantity" step="any" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit" />
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn" style="flex:1" onclick="this.closest('[style*=fixed]').remove()">${t("cancel")}</button>
        <button class="btn" style="flex:1;background:var(--accent);color:#fff;border-color:var(--accent)" onclick="addHolding()">${t("add")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

function addHolding() {
  const assetId = document.getElementById("holdingAsset").value;
  const quantity = parseFloat(document.getElementById("holdingQuantity").value);
  if (!assetId || !quantity || quantity <= 0) return;
  const existing = wallet.find((w) => w.assetId === assetId);
  if (existing) existing.quantity += quantity;
  else wallet.push({ assetId, quantity });
  storageSet("wallet", JSON.stringify(wallet));
  document.querySelector('[style*="position: fixed"]').remove();
  renderWallet();
}

function removeHolding(assetId) {
  wallet = wallet.filter((w) => w.assetId !== assetId);
  storageSet("wallet", JSON.stringify(wallet));
  renderWallet();
}

// ============================================================
// CALENDAR
// ============================================================
async function renderCalendar() {
  grid.style.display = "none";
  heatmapGrid.style.display = "none";
  tableContainer.style.display = "none";
  walletSection.style.display = "none";
  affordSection.style.display = "none";
  calendarSection.style.display = "";
  calTooltip.classList.remove("show");

  if (!allDates.length) {
    calendarHeader.innerHTML = "";
    calendarGrid.innerHTML = `<div class="wallet-empty">${t("noData")}</div>`;
    return;
  }

  const firstAsset = ASSETS[0];
  calendarHeader.innerHTML = `
    <div>
      <h2 style="margin-bottom:8px">${t("calendar")} - ${assetLabel(firstAsset)}</h2>
      <p style="color:var(--muted);font-size:.875rem">Last ${Math.min(allDates.length, 365)} days</p>
    </div>
    <select id="calendarAsset" class="btn" style="min-width:150px">
      ${ASSETS.map((a) => `<option value="${a.id}">${assetLabel(a)}</option>`).join("")}
    </select>
  `;
  document.getElementById("calendarAsset").onchange = () => loadCalendarData();
  await loadCalendarData();
}

async function loadCalendarData() {
  const assetId =
    document.getElementById("calendarAsset")?.value || ASSETS[0].id;
  const asset = ASSETS.find((a) => a.id === assetId);
  if (!asset) return;
  calendarGrid.innerHTML = `<div class="calendar-loading">${t("loadingCalendar")}</div>`;
  const cacheKey = assetId;
  if (calendarCache.has(cacheKey)) {
    renderCalendarCells(calendarCache.get(cacheKey));
    return;
  }
  const datesToLoad = allDates.slice(0, Math.min(365, allDates.length));
  const batchSize = 20;
  const dayChanges = [];
  for (let i = 0; i < datesToLoad.length; i += batchSize) {
    const batch = datesToLoad.slice(i, i + batchSize);
    const batchPromises = batch.map(async (date) => {
      const json = await fetchDay(date);
      if (!json || !Array.isArray(json) || json.length < 2) {
        return { date, change: 0, open: null, close: null };
      }
      const values = getAssetValues(asset, json);
      const clean = values.filter((v) => v != null && v > 0);
      const first = clean[0] ?? null;
      const last = clean.length ? clean[clean.length - 1] : null;
      let change = 0;
      if (first && last && first > 0) change = ((last - first) / first) * 100;
      return { date, change, open: first, close: last };
    });
    const batchResults = await Promise.all(batchPromises);
    dayChanges.push(...batchResults);
  }
  dayChanges.reverse();
  calendarCache.set(cacheKey, dayChanges);
  renderCalendarCells(dayChanges);
}

function renderCalendarCells(dayChanges) {
  calendarGrid.innerHTML = "";
  dayChanges.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell neutral";
    if (day.change > 0.5) {
      cell.className = "calendar-cell positive";
      if (day.change > 2) cell.classList.add("strong");
      if (day.change > 5) cell.classList.add("stronger");
    } else if (day.change < -0.5) {
      cell.className = "calendar-cell negative";
      if (day.change < -2) cell.classList.add("strong");
      if (day.change < -5) cell.classList.add("stronger");
    }
    cell.dataset.date = day.date;
    cell.dataset.change = day.change.toFixed(2);
    cell.dataset.open = day.open ?? "";
    cell.dataset.close = day.close ?? "";
    calendarGrid.appendChild(cell);
  });
}

// ============================================================
// CALENDAR TOOLTIP
// ============================================================
function showCalTooltip(cell, x, y) {
  const d = cell.dataset;
  const ch = Number(d.change);
  const cls = ch >= 0 ? "up" : "down";
  const sign = ch >= 0 ? "+" : "";
  calTooltip.innerHTML = `
    <div class="tt-date">${toJalali(d.date)}</div>
    <div class="tt-row"><span>${t("dayChange")}</span><strong class="${cls}">${sign}${ch.toFixed(2)}%</strong></div>
    <div class="tt-row"><span>${t("start")}</span><strong>${fmt(d.open || null)}</strong></div>
    <div class="tt-row"><span>${t("end")}</span><strong>${fmt(d.close || null)}</strong></div>
  `;
  calTooltip.classList.add("show");
  positionCalTooltip(x, y);
}

function positionCalTooltip(x, y) {
  const pad = 14;
  const r = calTooltip.getBoundingClientRect();
  let left = x + pad;
  let top = y + pad;
  if (left + r.width > window.innerWidth - 8) left = x - r.width - pad;
  if (top + r.height > window.innerHeight - 8) top = y - r.height - pad;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  calTooltip.style.left = left + "px";
  calTooltip.style.top = top + "px";
}

calendarGrid.addEventListener("pointermove", (e) => {
  const cell = e.target.closest(".calendar-cell");
  if (!cell) {
    calTooltip.classList.remove("show");
    return;
  }
  showCalTooltip(cell, e.clientX, e.clientY);
});
calendarGrid.addEventListener("pointerleave", () =>
  calTooltip.classList.remove("show"),
);
calendarGrid.addEventListener("click", (e) => {
  const cell = e.target.closest(".calendar-cell");
  if (!cell) return;
  const r = cell.getBoundingClientRect();
  showCalTooltip(cell, r.left + r.width / 2, r.top);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#calendarGrid")) calTooltip.classList.remove("show");
});

// ============================================================
// AFFORD
// ============================================================
function renderAfford() {
  grid.style.display = "none";
  heatmapGrid.style.display = "none";
  tableContainer.style.display = "none";
  walletSection.style.display = "none";
  calendarSection.style.display = "none";
  affordSection.style.display = "";

  if (!currentEntries.length) {
    affordGrid.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }

  const visible = getVisibleAssets();
  if (!visible.length) {
    affordGrid.innerHTML = `<div class="empty-state">${t("noAssets")}</div>`;
    return;
  }

  const amount = getAffordAmount();
  affordGrid.innerHTML = visible
    .map((asset) => {
      const price = getAssetPriceInToman(asset, currentEntries);
      if (!price) return "";
      const qty = amount > 0 ? amount / price : 0;
      return `
      <div class="afford-tile">
        <div class="afford-tile-top">${iconHtml(asset)}<span class="hl-text">${assetLabel(asset)}</span></div>
        <div class="afford-price">${t("perUnit")}: ${fmt(price)}</div>
        <div class="afford-qty">${fmtQty(qty)} <small>${t("units")}</small></div>
      </div>
    `;
    })
    .join("");
  feather.replace();
}

// ============================================================
// SPARKLINES
// ============================================================
function drawSparkline(canvas, values, color) {
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const clean = values.filter((v) => v != null && v > 0);
  if (clean.length < 2) return;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const step = w / (clean.length - 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  clean.forEach((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// ============================================================
// FILTERING
// ============================================================
function getVisibleAssets() {
  const q = searchQuery;
  return ASSETS.filter((asset) => {
    const okCat =
      activeCategory === "all" ||
      (activeCategory === "favorites"
        ? favorites.includes(asset.id)
        : asset.category === activeCategory);
    if (!okCat) return false;
    if (!q) return true;
    const en = asset.label.toLowerCase();
    const fa = (assetMeta[asset.id]?.faTitle || "").toLowerCase();
    const faPamp = asset.category === "pamp" ? assetLabel(asset) : "";
    return en.includes(q) || fa.includes(q) || faPamp.includes(q);
  });
}

// ============================================================
// DATA FETCHING (with CORS-safe helper)
// ============================================================
async function fetchDay(date) {
  const latest = allDates[0];
  const cache = date !== latest;
  if (cache && dataCache.has(date)) return dataCache.get(date);

  const res = await safeFetch(`${CONFIG.API_BASE}/data/${date}.json`);
  const json = res ? await res.json() : null;

  if (cache && json) dataCache.set(date, json);
  return json;
}

function computeDisplayIndices(length, maxPoints) {
  maxPoints = Math.max(2, maxPoints);
  if (!length) {
    displayIndices = [];
    displayLabels = [];
    return;
  }
  if (length <= maxPoints) displayIndices = Array.from({ length }, (_, i) => i);
  else
    displayIndices = Array.from({ length: maxPoints }, (_, i) =>
      Math.round((i * (length - 1)) / (maxPoints - 1)),
    );
  displayLabels = displayIndices.map((i) => currentLabels[i]);
}

function getAssetValues(asset, entries) {
  return entries.map((entry) => {
    if (!entry) return null;
    let price = null;
    if (Array.isArray(entry.data)) {
      const it = entry.data.find((i) => String(i.key) === String(asset.key));
      if (it) price = Number(it.price);
    }
    if (price == null && Array.isArray(entry.financial)) {
      const it = entry.financial.find(
        (i) => String(i.key) === String(asset.key),
      );
      if (it) price = Number(it.price);
    }
    if (price == null && entry.pamp && Array.isArray(entry.pamp.items)) {
      const it = entry.pamp.items.find(
        (i) => Number(i.weightGram) === Number(asset.key),
      );
      if (it) price = Number(it.price);
    }
    return Number.isFinite(price) && price > 0 ? price : null;
  });
}

function calculateStats(values) {
  const clean = values.filter((v) => v != null && v > 0);
  if (!clean.length) return null;
  const open = clean[0];
  const close = clean[clean.length - 1];
  const prev = clean.length > 1 ? clean[clean.length - 2] : open;
  const low = Math.min(...clean);
  const high = Math.max(...clean);
  const change = prev > 0 ? ((close - prev) / prev) * 100 : 0;
  return { open, prev, close, low, high, change };
}

async function loadData(date) {
  renderSkeletonCards();
  const json = await fetchDay(date);
  const entries = Array.isArray(json) ? json : [];
  selectedDate = date;
  selectedMonthKey = null;
  currentEntries = entries;
  currentLabels = entries.map((e) => e.time || "");
  computeDisplayIndices(currentLabels.length, 240);
  extractMetaFromEntry(entries[entries.length - 1]);
  refreshDateLabel();
  renderDashboard();
  const last = entries[entries.length - 1];
  if (last) {
    lastFooter = { view: "daily", dateStr: date, time: last.time };
    renderFooter();
  }
}

async function loadMonthlyData(dates, monthKey) {
  renderSkeletonCards();
  const allData = await Promise.all(dates.map((d) => fetchDay(d)));
  const labels = [],
    entries = [];
  for (let i = dates.length - 1; i >= 0; i--) {
    const day = allData[i];
    if (Array.isArray(day) && day.length > 0) {
      labels.push(toJalaliShort(dates[i]));
      entries.push(day[day.length - 1]);
    }
  }
  selectedMonthKey = monthKey;
  selectedDate = null;
  currentLabels = labels;
  currentEntries = entries;
  computeDisplayIndices(currentLabels.length, 120);
  extractMetaFromEntry(entries[entries.length - 1]);
  refreshDateLabel();
  renderDashboard();
  if (dates.length && entries.length) {
    const last = entries[entries.length - 1];
    lastFooter = { view: "monthly", dateStr: dates[0], time: last.time || "" };
    renderFooter();
  }
}

// ============================================================
// RENDERING
// ============================================================
function destroyCharts() {
  Object.keys(charts).forEach((id) => {
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
  });
}

function createCard(asset) {
  const isFav = favorites.includes(asset.id);
  const label = assetLabel(asset);
  const div = document.createElement("div");
  div.className = "card";
  div.dataset.assetId = asset.id;
  div.innerHTML = `
    <div class="card-header">
      <div class="asset-info">
        <div class="asset-title">
          ${iconHtml(asset)}
          <h2 title="${label}">${label}</h2>
          <button type="button" class="fav-btn ${isFav ? "active" : ""}" data-fav="${asset.id}" title="Favorite">
            <i data-feather="star"></i>
          </button>
        </div>
        <div class="asset-meta">
          <span>${t("now")} <strong id="now-${asset.id}">—</strong></span>
          <span>${t("low")} <strong id="low-${asset.id}">—</strong></span>
          <span>${t("high")} <strong id="high-${asset.id}">—</strong></span>
        </div>
        <div class="range-bar">
          <div class="range-fill" id="range-fill-${asset.id}"></div>
          <div class="range-dot" id="range-dot-${asset.id}"></div>
        </div>
      </div>
      <div class="price-info">
        <div class="price-current" id="price-${asset.id}">—</div>
        <div class="price-change" id="change-${asset.id}">—</div>
      </div>
    </div>
    <div class="chart-wrap"><canvas id="${asset.id}"></canvas></div>
  `;
  grid.appendChild(div);
  requestAnimationFrame(() => div.classList.add("visible"));
}

function createChart(canvasId, labels, data, label, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (charts[canvasId]) charts[canvasId].destroy();

  const colors = getChartColors();
  let lastValidIndex = -1;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i] != null && data[i] > 0) {
      lastValidIndex = i;
      break;
    }
  }

  const datasets = [];
  if (colors.casing) {
    datasets.push({
      label,
      data,
      borderColor: colors.casing,
      borderWidth: 6,
      tension: 0.35,
      spanGaps: true,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0,
    });
  }
  datasets.push({
    label,
    data,
    borderColor: color,
    borderWidth: colors.casing ? 3 : 2,
    fill: colors.fill,
    tension: 0.35,
    spanGaps: true,
    backgroundColor: colors.fill
      ? (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, color + "33");
          g.addColorStop(1, "transparent");
          return g;
        }
      : "transparent",
    pointRadius: (ctx) => (ctx.dataIndex === lastValidIndex ? 4.5 : 0),
    pointHoverRadius: 6,
    pointBackgroundColor: color,
    pointBorderColor: colors.casing || color,
    pointBorderWidth: colors.casing ? 2 : 0,
  });

  const mainIndex = datasets.length - 1;
  charts[canvasId] = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 120,
      animation: { duration: 300, easing: "easeOutQuart" },
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          filter: (item) => item.datasetIndex === mainIndex,
          callbacks: {
            title: (items) => (items.length ? items[0].label : ""),
            label: (ctx) =>
              ctx.parsed.y == null ? "No data" : fmt(ctx.parsed.y),
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: colors.text,
            maxRotation: 0,
            autoSkipPadding: 18,
            maxTicksLimit: 8,
            font: { family: colors.fontFamily, weight: 600 },
          },
          grid: { color: colors.grid },
        },
        y: {
          beginAtZero: false,
          grace: "10%",
          ticks: {
            color: colors.text,
            maxTicksLimit: 6,
            font: { family: colors.fontFamily, weight: 600 },
            callback: (v) => Number(v).toLocaleString(numLocale()),
          },
          grid: { color: colors.grid },
        },
      },
    },
  });
}

function updateAssetStats(assetId, values) {
  const stats = calculateStats(values);
  assetStats[assetId] = stats;
  const priceEl = document.getElementById(`price-${assetId}`);
  const changeEl = document.getElementById(`change-${assetId}`);
  const nowEl = document.getElementById(`now-${assetId}`);
  const lowEl = document.getElementById(`low-${assetId}`);
  const highEl = document.getElementById(`high-${assetId}`);
  const fillEl = document.getElementById(`range-fill-${assetId}`);
  const dotEl = document.getElementById(`range-dot-${assetId}`);
  if (!priceEl || !changeEl || !nowEl || !lowEl || !highEl || !fillEl || !dotEl)
    return;

  if (!stats) {
    priceEl.textContent = "—";
    changeEl.textContent = "—";
    changeEl.className = "price-change";
    nowEl.textContent = "—";
    lowEl.textContent = "—";
    highEl.textContent = "—";
    fillEl.style.width = "0%";
    dotEl.style.left = "0%";
    return;
  }
  priceEl.textContent = fmt(stats.close);
  nowEl.textContent = fmt(stats.close);
  lowEl.textContent = fmt(stats.low);
  highEl.textContent = fmt(stats.high);
  changeEl.textContent = `${stats.change >= 0 ? "▲" : "▼"} ${Math.abs(stats.change).toFixed(2)}%`;
  changeEl.className = `price-change ${stats.change >= 0 ? "up" : "down"}`;
  const pos =
    stats.high > stats.low
      ? ((stats.close - stats.low) / (stats.high - stats.low)) * 100
      : 0;
  fillEl.style.width = `${pos}%`;
  dotEl.style.left = `${pos}%`;
}

function renderCharts() {
  destroyCharts();
  grid.innerHTML = "";
  grid.style.display = "";
  heatmapGrid.style.display = "none";
  tableContainer.style.display = "none";
  walletSection.style.display = "none";
  calendarSection.style.display = "none";
  affordSection.style.display = "none";

  if (!currentEntries.length) {
    grid.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }
  const visible = getVisibleAssets();
  if (!visible.length) {
    grid.innerHTML = `<div class="empty-state">${activeCategory === "favorites" ? t("noFavorites") : t("noAssets")}</div>`;
    return;
  }
  visible.forEach((asset) => {
    createCard(asset);
    const full = getAssetValues(asset, currentEntries);
    const chartVals = displayIndices.map((i) => full[i] ?? null);
    createChart(asset.id, displayLabels, chartVals, asset.label, asset.color);
    updateAssetStats(asset.id, full);
  });
  feather.replace();
}

function renderHeatmap() {
  grid.style.display = "none";
  tableContainer.style.display = "none";
  walletSection.style.display = "none";
  calendarSection.style.display = "none";
  affordSection.style.display = "none";
  heatmapGrid.style.display = "";
  heatmapGrid.innerHTML = "";
  const visible = getVisibleAssets();
  if (!visible.length) {
    heatmapGrid.innerHTML = `<div class="empty-state">${t("noAssets")}</div>`;
    return;
  }
  visible.forEach((asset) => {
    const stats = calculateStats(getAssetValues(asset, currentEntries));
    const label = assetLabel(asset);
    const tile = document.createElement("div");
    let cls = "heatmap-tile neutral",
      chCls = "",
      chTxt = "—";
    if (stats) {
      if (stats.change > 0) {
        cls = "heatmap-tile positive";
        chCls = "heatmap-change up";
        chTxt = `▲ ${stats.change.toFixed(2)}%`;
      } else if (stats.change < 0) {
        cls = "heatmap-tile negative";
        chCls = "heatmap-change down";
        chTxt = `▼ ${Math.abs(stats.change).toFixed(2)}%`;
      }
    }
    tile.className = cls;
    tile.innerHTML = `<div class="heatmap-label">${iconHtml(asset)}<span class="hl-text" title="${label}">${label}</span></div><div><div class="heatmap-price">${stats ? fmt(stats.close) : "—"}</div><div class="${chCls}">${chTxt}</div></div>`;
    heatmapGrid.appendChild(tile);
  });
}

function renderTable() {
  grid.style.display = "none";
  heatmapGrid.style.display = "none";
  walletSection.style.display = "none";
  calendarSection.style.display = "none";
  affordSection.style.display = "none";
  tableContainer.style.display = "";
  tableBody.innerHTML = "";
  const visible = getVisibleAssets();
  if (!visible.length) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px">${t("noAssets")}</td></tr>`;
    return;
  }
  visible.forEach((asset) => {
    const fullValues = getAssetValues(asset, currentEntries);
    const stats = calculateStats(fullValues);
    const label = assetLabel(asset);
    const tr = document.createElement("tr");
    let ch = "—";
    if (stats) {
      const cls = stats.change >= 0 ? "up" : "down";
      const arrow = stats.change >= 0 ? "▲" : "▼";
      ch = `<span class="table-change ${cls}">${arrow} ${Math.abs(stats.change).toFixed(2)}%</span>`;
    }
    const sparkId = `spark-${asset.id}`;
    tr.innerHTML = `<td><div class="table-asset">${iconHtml(asset)}<span class="table-asset-name">${label}</span></div></td><td><canvas id="${sparkId}" class="sparkline-canvas"></canvas></td><td>${stats ? fmt(stats.close) : "—"}</td><td>${stats ? fmt(stats.low) : "—"}</td><td>${stats ? fmt(stats.high) : "—"}</td><td>${ch}</td>`;
    tableBody.appendChild(tr);
    requestAnimationFrame(() => {
      const canvas = document.getElementById(sparkId);
      if (canvas) drawSparkline(canvas, fullValues.slice(-50), asset.color);
    });
  });
}

function renderDashboard() {
  assetStats = {};
  calTooltip.classList.remove("show");
  colsToggle.style.display = currentMode === "charts" ? "" : "none";
  if (currentMode === "charts") renderCharts();
  else if (currentMode === "heatmap") renderHeatmap();
  else if (currentMode === "table") renderTable();
  else if (currentMode === "wallet") renderWallet();
  else if (currentMode === "calendar") renderCalendar();
  else if (currentMode === "afford") renderAfford();
  animateIn(modeSections[currentMode]);
  updateURLState();
}

// ============================================================
// COMMAND PALETTE
// ============================================================
const commands = [
  {
    id: "daily",
    text: "Switch to Daily View",
    shortcut: "D",
    action: () => setView("daily"),
  },
  {
    id: "monthly",
    text: "Switch to Monthly View",
    shortcut: "M",
    action: () => setView("monthly"),
  },
  {
    id: "charts",
    text: "Switch to Charts Mode",
    shortcut: "1",
    action: () => setMode("charts"),
  },
  {
    id: "heatmap",
    text: "Switch to Heatmap Mode",
    shortcut: "2",
    action: () => setMode("heatmap"),
  },
  {
    id: "table",
    text: "Switch to Table Mode",
    shortcut: "3",
    action: () => setMode("table"),
  },
  {
    id: "wallet",
    text: "Switch to Wallet Mode",
    shortcut: "4",
    action: () => setMode("wallet"),
  },
  {
    id: "calendar",
    text: "Switch to Calendar Mode",
    shortcut: "5",
    action: () => setMode("calendar"),
  },
  {
    id: "afford",
    text: "Switch to Afford Mode",
    shortcut: "6",
    action: () => setMode("afford"),
  },
  {
    id: "theme",
    text: "Toggle Theme",
    shortcut: "T",
    action: () => applyTheme(currentTheme === "dark" ? "light" : "dark"),
  },
  {
    id: "lang",
    text: "Toggle Language",
    shortcut: "L",
    action: () => applyLanguage(currentLang === "en" ? "fa" : "en"),
  },
  {
    id: "style",
    text: "Cycle UI Style",
    shortcut: "S",
    action: () => {
      const idx = STYLES.indexOf(currentStyle);
      applyStyle(STYLES[(idx + 1) % STYLES.length]);
    },
  },
  { id: "all", text: "Show All Assets", action: () => setCategory("all") },
  {
    id: "currency",
    text: "Show Currencies",
    action: () => setCategory("currency"),
  },
  { id: "gold", text: "Show Gold", action: () => setCategory("gold") },
  { id: "crypto", text: "Show Crypto", action: () => setCategory("crypto") },
  { id: "pamp", text: "Show PAMP", action: () => setCategory("pamp") },
  {
    id: "favorites",
    text: "Show Favorites",
    action: () => setCategory("favorites"),
  },
];

function setView(view) {
  currentView = view;
  document.querySelector("#viewToggle .active")?.classList.remove("active");
  document
    .querySelector(`#viewToggle [data-view="${view}"]`)
    ?.classList.add("active");
  renderDateMenu();
  if (currentView === "daily" && allDates.length) loadData(allDates[0]);
  if (currentView === "monthly" && allMonths.length)
    loadMonthlyData(allMonths[0].dates, allMonths[0].key);
}

function setMode(mode) {
  currentMode = mode;
  document.querySelector("#modeToggle .active")?.classList.remove("active");
  document
    .querySelector(`#modeToggle [data-mode="${mode}"]`)
    ?.classList.add("active");
  renderDashboard();
}

function setCategory(cat) {
  activeCategory = cat;
  document
    .querySelectorAll("#categoryTabs .tab")
    .forEach((b) => b.classList.toggle("active", b.dataset.category === cat));
  renderDashboard();
}

let commandSelectedIndex = 0;
let commandFiltered = commands;

function openCommandPalette() {
  commandPalette.classList.add("show");
  commandSearch.value = "";
  commandSearch.focus();
  commandFiltered = commands;
  commandSelectedIndex = 0;
  renderCommandList();
}

function closeCommandPalette() {
  commandPalette.classList.remove("show");
}

function renderCommandList() {
  commandList.innerHTML = commandFiltered
    .map(
      (cmd, i) => `
    <div class="command-item ${i === commandSelectedIndex ? "selected" : ""}" data-index="${i}">
      <div class="command-item-text">${cmd.text}</div>
      ${cmd.shortcut ? `<div class="command-item-shortcut">${cmd.shortcut}</div>` : ""}
    </div>
  `,
    )
    .join("");
  commandList.querySelectorAll(".command-item").forEach((el) => {
    el.onclick = () => {
      const idx = parseInt(el.dataset.index);
      commandFiltered[idx].action();
      closeCommandPalette();
    };
  });
}

commandSearch.addEventListener("input", () => {
  const q = commandSearch.value.toLowerCase();
  commandFiltered = commands.filter((c) => c.text.toLowerCase().includes(q));
  commandSelectedIndex = 0;
  renderCommandList();
});

commandSearch.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    commandSelectedIndex = Math.min(
      commandSelectedIndex + 1,
      commandFiltered.length - 1,
    );
    renderCommandList();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    commandSelectedIndex = Math.max(commandSelectedIndex - 1, 0);
    renderCommandList();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (commandFiltered[commandSelectedIndex]) {
      commandFiltered[commandSelectedIndex].action();
      closeCommandPalette();
    }
  } else if (e.key === "Escape") {
    closeCommandPalette();
  }
});

commandPalette.addEventListener("click", (e) => {
  if (e.target === commandPalette) closeCommandPalette();
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener("keydown", (e) => {
  if (
    e.target.tagName === "INPUT" ||
    e.target.tagName === "TEXTAREA" ||
    e.target.isContentEditable
  )
    return;
  const key = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && key === "k") {
    e.preventDefault();
    openCommandPalette();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (key === "/") {
    e.preventDefault();
    openCommandPalette();
  } else if (key === "escape") {
    closeCommandPalette();
    closeDrawer();
    dateMenu.classList.remove("show");
  } else if (key === "d") setView("daily");
  else if (key === "m") setView("monthly");
  else if (key === "1") setMode("charts");
  else if (key === "2") setMode("heatmap");
  else if (key === "3") setMode("table");
  else if (key === "4") setMode("wallet");
  else if (key === "5") setMode("calendar");
  else if (key === "6") setMode("afford");
  else if (key === "t") applyTheme(currentTheme === "dark" ? "light" : "dark");
  else if (key === "l") applyLanguage(currentLang === "en" ? "fa" : "en");
  else if (key === "s") {
    const idx = STYLES.indexOf(currentStyle);
    applyStyle(STYLES[(idx + 1) % STYLES.length]);
  }
});

// ============================================================
// DATES
// ============================================================
function rebuildMonths() {
  const map = {};
  allDates.forEach((d) => {
    const k = getJalaliMonthKey(d);
    if (!map[k]) map[k] = { key: k, label: getJalaliMonthLabel(d), dates: [] };
    map[k].dates.push(d);
  });
  allMonths = Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
}

function renderDateMenu() {
  dateMenu.innerHTML = "";
  const items = currentView === "daily" ? allDates : allMonths;
  if (!items.length) {
    const d = document.createElement("div");
    d.textContent = "No dates found";
    dateMenu.appendChild(d);
    return;
  }
  items.forEach((item) => {
    const div = document.createElement("div");
    if (currentView === "daily") {
      div.textContent = toJalali(item);
      div.onclick = () => {
        dateMenu.classList.remove("show");
        closeDrawerIfMobile();
        loadData(item);
      };
    } else {
      div.textContent = item.label;
      div.onclick = () => {
        dateMenu.classList.remove("show");
        closeDrawerIfMobile();
        loadMonthlyData(item.dates, item.key);
      };
    }
    dateMenu.appendChild(div);
  });
}

async function loadAvailableDates() {
  const res = await safeFetch(`${CONFIG.API_BASE}/data/dates.json`);
  allDates = res ? await res.json() : [];
  if (!Array.isArray(allDates)) allDates = [];
  rebuildMonths();
  renderDateMenu();
  if (!allDates.length) {
    dateBtnText.textContent = "No dates";
    return;
  }
  if (currentView === "daily") loadData(allDates[0]);
  else loadMonthlyData(allMonths[0].dates, allMonths[0].key);
}

// ============================================================
// EVENTS
// ============================================================
themeBtn.addEventListener("click", () =>
  applyTheme(currentTheme === "dark" ? "light" : "dark"),
);

styleBtn.addEventListener("click", () => {
  const idx = STYLES.indexOf(currentStyle);
  applyStyle(STYLES[(idx + 1) % STYLES.length]);
});

langBtn.addEventListener("click", () =>
  applyLanguage(currentLang === "en" ? "fa" : "en"),
);

viewToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-view]");
  if (!btn || btn.classList.contains("active")) return;
  document.querySelector("#viewToggle .active")?.classList.remove("active");
  btn.classList.add("active");
  currentView = btn.dataset.view;
  renderDateMenu();
  closeDrawerIfMobile();
  if (currentView === "daily" && allDates.length) loadData(allDates[0]);
  if (currentView === "monthly" && allMonths.length)
    loadMonthlyData(allMonths[0].dates, allMonths[0].key);
});

modeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-mode]");
  if (!btn || btn.classList.contains("active")) return;
  document.querySelector("#modeToggle .active")?.classList.remove("active");
  btn.classList.add("active");
  currentMode = btn.dataset.mode;
  closeDrawerIfMobile();
  renderDashboard();
});

categoryTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  document
    .querySelectorAll("#categoryTabs .tab")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.category === activeCategory),
    );
  closeDrawerIfMobile();
  renderDashboard();
});

assetSearch.addEventListener(
  "input",
  debounce(() => {
    searchQuery = assetSearch.value.trim().toLowerCase();
    renderDashboard();
  }, 200),
);

grid.addEventListener("click", (e) => {
  const favBtn = e.target.closest(".fav-btn");
  if (!favBtn) return;
  const id = favBtn.dataset.fav;
  toggleFavorite(id);
  const isFav = favorites.includes(id);
  if (activeCategory === "favorites") {
    renderDashboard();
    return;
  }
  favBtn.classList.toggle("active", isFav);
});

dateBtn.onclick = () => dateMenu.classList.toggle("show");
document.addEventListener("click", (e) => {
  if (!e.target.closest(".date-dropdown")) dateMenu.classList.remove("show");
});

// ============================================================
// INIT
// ============================================================
parseURLState();
buildDateFormatters();
document.documentElement.setAttribute("data-style", currentStyle);
styleBtn.title = "Style: " + (STYLE_NAMES[currentStyle] || currentStyle);

const savedAmount = (storageGet("affordAmount") || "1000000").replace(
  /\D/g,
  "",
);
affordAmountInput.dataset.raw = savedAmount;
affordAmountInput.value = savedAmount
  ? Number(savedAmount).toLocaleString(numLocale())
  : "";

applyCols();
applyTheme(currentTheme);
applyLanguage(currentLang);

if (searchQuery) assetSearch.value = searchQuery;

document
  .querySelectorAll("#viewToggle button")
  .forEach((b) => b.classList.toggle("active", b.dataset.view === currentView));
document
  .querySelectorAll("#modeToggle button")
  .forEach((b) => b.classList.toggle("active", b.dataset.mode === currentMode));
document
  .querySelectorAll("#categoryTabs .tab")
  .forEach((b) =>
    b.classList.toggle("active", b.dataset.category === activeCategory),
  );

feather.replace();
fillSEO();
loadAssetMetaFromAPI();
loadAvailableDates();

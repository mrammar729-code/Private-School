const translations = {
  en: {
    appTitle: "Pakistan Problem Reporter",
    language: "Language",
    reportsTab: "Report Issue",
    liveMapTab: "Live Map",
    chatTab: "Community Chat",
    dashboardTab: "Transparency Dashboard",
    reportIssue: "Report a Local Issue",
    city: "City",
    category: "Category",
    urgency: "Urgency",
    description: "Description",
    media: "Photo / Video",
    pinHint: "Tap map to pin exact location.",
    submitReport: "Submit Report",
    pinMap: "Pin on Pakistan Map",
    noPin: "No location selected",
    liveView: "National Live Problem Map",
    oneTap: "One-Tap Complaints",
    community: "Global Live Chat",
    room: "Room",
    send: "Send",
    gamification: "Community Badges",
    badgeHint: "Earn badges by reporting and helping resolve issues.",
    nocode: "No-code Deployment",
    transparency: "Pakistan Transparency Dashboard"
  },
  ur: {
    appTitle: "پاکستان پرابلم رپورٹر",
    language: "زبان",
    reportsTab: "مسئلہ رپورٹ کریں",
    liveMapTab: "لائیو نقشہ",
    chatTab: "کمیونٹی چیٹ",
    dashboardTab: "شفافیت ڈیش بورڈ",
    reportIssue: "مقامی مسئلہ رپورٹ کریں",
    city: "شہر",
    category: "زمرہ",
    urgency: "اہمیت",
    description: "تفصیل",
    media: "تصویر / ویڈیو",
    pinHint: "درست جگہ پن کرنے کے لیے نقشے پر کلک کریں۔",
    submitReport: "رپورٹ جمع کریں",
    pinMap: "پاکستان نقشے پر پن",
    noPin: "کوئی جگہ منتخب نہیں",
    liveView: "قومی لائیو مسئلہ نقشہ",
    oneTap: "ون ٹیپ شکایت",
    community: "عالمی لائیو چیٹ",
    room: "کمرہ",
    send: "بھیجیں",
    gamification: "کمیونٹی بیجز",
    badgeHint: "مسائل رپورٹ اور حل میں مدد سے بیجز حاصل کریں۔",
    nocode: "نو کوڈ ڈپلائمنٹ",
    transparency: "پاکستان شفافیت ڈیش بورڈ"
  }
};

const authorityLinks = {
  electricity: "mailto:complaints@lesco.gov.pk?subject=Electricity Outage Complaint",
  gas: "https://www.sngpl.com.pk/",
  water: "https://wasa.punjab.gov.pk/",
  garbage: "https://sswmb.gos.pk/contact-us/",
  corruption: "https://nab.gov.pk/"
};

const seedReports = [
  { id: 1, city: "Karachi", category: "garbage", urgency: "urgent", status: "open", description: "Large garbage pile near market.", lat: 24.91, lng: 67.08 },
  { id: 2, city: "Lahore", category: "roads", urgency: "medium", status: "open", description: "Potholes on main road.", lat: 31.52, lng: 74.35 },
  { id: 3, city: "Karachi", category: "electricity", urgency: "urgent", status: "resolved", description: "Load shedding for 8 hours daily.", lat: 24.87, lng: 67.04 }
];

const dashboardData = {
  budget: {
    title: "Karachi Roads Budget",
    approved: 50,
    spent: 10,
    unit: "billion PKR",
    updated: "March 2026"
  },
  project: {
    name: "Lahore Metro Extension",
    progress: 70,
    reason: "Delay due to funding",
    budget: 100,
    province: "Punjab",
    city: "Lahore"
  },
  alerts: [
    "Sindh health budget irregularity report – under NAB review.",
    "Procurement audit opened for municipal contracts in Karachi."
  ],
  sources: [
    { label: "Pakistan Data Portal", link: "https://www.pdp.gov.pk" },
    { label: "Open Data Pakistan", link: "https://opendata.com.pk" },
    { label: "NAB Official", link: "https://nab.gov.pk" }
  ]
};

let reports = JSON.parse(localStorage.getItem("ppr_reports") || "null") || seedReports;
let selectedPoint = null;
let selectedReport = null;
let reportLayer;
let devLayer;

const reportMap = L.map("reportMap").setView([30.3753, 69.3451], 5);
const liveMap = L.map("liveMap").setView([30.3753, 69.3451], 5);
const devMap = L.map("devMap").setView([30.3753, 69.3451], 5);
[reportMap, liveMap, devMap].forEach((m) => {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(m);
});

const pinMarker = L.marker([30.3753, 69.3451], { draggable: true }).addTo(reportMap);
pinMarker.on("dragend", () => {
  selectedPoint = pinMarker.getLatLng();
  updateChosenPoint();
});
reportMap.on("click", (e) => {
  pinMarker.setLatLng(e.latlng);
  selectedPoint = e.latlng;
  updateChosenPoint();
});

function updateChosenPoint() {
  const out = document.getElementById("chosenLocation");
  if (!selectedPoint) return;
  out.textContent = `Pinned: ${selectedPoint.lat.toFixed(5)}, ${selectedPoint.lng.toFixed(5)}`;
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    setTimeout(() => {
      liveMap.invalidateSize();
      reportMap.invalidateSize();
      devMap.invalidateSize();
    }, 100);
  });
});

document.getElementById("reportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!selectedPoint) {
    alert("Please pin a location first.");
    return;
  }
  const entry = {
    id: Date.now(),
    city: document.getElementById("city").value,
    category: document.getElementById("category").value,
    urgency: document.getElementById("urgency").value,
    status: "open",
    description: document.getElementById("description").value,
    lat: selectedPoint.lat,
    lng: selectedPoint.lng
  };
  reports.push(entry);
  localStorage.setItem("ppr_reports", JSON.stringify(reports));
  renderReports();
  updateBadges();
  e.target.reset();
  alert("Report submitted.");
});

function renderReports() {
  if (reportLayer) reportLayer.remove();
  reportLayer = L.layerGroup().addTo(liveMap);

  const cityFilter = document.getElementById("filterCity").value;
  const catFilter = document.getElementById("filterCategory").value;
  const statusFilter = document.getElementById("filterStatus").value;

  const filtered = reports.filter((r) =>
    (!cityFilter || r.city === cityFilter) &&
    (!catFilter || r.category === catFilter) &&
    (!statusFilter || r.status === statusFilter)
  );

  filtered.forEach((report) => {
    const cls = report.urgency === "urgent" ? "urgent-marker" : "medium-marker";
    const marker = L.marker([report.lat, report.lng]).addTo(reportLayer);
    marker.bindPopup(`<strong>${report.city}</strong><br/>${report.category}<br/><span class="${cls}">${report.urgency}</span>`);
    marker.on("click", () => {
      selectedReport = report;
      renderComplaintPanel(report);
    });
  });
  document.getElementById("problemCount").textContent = `${filtered.length} problems`;
}

function renderComplaintPanel(report) {
  const categoryToAuthority = {
    roads: authorityLinks.water,
    electricity: authorityLinks.electricity,
    water: authorityLinks.water,
    garbage: authorityLinks.garbage,
    corruption: authorityLinks.corruption
  };
  const link = categoryToAuthority[report.category] || authorityLinks.corruption;
  const targetLabel = report.category === "electricity" ? "LESCO/GEPCO" : report.category === "garbage" ? "SSWMB" : "Authority Portal";
  document.getElementById("reportDetails").innerHTML = `
    <p><strong>${report.city}</strong> - ${report.category} (${report.status})</p>
    <p>${report.description}</p>
    <p>Location: ${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}</p>
    <a class="btn-primary" href="${link}" target="_blank" rel="noreferrer">Send to ${targetLabel}</a>
    <button class="btn-primary" onclick="markResolved(${report.id})">Mark Resolved</button>
    <p class="hint">Pre-filled complaint should include issue details + geo coordinates via Zapier email/SMS flow.</p>
  `;
}

window.markResolved = function markResolved(id) {
  reports = reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r));
  localStorage.setItem("ppr_reports", JSON.stringify(reports));
  renderReports();
};

function populateFilters() {
  const cities = [...new Set(reports.map((r) => r.city))];
  const cats = [...new Set(reports.map((r) => r.category))];
  const citySel = document.getElementById("filterCity");
  const catSel = document.getElementById("filterCategory");
  cities.forEach((c) => citySel.insertAdjacentHTML("beforeend", `<option>${c}</option>`));
  cats.forEach((c) => catSel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));
}
["filterCity", "filterCategory", "filterStatus"].forEach((id) => document.getElementById(id).addEventListener("change", renderReports));

const roomMessages = {
  "Pakistan Help": ["Welcome! Share urgent local issue updates."]
};

function renderChat() {
  const room = document.getElementById("chatRoom").value;
  const list = roomMessages[room] || [];
  const box = document.getElementById("chatMessages");
  box.innerHTML = list.map((m) => `<div class="chat-msg">• ${m}</div>`).join("");
}

document.getElementById("chatRoom").addEventListener("change", renderChat);
document.getElementById("sendChat").addEventListener("click", () => {
  const room = document.getElementById("chatRoom").value;
  const message = document.getElementById("chatInput").value.trim();
  if (!message) return;
  roomMessages[room] = roomMessages[room] || [];
  roomMessages[room].push(message);
  document.getElementById("chatInput").value = "";
  renderChat();
});

function updateBadges() {
  const list = document.getElementById("badgeList");
  const count = reports.length;
  const badges = [
    { name: "Citizen Starter", min: 1 },
    { name: "Street Guardian", min: 5 },
    { name: "City Hero", min: 10 }
  ].filter((b) => count >= b.min);
  list.innerHTML = badges.map((b) => `<li><span class="badge">${b.name}</span></li>`).join("");
}

function renderDashboard() {
  const b = dashboardData.budget;
  const percent = Math.round((b.spent / b.approved) * 100);
  document.getElementById("budgetCard").innerHTML = `
    <h3>Budget Tracker</h3>
    <p>${b.title}: ${b.approved} ${b.unit} approved.</p>
    <p>Spent: ${b.spent} ${b.unit} (${percent}% used).</p>
    <p>Last update: ${b.updated}</p>
    <div class="progress"><span style="width:${percent}%; background:#16a34a"></span></div>
  `;

  const p = dashboardData.project;
  const color = p.progress >= 60 ? "#16a34a" : "#dc2626";
  document.getElementById("projectCard").innerHTML = `
    <h3>Project Status</h3>
    <p>${p.name}: ${p.progress}% complete.</p>
    <p>Reason: ${p.reason}</p>
    <p>Budget: ${p.budget} billion PKR</p>
    <div class="progress"><span style="width:${p.progress}%; background:${color}"></span></div>
  `;

  document.getElementById("alertCard").innerHTML = `
    <h3>Corruption Alerts</h3>
    ${dashboardData.alerts.map((a) => `<p>• ${a}</p>`).join("")}
  `;

  const sources = document.getElementById("sourceList");
  sources.innerHTML = dashboardData.sources.map((s) => `<li><a href="${s.link}" target="_blank" rel="noreferrer">${s.label}</a></li>`).join("");

  drawBudgetChart(percent);
  renderTimeline();
  renderDevelopmentMap();
}

function drawBudgetChart(percentSpent) {
  const canvas = document.getElementById("budgetChart");
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 90;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e5e7eb";
  ctx.fill();

  const end = (Math.PI * 2 * percentSpent) / 100 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, end);
  ctx.closePath();
  ctx.fillStyle = "#0f766e";
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.font = "16px sans-serif";
  ctx.fillText(`${percentSpent}% spent`, centerX - 45, centerY + 5);
}

function renderTimeline() {
  const events = [
    "Jan 2026: Budget approved",
    "Mar 2026: 20% funds utilized",
    "Apr 2026: Contractor audit initiated"
  ];
  document.getElementById("timeline").innerHTML = events.map((e) => `<div class="timeline-item">${e}</div>`).join("");
}

function renderDevelopmentMap() {
  if (devLayer) devLayer.remove();
  devLayer = L.layerGroup().addTo(devMap);
  const overlays = [
    { city: "Karachi", lat: 24.86, lng: 67.01, progress: 20 },
    { city: "Lahore", lat: 31.55, lng: 74.34, progress: 70 }
  ];
  overlays.forEach((o) => {
    const color = o.progress >= 50 ? "green" : "red";
    const marker = L.circleMarker([o.lat, o.lng], { radius: 10, color }).addTo(devLayer);
    marker.bindPopup(`${o.city} development progress: ${o.progress}%`);
  });
}

function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (translations[lang]?.[key]) node.textContent = translations[lang][key];
  });
}
document.getElementById("languageToggle").addEventListener("change", (e) => setLanguage(e.target.value));

document.getElementById("dashProvince").addEventListener("change", renderDashboard);
document.getElementById("dashCity").addEventListener("change", renderDashboard);

populateFilters();
renderReports();
renderChat();
updateBadges();
renderDashboard();

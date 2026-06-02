// ── Downloads ──
// Configure os links de download aqui
const dlMap = {
  'dl-cronograma': 'SEU_LINK_AQUI', // Adicione o link do arquivo Cronograma.xlsx
  'dl-kanban': 'SEU_LINK_AQUI',     // Adicione o link do arquivo Cronograma_Kanban_Fase2.xlsx
  'dl-riscos': 'SEU_LINK_AQUI',     // Adicione o link do arquivo Matriz_de_Riscos.xlsx
  'dl-lessons': 'SEU_LINK_AQUI',    // Adicione o link do arquivo Lessons_Learned.xlsx
  'dl-status': 'SEU_LINK_AQUI',     // Adicione o link do arquivo Status_Report.docx
  'dl-relatorio': 'SEU_LINK_AQUI'   // Adicione o link do arquivo Relatorio_Conclusao.docx
};

Object.entries(dlMap).forEach(([id, href]) => {
  const el = document.getElementById(id);
  if (el && href !== 'SEU_LINK_AQUI') {
    el.href = href;
  }
});

// ── Slide nav ──
const TOTAL = 11;
const SLIDE_IDS = ['s1','s2','s3','s4','s5','s6','s7','s_figma','s8','s9','s10'];
let cur = 0;

const dotsEl = document.getElementById('dots');
for (let i = 0; i < TOTAL; i++) {
  const d = document.createElement('button');
  d.setAttribute('type', 'button');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.setAttribute('aria-label', 'Ir para slide ' + String(i + 1).padStart(2, '0'));
  d.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  d.onclick = () => goTo(i);
  d.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); }
  };
  dotsEl.appendChild(d);
}

function goTo(n) {
  const prev = document.getElementById(SLIDE_IDS[cur]);
  cur = n;
  const next = document.getElementById(SLIDE_IDS[cur]);
  prev.classList.remove('active');
  prev.classList.add('exit');
  setTimeout(() => prev.classList.remove('exit'), 350);
  next.classList.add('active');
  document.getElementById('cur').textContent = String(cur + 1).padStart(2, '0');
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === cur);
    if (d.setAttribute) d.setAttribute('aria-pressed', String(i === cur));
  });
  document.getElementById('prevBtn').disabled = cur === 0;
  document.getElementById('nextBtn').disabled = cur === TOTAL - 1;
  if (cur === TOTAL - 1) { setTimeout(fvFit, 100); }
}

function nav(dir) {
  const n = cur + dir;
  if (n >= 0 && n < TOTAL) goTo(n);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') nav(1);
  if (e.key === 'ArrowLeft') nav(-1);
});

// ══ FIGMA VIEWER ══
const FV_TABS = [
  {
    src: 'Sem título.svg',
    screens: [
      { vb: [0, 0, 12554, 627], name: 'Modal / Detalhe' },
    ]
  },
  {
    src: 'prototipo2.svg',
    screens: [
      { vb: [0, 0, 2030, 1244], name: 'Fluxo Completo — Overview' },
      { vb: [64, 100, 1902, 1080], name: 'Dashboard Principal' },
    ]
  },
];

let fvTab = 0, fvScreen = 0, fvScale = 1, fvX = 0, fvY = 0;
let fvDragging = false, fvDragX = 0, fvDragY = 0;

const fvCanvas = document.getElementById('fv-canvas');
const fvImg = document.getElementById('fv-img');

function fvSetTab(t) {
  fvTab = t;
  fvScreen = 0;
  document.querySelectorAll('.fv-tab[data-tab]').forEach((el, i) => el.classList.toggle('active', i === t));
  fvLoadScreen();
  setTimeout(fvFit, 80);
}

function fvLoadScreen() {
  const tab = FV_TABS[fvTab];
  const sc = tab.screens[fvScreen];
  fvImg.src = tab.src;
  document.getElementById('fv-sname').innerHTML = sc.name;
  document.getElementById('fv-pg').textContent = (fvScreen + 1) + ' / ' + tab.screens.length;
}

function fvFit() {
  const tab = FV_TABS[fvTab];
  const sc = tab.screens[fvScreen];
  const vb = sc.vb;
  const cw = fvCanvas.clientWidth, ch = fvCanvas.clientHeight - 40;
  const scaleX = cw / vb[2], scaleY = ch / vb[3];
  fvScale = Math.min(scaleX, scaleY) * 0.88;
  // Center
  const iw = 99999, ih = 99999; // natural SVG dimensions
  fvX = (cw - vb[2] * fvScale) / 2 - vb[0] * fvScale;
  fvY = (ch - vb[3] * fvScale) / 2 - vb[1] * fvScale + 20;
  fvApply();
}

function fvApply() {
  fvImg.style.transform = 'translate(' + fvX + 'px,' + fvY + 'px) scale(' + fvScale + ')';
  document.getElementById('fv-zlbl').textContent = Math.round(fvScale * 100) + '%';
}

function fvZoom(delta) {
  const cw = fvCanvas.clientWidth / 2, ch = fvCanvas.clientHeight / 2;
  const prev = fvScale;
  fvScale = Math.max(0.08, Math.min(4, fvScale + delta));
  const ratio = fvScale / prev;
  fvX = cw - (cw - fvX) * ratio;
  fvY = ch - (ch - fvY) * ratio;
  fvApply();
}

function fvPrevScreen() {
  const tab = FV_TABS[fvTab];
  if (fvScreen > 0) { fvScreen--; fvLoadScreen(); setTimeout(fvFit, 50); }
}

function fvNextScreen() {
  const tab = FV_TABS[fvTab];
  if (fvScreen < tab.screens.length - 1) { fvScreen++; fvLoadScreen(); setTimeout(fvFit, 50); }
}

// Drag pan
fvCanvas.addEventListener('mousedown', e => {
  if (e.target === fvImg || e.target === fvCanvas) {
    fvDragging = true;
    fvDragX = e.clientX - fvX;
    fvDragY = e.clientY - fvY;
    fvCanvas.style.cursor = 'grabbing';
  }
});

window.addEventListener('mousemove', e => {
  if (!fvDragging) return;
  fvX = e.clientX - fvDragX;
  fvY = e.clientY - fvDragY;
  fvApply();
});

window.addEventListener('mouseup', () => {
  fvDragging = false;
  fvCanvas.style.cursor = 'grab';
});

// Scroll zoom
fvCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = fvCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const prev = fvScale;
  fvScale = Math.max(0.08, Math.min(4, fvScale - e.deltaY * 0.001));
  const ratio = fvScale / prev;
  fvX = mx - (mx - fvX) * ratio;
  fvY = my - (my - fvY) * ratio;
  fvApply();
}, { passive: false });

// Init viewer
fvLoadScreen();
setTimeout(fvFit, 200);

// Init Lucide icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// Make fv-tabs keyboard accessible (Enter / Space)
document.querySelectorAll('.fv-tab[data-tab]').forEach(el => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fvSetTab(Number(el.dataset.tab)); }
  });
});

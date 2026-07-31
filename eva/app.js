// ── SEGMENT ENCODING ─────────────────────────────────────────
const SEGMENTS_BY_DIGIT = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};
const ALL_SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// ── CONFIG ────────────────────────────────────────────────
// Decorative, not wall-clock time: HH:MM are fixed dressing so the
// loop always reads as "correct"; only SS.cc actually ticks (seconds +
// centiseconds, as in the reference), on a clean 60s cycle so it wraps
// exactly at the loop boundary.
const CYCLE_MS = 60000;
const FIXED_HH = '09';
const FIXED_MM = '42';

const STATE = {
  startTime: performance.now(),
  digitEls: { hh: [], mm: [], ss: [], ms: [] },
};

// ── DIGIT BUILD / UPDATE ──────────────────────────────────
function buildDigitGroup(container, count) {
  container.innerHTML = '';
  const els = [];
  for (let i = 0; i < count; i++) {
    const digit = document.createElement('div');
    digit.className = 'digit';
    ALL_SEGS.forEach((seg) => {
      const segEl = document.createElement('div');
      segEl.className = `seg seg-${seg}`;
      digit.appendChild(segEl);
    });
    container.appendChild(digit);
    els.push(digit);
  }
  return els;
}

function setDigit(digitEl, char) {
  const on = new Set(SEGMENTS_BY_DIGIT[char] || []);
  digitEl.querySelectorAll('.seg').forEach((segEl) => {
    const seg = segEl.className.match(/seg-([a-g])/)[1];
    segEl.classList.toggle('on', on.has(seg));
  });
}

function renderGroup(els, str) {
  for (let i = 0; i < els.length; i++) setDigit(els[i], str[i]);
}

function fmtPad(n, width) {
  return String(Math.max(0, Math.floor(n))).padStart(width, '0');
}

// ── ANIMATION LOOP ─────────────────────────────────────────
function tick(now) {
  const elapsed = (now - STATE.startTime) % CYCLE_MS;
  const ss = Math.floor(elapsed / 1000);
  const cs = Math.floor((elapsed % 1000) / 10);

  renderGroup(STATE.digitEls.hh, FIXED_HH);
  renderGroup(STATE.digitEls.mm, FIXED_MM);
  renderGroup(STATE.digitEls.ss, fmtPad(ss, 2));
  renderGroup(STATE.digitEls.ms, fmtPad(cs, 2));

  requestAnimationFrame(tick);
}

// ── TICK MARKS ────────────────────────────────────────────
const TOP_TICK_X = [172, 439, 707, 974, 1242, 1509, 1776];
const LEFT_TICK_Y = [68, 246, 424, 602, 780, 958];

function buildTicks() {
  const topContainer = document.getElementById('ticks-top');
  TOP_TICK_X.forEach((x) => {
    const tick = document.createElement('div');
    tick.className = 'tick-top';
    tick.style.left = `${x}px`;
    tick.innerHTML = '<div class="bar-pair"><span></span><span></span></div><div class="dash"></div>';
    topContainer.appendChild(tick);
  });

  const leftContainer = document.getElementById('ticks-left');
  LEFT_TICK_Y.forEach((y) => {
    const tick = document.createElement('div');
    tick.className = 'tick-left';
    tick.style.top = `${y}px`;
    tick.innerHTML = '<div class="dot"></div><div class="dash"></div>';
    leftContainer.appendChild(tick);
  });
}

// ── INIT ───────────────────────────────────────────────────
STATE.digitEls.hh = buildDigitGroup(document.getElementById('digit-hh'), 2);
STATE.digitEls.mm = buildDigitGroup(document.getElementById('digit-mm'), 2);
STATE.digitEls.ss = buildDigitGroup(document.getElementById('digit-ss'), 2);
STATE.digitEls.ms = buildDigitGroup(document.getElementById('digit-ms'), 2);
buildTicks();

requestAnimationFrame(tick);

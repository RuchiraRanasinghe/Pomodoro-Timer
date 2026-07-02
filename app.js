/* ── DEBATE TIMER – app.js ─────────────────────────────── */

const timerEl    = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const startBtn   = document.getElementById('start');
const resetBtn   = document.getElementById('reset');
const muteBtn    = document.getElementById('mute');
const muteIcon   = document.getElementById('mute-icon');
const fsBtn      = document.getElementById('fullscreen');
const presetBtns = document.querySelectorAll('.preset-btn');

// ── State ────────────────────────────────────────────────
let totalSeconds  = 0;
let timeLeft      = 0;
let intervalId    = null;
let muted         = false;

// SVG paths
const PATH_VOL  = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>`;
const PATH_MUTE = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;

// ── Helpers ──────────────────────────────────────────────
function fmt(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function setTimerState(state) {
  timerEl.classList.remove('state-running','state-warning','state-done');
  if (state) timerEl.classList.add('state-' + state);
}

function updateDisplay() {
  timerEl.textContent = fmt(timeLeft);
  const pct = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  progressEl.style.width = pct + '%';
  const warn = timeLeft <= 30 && timeLeft > 0 && intervalId;
  progressEl.classList.toggle('warning', !!warn);
  if (warn) setTimerState('warning');
  else if (intervalId) setTimerState('running');
}

function playBeep() {
  if (muted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = 'sine';
      g.gain.setValueAtTime(0.5, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.25);
    });
  } catch(e) {}
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  startBtn.textContent = 'Start';
  startBtn.classList.remove('running');
}

// ── Preset buttons ───────────────────────────────────────
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (intervalId) return; // locked while running
    presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    totalSeconds = parseInt(btn.dataset.seconds);
    timeLeft = totalSeconds;
    setTimerState(null);
    progressEl.classList.remove('warning');
    progressEl.style.width = '0%';
    updateDisplay();
  });
});

// ── Start / Stop ─────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (intervalId) {
    // — STOP —
    stopTimer();
    setTimerState(null);
    progressEl.classList.remove('warning');
  } else {
    // — START —
    if (timeLeft <= 0) return;
    startBtn.textContent = 'Stop';
    startBtn.classList.add('running');
    setTimerState('running');

    intervalId = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        stopTimer();
        setTimerState('done');
        progressEl.style.width = '100%';
        progressEl.classList.remove('warning');
        playBeep();
      }
    }, 1000);
  }
});

// ── Reset ────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  stopTimer();
  timeLeft = totalSeconds;
  setTimerState(null);
  progressEl.style.width = '0%';
  progressEl.classList.remove('warning');
  updateDisplay();
});

// ── Mute ─────────────────────────────────────────────────
muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteIcon.innerHTML = muted ? PATH_MUTE : PATH_VOL;
  muteBtn.classList.toggle('active-icon', muted);
  muteBtn.title = muted ? 'Unmute' : 'Mute';
});

// ── Fullscreen ───────────────────────────────────────────
fsBtn.addEventListener('click', () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen && el.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
});

// ── Init ─────────────────────────────────────────────────
updateDisplay();
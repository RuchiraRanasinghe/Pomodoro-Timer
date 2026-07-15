/* ── DEBATE TIMER – app.js ─────────────────────────────── */

const timerEl    = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const startBtn   = document.getElementById('start');
const resetBtn   = document.getElementById('reset');
const bellBtn    = document.getElementById('bell-btn');
const fsBtn      = document.getElementById('fullscreen');
const bellAudio  = document.getElementById('bell-audio');
const presetBtns = document.querySelectorAll('.preset-btn');

// ── State ────────────────────────────────────────────────
let totalSeconds = 0;
let timeLeft     = 0;
let intervalId   = null;
let warnRung     = false;   // so the 60s bell only rings once per countdown

// ── Bell sound ───────────────────────────────────────────
function ringBell() {
  // Animate the button
  bellBtn.classList.remove('bell-ringing');
  void bellBtn.offsetWidth; // reflow to restart animation
  bellBtn.classList.add('bell-ringing');
  setTimeout(() => bellBtn.classList.remove('bell-ringing'), 500);

  // Play bell.wav
  if (bellAudio && bellAudio.readyState >= 2) {
    bellAudio.currentTime = 0;
    bellAudio.play().catch(() => {});
  } else {
    // Fallback synthetic tone if wav not loaded
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach(t => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 830; o.type = 'sine';
        g.gain.setValueAtTime(0.6, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.5);
      });
    } catch(e) {}
  }
}

// ── Helpers ──────────────────────────────────────────────
function fmt(s) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

function setTimerState(state) {
  timerEl.classList.remove('state-running', 'state-warning', 'state-done');
  if (state) timerEl.classList.add('state-' + state);
}

function updateDisplay() {
  timerEl.textContent = fmt(timeLeft);
  const pct = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  progressEl.style.width = pct + '%';

  // Warning state: last 30 seconds
  if (timeLeft <= 60 && timeLeft > 0 && intervalId) {
    setTimerState('warning');
    progressEl.classList.add('warning');

    // Ring bell ONCE when crossing 30s mark
    if (!warnRung) {
      warnRung = true;
      ringBell();
    }
  }
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
    if (intervalId) return;
    presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    totalSeconds = parseInt(btn.dataset.seconds);
    timeLeft     = totalSeconds;
    warnRung     = false;
    setTimerState(null);
    progressEl.classList.remove('warning');
    progressEl.style.width = '0%';
    updateDisplay();
  });
});

// ── Start / Stop ─────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (intervalId) {
    // STOP
    stopTimer();
    setTimerState(null);
    progressEl.classList.remove('warning');
  } else {
    // START
    if (timeLeft <= 0) return;
    warnRung = timeLeft <= 60; // if already in warning zone, don't double-ring
    startBtn.textContent = 'Stop';
    startBtn.classList.add('running');
    setTimerState('running');
    ringBell(); // Ring at start

    intervalId = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        stopTimer();
        setTimerState('done');
        progressEl.style.width = '100%';
        progressEl.classList.remove('warning');
        ringBell(); // Ring at finish
      }
    }, 1000);
  }
});

// ── Reset ────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  stopTimer();
  timeLeft = totalSeconds;
  warnRung = false;
  setTimerState(null);
  progressEl.style.width = '0%';
  progressEl.classList.remove('warning');
  updateDisplay();
});

// ── Manual Bell button ───────────────────────────────────
bellBtn.addEventListener('click', () => {
  ringBell();
});

// ── Fullscreen toggle ────────────────────────────────────
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// ── Init ─────────────────────────────────────────────────
updateDisplay();
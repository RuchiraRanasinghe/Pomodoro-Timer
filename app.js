const start = document.getElementById('start');
const stop = document.getElementById('stop');
const reset = document.getElementById('reset');
const timer = document.getElementById('timer');

let timeLeft = 1500;
let interval;

const updateTimer = () => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timer.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

start.addEventListener('click', () => {
  if (!interval) {
    interval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimer();
        } else {
            clearInterval(interval);
            interval = null;
            alert('Time is up!');
        }
    }, 1000);
  }
});

stop.addEventListener('click', () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
});

reset.addEventListener('click', () => {
  timeLeft = 1500;
  updateTimer();
    if (interval) {
    clearInterval(interval);
    interval = null;
  }
});

updateTimer();


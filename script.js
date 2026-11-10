// ============================================================
// Quebra-Cabeça — com som, brilho dourado, peças que grudam,
// modal transparente, galeria em acordeão e PWA.
// ============================================================

const fileInput   = document.getElementById('fileInput');
const gameArea    = document.getElementById('gameArea');
const intro       = document.getElementById('intro');
const board       = document.getElementById('board');
const shuffleBtn  = document.getElementById('shuffleBtn');
const resetBtn    = document.getElementById('resetBtn');
const peekBtn     = document.getElementById('peekBtn');
const timerEl     = document.getElementById('timer');
const movesEl     = document.getElementById('moves');
const pieceCountEl= document.getElementById('pieceCount');
const soundToggle = document.getElementById('soundToggle');
const gallery     = document.getElementById('gallery');

const winModal    = document.getElementById('winModal');
const winTimeEl   = document.getElementById('winTime');
const winMovesEl  = document.getElementById('winMoves');
const confettiBox = document.getElementById('confetti');
const shareBtn    = document.getElementById('shareBtn');
const playAgainBtn= document.getElementById('playAgainBtn');
const newPhotoBtn = document.getElementById('newPhotoBtn');

// ===== Estado =====
let SIZE = 4;
let tiles = [];
let selectedIndex = null;
let dragFrom = null;
let touchFrom = null;
let imageUrl = null;
let imageAspect = 3 / 4;
let moves = 0;
let timer = null;
let seconds = 0;
let gameActive = false;
let soundOn = true;
let audioCtx = null;

// ============================================================
// 🔊 SOM (Web Audio API — sem arquivo externo)
// ============================================================
function initAudio() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (_) { audioCtx = null; }
  return audioCtx;
}

function playCardSound() {
  if (!soundOn) return;
  const ctx = initAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;

  const bufferSize = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1200;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.08);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.08, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

function playVictorySound() {
  if (!soundOn) return;
  const ctx = initAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const t = now + i * 0.12;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

// Botão de som
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.textContent = soundOn ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !soundOn);
    if (soundOn) playCardSound();
  });
}

// Desbloqueia o áudio no primeiro clique em qualquer lugar
document.addEventListener('pointerdown', function unlock() {
  initAudio();
  document.removeEventListener('pointerdown', unlock);
}, { once: true });

// ============================================================
// Escolha de tamanho
// ============================================================
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    SIZE = parseInt(btn.dataset.size, 10);
  });
});

// ============================================================
// Galeria em acordeão
// ============================================================
function buildGallery() {
  if (!gallery) return;
  if (typeof GALLERY_CATEGORIES === 'undefined') return;
  gallery.innerHTML = '';

  Object.entries(GALLERY_CATEGORIES).forEach(([key, cat]) => {
    if (!cat || !Array.isArray(cat.images) || cat.images.length === 0) return;

    const section = document.createElement('div');
    section.className = 'gallery-category';
    section.dataset.category = key;

    const title = document.createElement('h3');
    title.className = 'gallery-title';
    title.innerHTML = `
      <span>${cat.title || key}
        <span class="gallery-count">(${cat.images.length})</span>
      </span>
    `;
    section.appendChild(title);

    section.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-item')) return;
      toggleCategory(section);
    });

    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    cat.images.forEach(img => {
      if (!img || !img.url) return;
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.dataset.name = img.name || '';
      div.dataset.url = img.url;
      div.style.backgroundImage = `url("${img.url}")`;

      // Valida se a imagem carrega; se não, remove o item
      const test = new Image();
      test.onerror = () => div.remove();
      test.src = img.url;

      grid.appendChild(div);
    });

    section.appendChild(grid);
    gallery.appendChild(section);
  });
}

function toggleCategory(section) {
  const isOpen = section.classList.contains('open');

  // Fecha todas
  gallery.querySelectorAll('.gallery-category.open').forEach(s => s.classList.remove('open'));

  // Abre a clicada (se não estava aberta)
  if (!isOpen) section.classList.add('open');
}

// Delegação de clique nas miniaturas
if (gallery) {
  gallery.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const url = item.dataset.url;
    if (url) loadGalleryImage(url);
  });
}

function loadGalleryImage(url) {
  const img = new Image();
  img.onload = () => {
    imageUrl = url;
    imageAspect = img.naturalWidth / img.naturalHeight;
    startGame();
  };
  img.onerror = () => alert('Não foi possível carregar esta imagem.');
  img.src = url;
}

// ============================================================
// Carregar foto do usuário
// ============================================================
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    if (img.naturalWidth >= img.naturalHeight) {
      if (!confirm('A foto não está no modo retrato. Continuar mesmo assim?')) {
        fileInput.value = '';
        return;
      }
    }
    imageUrl = img.src;
    imageAspect = img.naturalWidth / img.naturalHeight;
    startGame();
  };
  img.onerror = () => alert('Não foi possível carregar a imagem. Tente outra.');
  img.src = URL.createObjectURL(file);
});

// ============================================================
// Iniciar jogo
// ============================================================
function startGame() {
  intro.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameActive = true;
  resetStats();
  buildBoard();
  shuffle();
  startTimer();

  requestAnimationFrame(() => {
    applyAspect();
    requestAnimationFrame(() => render());
  });
}

function applyAspect() {
  board.style.aspectRatio = `${imageAspect}`;
}

function resetStats() {
  moves = 0;
  seconds = 0;
  movesEl.textContent = '0';
  timerEl.textContent = '00:00';
  pieceCountEl.textContent = SIZE * SIZE;
}

function startTimer() {
  stopTimer();
  timer = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}
function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}
function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// ============================================================
// Construir tabuleiro
// ============================================================
function buildBoard() {
  board.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
  board.style.gridTemplateRows    = `repeat(${SIZE}, 1fr)`;

  board.innerHTML = '';
  tiles = Array.from({ length: SIZE * SIZE }, (_, i) => i);

  for (let i = 0; i < SIZE * SIZE; i++) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.draggable = true;
    div.dataset.index = i;

    div.addEventListener('click', () => onTileClick(i));

    div.addEventListener('dragstart', (e) => {
      dragFrom = i;
      div.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    div.addEventListener('dragend', () => {
      div.classList.remove('dragging');
      dragFrom = null;
    });
    div.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      div.classList.add('drag-over');
    });
    div.addEventListener('dragleave', () => div.classList.remove('drag-over'));
    div.addEventListener('drop', (e) => {
      e.preventDefault();
      div.classList.remove('drag-over');
      if (dragFrom !== null && dragFrom !== i) swapTiles(dragFrom, i);
    });

    div.addEventListener('touchstart', handleTouchStart, { passive: true });
    div.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    div.addEventListener('touchend',   handleTouchEnd);

    board.appendChild(div);
  }
}

function handleTouchStart(e) {
  touchFrom = parseInt(e.currentTarget.dataset.index, 10);
}
function handleTouchMove(e) {
  e.preventDefault();
  const t = e.touches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  if (el && el.classList.contains('tile')) {
    document.querySelectorAll('.tile.drag-over').forEach(x => x.classList.remove('drag-over'));
    el.classList.add('drag-over');
  }
}
function handleTouchEnd(e) {
  const t = e.changedTouches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  document.querySelectorAll('.tile.drag-over').forEach(x => x.classList.remove('drag-over'));
  if (el && el.classList.contains('tile')) {
    const to = parseInt(el.dataset.index, 10);
    if (touchFrom !== null && touchFrom !== to) swapTiles(touchFrom, to);
  }
  touchFrom = null;
}

// ============================================================
// Render (px)
// ============================================================
function render() {
  if (!imageUrl) return;

  const rect = board.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;

  const boardPadding = 3;
  const gap = 2;
  const innerW = rect.width  - boardPadding * 2 - gap * (SIZE - 1);
  const innerH = rect.height - boardPadding * 2 - gap * (SIZE - 1);
  const tileW = innerW / SIZE;
  const tileH = innerH / SIZE;

  [...board.children].forEach((el, i) => {
    const pieceId = tiles[i];
    const row = Math.floor(pieceId / SIZE);
    const col = pieceId % SIZE;

    el.style.backgroundImage = `url(${imageUrl})`;
    el.style.backgroundSize = `${tileW * SIZE}px ${tileH * SIZE}px`;
    el.style.backgroundPosition = `${-col * tileW}px ${-row * tileH}px`;
    el.classList.toggle('selected', i === selectedIndex);
    el.classList.toggle('placed', pieceId === i);
  });

  applyStickEffect();
}

// ============================================================
// Interação
// ============================================================
function onTileClick(index) {
  if (!gameActive) return;
  if (selectedIndex === null) {
    selectedIndex = index;
    render();
  } else if (selectedIndex === index) {
    selectedIndex = null;
    render();
  } else {
    swapTiles(selectedIndex, index);
  }
}

function swapTiles(a, b) {
  if (a === b) return;

  const wasCorrect = tiles.map((v, i) => v === i);

  [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
  selectedIndex = null;
  moves++;
  movesEl.textContent = moves;

  playCardSound();

  render();
  updateCorrectness(wasCorrect);

  if (isSolved()) onWin();
}

function updateCorrectness(wasCorrect) {
  [...board.children].forEach((el, i) => {
    const isCorrect = tiles[i] === i;

    if (isCorrect && !wasCorrect[i]) {
      el.classList.add('correct');
      setTimeout(() => el.classList.remove('correct'), 600);
    }

    el.classList.toggle('placed', isCorrect);
  });

  applyStickEffect();
}

// ============================================================
// Efeito de "grudar" peças corretas vizinhas (via JS)
// ============================================================
function applyStickEffect() {
  const gap = 2;

  [...board.children].forEach((el, i) => {
    el.style.marginRight  = '';
    el.style.marginBottom = '';
    el.style.zIndex       = '';

    if (tiles[i] !== i) return;

    const row = Math.floor(i / SIZE);
    const col = i % SIZE;

    const rightIdx = i + 1;
    const hasRight = col < SIZE - 1 && tiles[rightIdx] === rightIdx;

    const belowIdx = i + SIZE;
    const hasBelow = row < SIZE - 1 && tiles[belowIdx] === belowIdx;

    if (hasRight) {
      el.style.marginRight = `-${gap}px`;
      el.style.zIndex = '2';
    }
    if (hasBelow) {
      el.style.marginBottom = `-${gap}px`;
      el.style.zIndex = '2';
    }
  });
}

function shuffle() {
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (isSolved());
  selectedIndex = null;
  render();
}

function isSolved() {
  return tiles.every((v, i) => v === i);
}

// ============================================================
// Vitória
// ============================================================
function onWin() {
  gameActive = false;
  stopTimer();
  winTimeEl.textContent = formatTime(seconds);
  winMovesEl.textContent = moves;
  winModal.classList.remove('hidden');
  launchConfetti();
  playVictorySound();

  const key = `best_${SIZE}x${SIZE}`;
  const best = parseInt(localStorage.getItem(key) || '999999', 10);
  if (moves < best) localStorage.setItem(key, moves);

  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
}

function launchConfetti() {
  confettiBox.innerHTML = '';
  const colors = ['#ffd166', '#ff6b9d', '#7c5cff', '#7cf29c', '#5cc8ff'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confettiBox.appendChild(p);
  }
}

// ============================================================
// Botões
// ============================================================
shuffleBtn.addEventListener('click', () => {
  if (!gameActive) return;
  shuffle();
  resetStats();
  startTimer();
});

resetBtn.addEventListener('click', () => {
  stopTimer();
  gameActive = false;
  gameArea.classList.add('hidden');
  intro.classList.remove('hidden');
  fileInput.value = '';
  imageUrl = null;
  tiles = [];
  board.innerHTML = '';
});

peekBtn.addEventListener('click', () => {
  if (!gameActive) return;
  [...board.children].forEach((el) => {
    el.style.backgroundSize = '100% 100%';
    el.style.backgroundPosition = 'center';
  });
  setTimeout(() => render(), 2000);
});

playAgainBtn.addEventListener('click', () => {
  winModal.classList.add('hidden');
  startGame();
});

newPhotoBtn.addEventListener('click', () => {
  winModal.classList.add('hidden');
  resetBtn.click();
});

shareBtn.addEventListener('click', async () => {
  const text = `🧩 Resolvi um quebra-cabeça ${SIZE}×${SIZE} em ${formatTime(seconds)} com ${moves} movimentos!`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Quebra-Cabeça', text, url: location.href }); } catch (_) {}
  } else {
    try {
      await navigator.clipboard.writeText(text + ' ' + location.href);
      shareBtn.textContent = '✅ Copiado!';
      setTimeout(() => (shareBtn.textContent = '📤 Compartilhar'), 1500);
    } catch (_) { alert(text); }
  }
});

window.addEventListener('resize', () => {
  if (gameActive) render();
});

// ============================================================
// Init
// ============================================================
buildGallery();

// ============================================================
// PWA
// ============================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

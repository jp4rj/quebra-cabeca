// ============================================================
// Quebra-Cabeça — versão corrigida (background em px)
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
let imageAspect = 3 / 4;   // proporção real da imagem carregada
let moves = 0;
let timer = null;
let seconds = 0;
let gameActive = false;

// ===== Escolha de tamanho =====
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    SIZE = parseInt(btn.dataset.size, 10);
  });
});

// ===== Carregar foto =====
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    // Aviso se não for retrato
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
  img.src = URL.createObjectURL(file);
});

// ===== Iniciar jogo =====
function startGame() {
  intro.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameActive = true;
  resetStats();
  buildBoard();
  shuffle();
  startTimer();

  // Espera o layout estabilizar antes de renderizar as posições
  requestAnimationFrame(() => {
    applyAspect();
    render();
  });
}

function applyAspect() {
  // Ajusta o tabuleiro para a proporção real da imagem
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

// ===== Construir tabuleiro =====
function buildBoard() {
  board.innerHTML = '';
  tiles = Array.from({ length: SIZE * SIZE }, (_, i) => i);

  for (let i = 0; i < SIZE * SIZE; i++) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.draggable = true;
    div.dataset.index = i;

    // Clique
    div.addEventListener('click', () => onTileClick(i));

    // Drag & drop (desktop)
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
      if (dragFrom !== null && dragFrom !== i) {
        swapTiles(dragFrom, i);
      }
    });

    // Toque (mobile)
    div.addEventListener('touchstart', handleTouchStart, { passive: true });
    div.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    div.addEventListener('touchend',   handleTouchEnd);

    board.appendChild(div);
  }
}

// ===== Touch handlers (mobile) =====
function handleTouchStart(e) {
  touchFrom = parseInt(e.currentTarget.dataset.index, 10);
}
function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (el && el.classList.contains('tile')) {
    document.querySelectorAll('.tile.drag-over').forEach(t => t.classList.remove('drag-over'));
    el.classList.add('drag-over');
  }
}
function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  document.querySelectorAll('.tile.drag-over').forEach(t => t.classList.remove('drag-over'));
  if (el && el.classList.contains('tile')) {
    const to = parseInt(el.dataset.index, 10);
    if (touchFrom !== null && touchFrom !== to) swapTiles(touchFrom, to);
  }
  touchFrom = null;
}

// ===== Render (CORRIGIDO: px em vez de %) =====
function render() {
  if (!imageUrl) return;

  const boardRect = board.getBoundingClientRect();
  if (boardRect.width === 0 || boardRect.height === 0) return; // layout ainda não pronto

  // Padding interno do board = 3px (definido no CSS) + gap entre tiles = 2px
  const boardPadding = 3;
  const gap = 2;

  const innerW = boardRect.width  - boardPadding * 2 - gap * (SIZE - 1);
  const innerH = boardRect.height - boardPadding * 2 - gap * (SIZE - 1);
  const tileW = innerW / SIZE;
  const tileH = innerH / SIZE;

  [...board.children].forEach((el, i) => {
    const pieceId = tiles[i];
    const row = Math.floor(pieceId / SIZE);
    const col = pieceId % SIZE;

    el.style.backgroundImage = `url(${imageUrl})`;
    // A imagem inteira ocupa SIZE x SIZE tiles
    el.style.backgroundSize = `${tileW * SIZE}px ${tileH * SIZE}px`;
    // Desloca para mostrar o pedaço correto
    el.style.backgroundPosition = `${-col * tileW}px ${-row * tileH}px`;

    el.classList.toggle('selected', i === selectedIndex);
  });
}

// ===== Interação =====
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
  [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
  selectedIndex = null;
  moves++;
  movesEl.textContent = moves;
  render();
  if (isSolved()) onWin();
}

// ===== Embaralhar =====
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

// ===== Verificar solução =====
function isSolved() {
  return tiles.every((v, i) => v === i);
}

// ===== Vitória =====
function onWin() {
  gameActive = false;
  stopTimer();

  winTimeEl.textContent = formatTime(seconds);
  winMovesEl.textContent = moves;
  winModal.classList.remove('hidden');
  launchConfetti();

  // Salva recorde
  const key = `best_${SIZE}x${SIZE}`;
  const best = parseInt(localStorage.getItem(key) || '999999', 10);
  if (moves < best) localStorage.setItem(key, moves);

  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
}

function launchConfetti() {
  confettiBox.innerHTML = '';
  const colors = ['#ffd166', '#ff6b9d', '#7c5cff', '#7cf29c', '#5cc8ff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confettiBox.appendChild(piece);
  }
}

// ===== Botões =====
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

// Peek: mostra a imagem inteira por 2s e restaura
peekBtn.addEventListener('click', () => {
  if (!gameActive) return;
  [...board.children].forEach((el) => {
    el.style.backgroundSize = '100% 100%';
    el.style.backgroundPosition = 'center';
  });
  setTimeout(() => render(), 2000);
});

// ===== Modal de vitória =====
playAgainBtn.addEventListener('click', () => {
  winModal.classList.add('hidden');
  startGame();
});

newPhotoBtn.addEventListener('click', () => {
  winModal.classList.add('hidden');
  resetBtn.click();
});

// Compartilhar
shareBtn.addEventListener('click', async () => {
  const text = `🧩 Resolvi um quebra-cabeça ${SIZE}×${SIZE} em ${formatTime(seconds)} com ${moves} movimentos!`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Quebra-Cabeça', text, url: location.href });
    } catch (_) {}
  } else {
    try {
      await navigator.clipboard.writeText(text + ' ' + location.href);
      shareBtn.textContent = '✅ Copiado!';
      setTimeout(() => (shareBtn.textContent = '📤 Compartilhar'), 1500);
    } catch (_) {
      alert(text);
    }
  }
});

// ===== Re-render ao redimensionar / girar =====
window.addEventListener('resize', () => {
  if (gameActive) render();
});

// ===== PWA =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

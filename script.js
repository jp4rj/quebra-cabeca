const fileInput = document.getElementById('fileInput');
const gameArea  = document.getElementById('gameArea');
const board     = document.getElementById('board');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn   = document.getElementById('resetBtn');
const statusEl   = document.getElementById('status');

const SIZE = 4;               // 4x4 = 16 peças
let tiles = [];               // estado do tabuleiro (ordem das peças)
let selectedIndex = null;
let pieceUrls = [];           // URLs das 16 imagens recortadas

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = await loadImage(file);

  // Verifica se é retrato (opcional: avisa se não for)
  if (img.width >= img.height) {
    const ok = confirm('A imagem não está no modo retrato. Continuar mesmo assim?');
    if (!ok) return;
  }

  pieceUrls = await sliceImage(img, SIZE);
  buildBoard();
  shuffle();
  gameArea.classList.remove('hidden');
});

function loadImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

// Recorta a imagem em SIZE x SIZE pedaços, retornando dataURLs
async function sliceImage(img, n) {
  const pieceW = img.width  / n;
  const pieceH = img.height / n;
  const urls = [];

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const canvas = document.createElement('canvas');
      canvas.width  = pieceW;
      canvas.height = pieceH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        col * pieceW, row * pieceH, pieceW, pieceH,
        0, 0, pieceW, pieceH
      );
      urls.push(canvas.toDataURL());
    }
  }
  return urls;
}

function buildBoard() {
  board.innerHTML = '';
  tiles = Array.from({ length: SIZE * SIZE }, (_, i) => i);

  for (let i = 0; i < SIZE * SIZE; i++) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.dataset.index = i;
    div.addEventListener('click', () => onTileClick(i));
    board.appendChild(div);
  }
  render();
}

function render() {
  [...board.children].forEach((el, i) => {
    el.style.backgroundImage = `url(${pieceUrls[tiles[i]]})`;
    el.classList.toggle('selected', i === selectedIndex);
  });
  statusEl.textContent = isSolved() ? '🎉 Resolvido!' : '';
}

function onTileClick(index) {
  if (selectedIndex === null) {
    selectedIndex = index;
  } else if (selectedIndex === index) {
    selectedIndex = null; // desmarca
  } else {
    // troca as duas peças
    [tiles[selectedIndex], tiles[index]] = [tiles[index], tiles[selectedIndex]];
    selectedIndex = null;
  }
  render();
}

function shuffle() {
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (isSolved()); // evita embaralhar já resolvido
  selectedIndex = null;
  render();
}

function isSolved() {
  return tiles.every((v, i) => v === i);
}

shuffleBtn.addEventListener('click', shuffle);

resetBtn.addEventListener('click', () => {
  gameArea.classList.add('hidden');
  fileInput.value = '';
  pieceUrls = [];
  tiles = [];
});

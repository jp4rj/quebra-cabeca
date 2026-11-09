const fileInput  = document.getElementById('fileInput');
const gameArea   = document.getElementById('gameArea');
const board      = document.getElementById('board');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn   = document.getElementById('resetBtn');
const statusEl   = document.getElementById('status');

const SIZE = 4;
let tiles = [];
let selectedIndex = null;
let imageUrl = null;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  imageUrl = URL.createObjectURL(file);
  buildBoard();
  shuffle();
  gameArea.classList.remove('hidden');
});

function buildBoard() {
  board.innerHTML = '';
  tiles = Array.from({ length: SIZE * SIZE }, (_, i) => i);

  for (let i = 0; i < SIZE * SIZE; i++) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.addEventListener('click', () => onTileClick(i));
    board.appendChild(div);
  }
  render();
}

function render() {
  [...board.children].forEach((el, i) => {
    const pieceId = tiles[i];                 // qual pedaço está aqui
    const row = Math.floor(pieceId / SIZE);   // linha do pedaço original
    const col = pieceId % SIZE;               // coluna do pedaço original

    el.style.backgroundImage = `url(${imageUrl})`;
    // Posiciona o "fundo" para mostrar o pedaço correto
    el.style.backgroundPosition =
      `${(col / (SIZE - 1)) * 100}% ${(row / (SIZE - 1)) * 100}%`;

    el.classList.toggle('selected', i === selectedIndex);
  });

  statusEl.textContent = isSolved() ? '🎉 Resolvido!' : '';
}

function onTileClick(index) {
  if (selectedIndex === null) {
    selectedIndex = index;
  } else if (selectedIndex === index) {
    selectedIndex = null;
  } else {
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
  } while (isSolved());
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
  imageUrl = null;
  tiles = [];
});

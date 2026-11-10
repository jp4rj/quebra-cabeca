#!/usr/bin/env bash
set -e
mkdir -p fotos
while IFS='|' read -r cat slug url; do
  [ -z "$cat" ] && continue
  dest="fotos/${cat}/${slug}.jpg"
  mkdir -p "fotos/${cat}"
  if [ -s "$dest" ]; then
    echo "  ✓ já existe: $dest"
    continue
  fi
  echo "  ↓ $dest"
  curl -sSL --fail "$url" -o "$dest" || { echo "  ⚠ falhou, removendo vazio"; rm -f "$dest"; }
done < lista-fotos.txt

echo ""
echo "Verificando tamanho zero..."
find fotos/ -type f -size 0 -print -delete
echo "Total de fotos:"
find fotos/ -type f | wc -l

// images.js — galeria local em fotos/<categoria>/<slug>.jpg

const GALLERY_CATEGORIES = {
  natureza: {
    title: '🌿 Natureza',
    images: [
      { name: 'Floresta',      url: 'fotos/natureza/floresta.jpg' },
      { name: 'Montanha',      url: 'fotos/natureza/montanha.jpg' },
      { name: 'Praia',         url: 'fotos/natureza/praia.jpg' },
      { name: 'Flor',          url: 'fotos/natureza/flor.jpg' },
      { name: 'Outono',        url: 'fotos/natureza/outono.jpg' },
      { name: 'Lago',          url: 'fotos/natureza/lago.jpg' },
      { name: 'Cachoeira',     url: 'fotos/natureza/cachoeira.jpg' },
      { name: 'Deserto',       url: 'fotos/natureza/deserto.jpg' },
      { name: 'Céu Estrelado', url: 'fotos/natureza/ceu-estrelado.jpg' },
      { name: 'Jardim',        url: 'fotos/natureza/jardim.jpg' }
    ]
  },
  urbano: {
    title: '🏙️ Urbano',
    images: [
      { name: 'Cidade',         url: 'fotos/urbano/cidade.jpg' },
      { name: 'Rua',            url: 'fotos/urbano/rua.jpg' },
      { name: 'Prédios',        url: 'fotos/urbano/predios.jpg' },
      { name: 'Ponte',          url: 'fotos/urbano/ponte.jpg' },
      { name: 'Metrô',          url: 'fotos/urbano/metro.jpg' },
      { name: 'Luzes Noturnas', url: 'fotos/urbano/luzes-noturnas.jpg' },
      { name: 'Arquitetura',    url: 'fotos/urbano/arquitetura.jpg' },
      { name: 'Janela',         url: 'fotos/urbano/janela.jpg' },
      { name: 'Telhados',       url: 'fotos/urbano/telhados.jpg' },
      { name: 'Viaduto',        url: 'fotos/urbano/viaduto.jpg' }
    ]
  },
  animais: {
    title: '🐾 Animais',
    images: [
      { name: 'Cachorro', url: 'fotos/animais/cachorro.jpg' },
      { name: 'Gato',     url: 'fotos/animais/gato.jpg' },
      { name: 'Leão',     url: 'fotos/animais/leao.jpg' },
      { name: 'Pássaro',  url: 'fotos/animais/passaro.jpg' },
      { name: 'Cavalo',   url: 'fotos/animais/cavalo.jpg' },
      { name: 'Elefante', url: 'fotos/animais/elefante.jpg' },
      { name: 'Tigre',    url: 'fotos/animais/tigre.jpg' },
      { name: 'Urso',     url: 'fotos/animais/urso.jpg' },
      { name: 'Coruja',   url: 'fotos/animais/coruja.jpg' },
      { name: 'Coelho',   url: 'fotos/animais/coelho.jpg' }
    ]
  },
  arte: {
    title: '🎨 Obra de Arte',
    images: [
      { name: 'Pintura',   url: 'fotos/arte/pintura.jpg' },
      { name: 'Retrato',   url: 'fotos/arte/retrato.jpg' },
      { name: 'Escultura', url: 'fotos/arte/escultura.jpg' },
      { name: 'Abstrato',  url: 'fotos/arte/abstrato.jpg' },
      { name: 'Galeria',   url: 'fotos/arte/galeria.jpg' },
      { name: 'Tinta',     url: 'fotos/arte/tinta.jpg' },
      { name: 'Grafite',   url: 'fotos/arte/grafite.jpg' },
      { name: 'Máscara',   url: 'fotos/arte/mascara.jpg' },
      { name: 'Vitral',    url: 'fotos/arte/vitral.jpg' },
      { name: 'Pincéis',   url: 'fotos/arte/pinceis.jpg' }
    ]
  }
};

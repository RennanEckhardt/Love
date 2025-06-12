// -------------
// CARROSÉIS
// -------------

const container = document.getElementById("container");
const totalFotos = 9;    // ajuste para o número de imagens na pasta /fotos/
let varalCount = 0;

// Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function criarVaral() {
  varalCount++;
  const wrapper = document.createElement("div");
  wrapper.className = "varal-wrapper";

  const varal = document.createElement("div");
  varal.className = "varal";

  // array [1…N] ×2 e embaralha
  let fotos = Array.from({length: totalFotos}, (_,i) => i+1);
  fotos = fotos.concat(fotos);
  shuffle(fotos).forEach(n => {
    const img = document.createElement("img");
    img.src = `fotos/${n}.jpg`;
    img.className = "foto";
    img.addEventListener("click", () => openLightbox(img.src));
    varal.appendChild(img);
  });

  // duração aleatória e direção invertida a cada carrossel par
  varal.style.animationDuration = (Math.random()*15+15).toFixed(1) + "s";
  varal.style.animationDirection = (varalCount % 2 === 0) ? "reverse" : "normal";

  wrapper.appendChild(varal);
  container.appendChild(wrapper);
}

// gera 3 varais iniciais
// carrega inicialmente e garante scroll
for (let i = 0; i < 3; i++) criarVaral();
ensureScrollable();

// adiciona mais varais se a página ainda não for rolável
function ensureScrollable() {
  // enquanto o conteúdo for menor ou igual à altura da viewport, cria mais varais
  while (document.body.scrollHeight <= window.innerHeight) {
    criarVaral();
  }
}

// reexecuta após mudança de orientação/tamanho
window.addEventListener("resize", ensureScrollable);

// scroll infinito original
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) {
    criarVaral();
  }
});

// -------------
// LIGHTBOX
// -------------

const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbClose = document.getElementById("lightbox-close");

function openLightbox(src) {
  lbImg.src = src;
  lb.classList.remove("hidden");
}
lbClose.addEventListener("click", () => lb.classList.add("hidden"));
lb.addEventListener("click", e => { if (e.target === lb) lb.classList.add("hidden"); });

// -------------
// ÁUDIO/PLAYLIST
// -------------

const audio = document.getElementById("audio-player");
const controls = document.getElementById("audio-controls");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Defina aqui quantas músicas você colocou na pasta /musica/
// Se chamarem 1.mp3, 2.mp3, 3.mp3…, basta ajustar totalTracks.
const totalTracks = 1;  
const playlist = Array.from({length: totalTracks}, (_,i) => `musica/${i+1}.mp3`);
let currentTrack = 0;

// Carrega a faixa atual
function loadTrack(index) {
  audio.src = playlist[index];
  audio.load();
}

// Tocar ou pausar
function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    audio.pause();
    playPauseBtn.textContent = "▶️";
  }
}

// Próxima faixa
function nextTrack() {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  audio.play();
  playPauseBtn.textContent = "⏸️";
}

// Faixa anterior
function prevTrack() {
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrack);
  audio.play();
  playPauseBtn.textContent = "⏸️";
}

// Event listeners dos botões
playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

// Inicia player ao primeiro clique em qualquer lugar
function startAudioOnFirstClick() {
  loadTrack(currentTrack);
  audio.play().then(() => {
    playPauseBtn.textContent = "⏸️";
    controls.classList.remove("hidden");
  }).catch(() => {
    // se falhar (mobile), mostrar controles para clique manual
    controls.classList.remove("hidden");
  });
  window.removeEventListener("click", startAudioOnFirstClick);
}
window.addEventListener("click", startAudioOnFirstClick, { once: true });

// ================================
// TENTATIVA DE AUTOPLAY IMEDIATO
// ================================
window.addEventListener('load', () => {
    // tenta tocar mudo para driblar o bloqueio
    audio.play()
      .then(() => {
        // remove o muted e repete o play para liberar o som
        audio.muted = false;
        return audio.play();
      })
      .catch(() => {
        // se ainda falhar, deixa o player visível para o usuário tocar manualmente
        controls.classList.remove("hidden");
      });
  });
// ================
// TRADUÇÃO COM INTERSECTION OBSERVER
// ================
let translationLoadedFor = null;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      translationSection.classList.add("visible");
      // carrega só uma vez por faixa
      if (translationLoadedFor !== currentTrack) {
        loadTranslation(currentTrack);
        translationLoadedFor = currentTrack;
      }
    }
  });
}, {
  root: null,           // viewport
  threshold: 0.2        // quando 20% da seção estiver visível
});

// inicia o observer
observer.observe(translationSection);

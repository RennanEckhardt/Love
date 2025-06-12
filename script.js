// Elementos principais
const container = document.getElementById("container");
const translationSection = document.getElementById("translation");
const translationContent = document.getElementById("translation-content");
const footer = document.getElementById("footer");
const audio = document.getElementById("audio-player");
const controls = document.getElementById("audio-controls");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbClose = document.getElementById("lightbox-close");

// Configurações
const totalFotos = 51;    // ajuste para sua pasta /fotos/
const totalTracks = 6;    // ajuste para sua pasta /musica/
const fotosPorVaral = 17; // Número de fotos por varal
const fotosUsadas = new Set();

let varalCount = 0;
let currentTrack = 0;
let translationLoadedFor = null;

let todasFotos = Array.from({ length: totalFotos }, (_, i) => i + 1);

shuffle(todasFotos);

// Playlist
const playlist = Array.from({ length: totalTracks }, (_, i) => `musica/${i + 1}.mp3`);

// Função de shuffle
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Cria um varal (carrossel)
// Função criarVaral modificada
function criarVaral() {
    varalCount++;

    // Criar wrapper do varal
    const wrapper = document.createElement("div");
    wrapper.className = "varal-wrapper";
    const varal = document.createElement("div");
    varal.className = "varal";

    // 1. Verificar fotos disponíveis
    const fotosDisponiveis = todasFotos.filter(n => !fotosUsadas.has(n));

    // 2. Se não houver fotos suficientes, reiniciar o conjunto
    if (fotosDisponiveis.length < fotosPorVaral) {
        fotosUsadas.clear();
    }

    // 3. Selecionar fotos aleatoriamente SEM repetição
    const fotosSelecionadas = [];
    while (fotosSelecionadas.length < fotosPorVaral && fotosDisponiveis.length > 0) {
        const randomIndex = Math.floor(Math.random() * fotosDisponiveis.length);
        const fotoSelecionada = fotosDisponiveis.splice(randomIndex, 1)[0];

        fotosSelecionadas.push(fotoSelecionada);
        fotosUsadas.add(fotoSelecionada);
    }

    // 4. Adicionar fotos ao varal
    fotosSelecionadas.forEach(n => {
        const img = document.createElement("img");
        img.src = `fotos/imagem (${n}).jpg`;
        img.className = "foto";
        img.addEventListener("click", () => openLightbox(img.src));
        varal.appendChild(img);
    });

    // Configurações de animação
    varal.style.animationDuration = (Math.random() * 20 + 20).toFixed(1) + "s";
    varal.style.animationDirection = (varalCount % 2 === 0) ? "reverse" : "normal";

    wrapper.appendChild(varal);
    container.appendChild(wrapper);
}

// Garantir scroll inicial
function ensureScrollable() {
    while (document.body.scrollHeight <= window.innerHeight) {
        criarVaral();
    }
}

// Lightbox
function openLightbox(src) {
    lbImg.src = src;
    lb.classList.remove("hidden");
}

lbClose.addEventListener("click", () => lb.classList.add("hidden"));
lb.addEventListener("click", e => { if (e.target === lb) lb.classList.add("hidden"); });

// Áudio e controles
function loadTrack(index) {
    audio.src = playlist[index];
    audio.load();
}
function togglePlayPause() {
    if (audio.paused) { audio.play(); playPauseBtn.textContent = "⏸️"; }
    else { audio.pause(); playPauseBtn.textContent = "▶️"; }
}
function loadTranslation(trackIndex) {
    // Mostra um indicador de carregamento
    translationContent.innerHTML = '<div class="loading">Carregando tradução...</div>';

    fetch(`traducao/${trackIndex + 1}.txt`)
        .then(res => res.ok ? res.text() : Promise.reject())
        .then(text => {
            const paras = text.split("\n\n");
            translationContent.innerHTML = paras.map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
        })
        .catch(() => translationContent.innerHTML = "<p><em>Tradução não disponível.</em></p>");
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
    playPauseBtn.textContent = "⏸️";

    // Atualiza a tradução imediatamente
    loadTranslation(currentTrack);
    translationLoadedFor = currentTrack;
}

function prevTrack() {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
    playPauseBtn.textContent = "⏸️";

    // Atualiza a tradução imediatamente
    loadTranslation(currentTrack);
    translationLoadedFor = currentTrack;
}
playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

// Tradução
function loadTranslation(trackIndex) {
    fetch(`traducao/${trackIndex + 1}.txt`)
        .then(res => res.ok ? res.text() : Promise.reject())
        .then(text => {
            const paras = text.split("\n\n");
            translationContent.innerHTML = paras.map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
        })
        .catch(() => translationContent.innerHTML = "<p><em>Tradução não disponível.</em></p>");
}

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            translationSection.classList.add("visible");
            footer.classList.add("visible");
            if (translationLoadedFor !== currentTrack) { loadTranslation(currentTrack); translationLoadedFor = currentTrack; }
            window.removeEventListener("scroll", infiniteScrollHandler);
        }
    });
}, { threshold: 0.2 });

// Scroll infinito
function infiniteScrollHandler() { if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) criarVaral(); }

// Inicia música ao primeiro clique se autoplay falhar
window.addEventListener('click', () => {
    // Se estiver pausado, toca e atualiza o botão
    if (audio.paused) {
        audio.muted = false;
        audio.play().then(() => {
            playPauseBtn.textContent = "⏸️";
            controls.classList.remove('hidden');
        }).catch(() => {
            // mostra controles se falhar
            controls.classList.remove("hidden");
        });
    }
}, { once: true });

window.addEventListener("load", () => {
    for (let i = 0; i < 3; i++) criarVaral();
    ensureScrollable();
    container.appendChild(translationSection);
    observer.observe(translationSection);

    loadTrack(currentTrack);
    // Tenta autoplay mudo e depois desmuta para driblar políticas de navegador
    audio.play().then(() => {
        audio.muted = false;
        return audio.play();
    }).catch(() => {
        // mostra controles enquanto espera clique
        controls.classList.remove("hidden");
    });
    // mostra controles assim que tocar
    audio.addEventListener("play", () => controls.classList.remove("hidden"), { once: true });

    window.addEventListener("scroll", infiniteScrollHandler);
    window.addEventListener("resize", ensureScrollable);
});
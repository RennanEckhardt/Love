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
let currentTrack = 0;
let translationLoadedFor = null;

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

// Embaralha as 51 fotos e divide em 3 grupos de 17, sem repetição
const fotos = shuffle(Array.from({ length: totalFotos }, (_, i) => i + 1));
const fotosPorCarrossel = 17;
const gruposDeFotos = [
    fotos.slice(0, fotosPorCarrossel),
    fotos.slice(fotosPorCarrossel, fotosPorCarrossel * 2),
    fotos.slice(fotosPorCarrossel * 2, fotosPorCarrossel * 3)
];

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

// Função para criar um carrossel animado e arrastável
function criarCarrossel(grupoFotos) {
    const wrapper = document.createElement("div");
    wrapper.className = "carrossel-wrapper";

    const carrossel = document.createElement("div");
    carrossel.className = "carrossel";

    grupoFotos.forEach(n => {
        const img = document.createElement("img");
        img.src = `fotos/imagem (${n}).jpg`;
        img.className = "carrossel-foto";
        img.addEventListener("click", () => openLightbox(img.src));
        carrossel.appendChild(img);
    });

    // --- Animação automática para a direita ---
    let autoScroll;
    const scrollSpeed = 1; // px por frame

    function startAutoScroll() {
        stopAutoScroll();
        autoScroll = setInterval(() => {
            carrossel.scrollLeft += scrollSpeed;
            // Loop infinito
            if (carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth) {
                carrossel.scrollLeft = 0;
            }
        }, 16); // ~60fps
    }
    function stopAutoScroll() {
        if (autoScroll) clearInterval(autoScroll);
    }

    startAutoScroll();

    // --- Arraste manual (touch e mouse) ---
    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse
    carrossel.addEventListener('mousedown', (e) => {
        isDown = true;
        carrossel.classList.add('dragging');
        startX = e.pageX - carrossel.offsetLeft;
        scrollLeft = carrossel.scrollLeft;
        stopAutoScroll();
    });
    carrossel.addEventListener('mouseleave', () => {
        isDown = false;
        carrossel.classList.remove('dragging');
        startAutoScroll();
    });
    carrossel.addEventListener('mouseup', () => {
        isDown = false;
        carrossel.classList.remove('dragging');
        startAutoScroll();
    });
    carrossel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carrossel.offsetLeft;
        const walk = (x - startX);
        carrossel.scrollLeft = scrollLeft - walk;
    });

    // Touch (mobile) — apenas ativa/desativa animação automática
    carrossel.addEventListener('touchstart', () => {
        stopAutoScroll();
    });
    carrossel.addEventListener('touchend', () => {
        startAutoScroll();
    });
    carrossel.addEventListener('touchcancel', () => {
        startAutoScroll();
    });
    // Remova o touchmove personalizado!
    // Assim, o scroll horizontal nativo do navegador funciona com inércia.

    wrapper.appendChild(carrossel);
    container.appendChild(wrapper);
}

// Criação dos carrosseis animados (todos para a direita)
window.addEventListener("load", () => {
    criarCarrossel(gruposDeFotos[0]);
    criarCarrossel(gruposDeFotos[1]);
    criarCarrossel(gruposDeFotos[2]);
    container.appendChild(translationSection);
    observer.observe(translationSection);

    loadTrack(currentTrack);
    audio.play().then(() => {
        audio.muted = false;
        return audio.play();
    }).catch(() => {
        controls.classList.remove("hidden");
    });
    audio.addEventListener("play", () => controls.classList.remove("hidden"), { once: true });
});
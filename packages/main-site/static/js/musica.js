document.addEventListener("DOMContentLoaded", function () {
  const aboutOpen = document.getElementById("about-open");
  const aboutModal = document.getElementById("about-modal");
  const aboutModalBackdrop = document.getElementById("about-modal-backdrop");
  const aboutModalClose = document.getElementById("about-modal-close");

  if (aboutOpen && aboutModal) {
    const closeAbout = () => {
      aboutModal.hidden = true;
    };
    aboutOpen.addEventListener("click", () => {
      aboutModal.hidden = false;
    });
    aboutModalClose.addEventListener("click", closeAbout);
    aboutModalBackdrop.addEventListener("click", closeAbout);
  }

  const donarModal = document.getElementById("donar-modal");
  const donarModalBackdrop = document.getElementById("donar-modal-backdrop");
  const donarModalClose = document.getElementById("donar-modal-close");
  const donarModalLink = document.getElementById("donar-modal-link");

  if (donarModal) {
    const closeDonar = () => {
      donarModal.hidden = true;
    };
    document.querySelectorAll("[data-donar-href]").forEach((btn) => {
      btn.addEventListener("click", () => {
        donarModalLink.href = btn.dataset.donarHref;
        donarModal.hidden = false;
      });
    });
    donarModalClose.addEventListener("click", closeDonar);
    donarModalBackdrop.addEventListener("click", closeDonar);
  }

  document.querySelectorAll(".disco-descargar-zip").forEach((btn) => {
    const originalText = btn.textContent;

    btn.addEventListener("click", async () => {
      if (typeof JSZip === "undefined") return;
      const urls = (btn.dataset.zipUrls || "").split("|").filter(Boolean);
      if (urls.length === 0) return;

      btn.disabled = true;
      btn.textContent = "Preparando…";

      try {
        const zip = new JSZip();
        await Promise.all(
          urls.map(async (url) => {
            const res = await fetch(url);
            const blob = await res.blob();
            const filename = decodeURIComponent(url.split("/").pop());
            zip.file(filename, blob);
          })
        );
        const content = await zip.generateAsync({ type: "blob" });
        const nombre = (btn.dataset.zipNombre || "musica").trim().toLowerCase().replace(/\s+/g, "-");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = nombre + ".zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        btn.textContent = originalText;
        btn.disabled = false;
      } catch (e) {
        btn.textContent = "Error al preparar el zip";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2500);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const audio = new Audio();
  const trackEls = Array.from(document.querySelectorAll(".track"));
  if (trackEls.length === 0) return;

  const playerBar = document.getElementById("player-bar");
  const playerCover = document.getElementById("player-cover");
  const playerToggle = document.getElementById("player-toggle");
  const playerPrev = document.getElementById("player-prev");
  const playerNext = document.getElementById("player-next");
  const playerShuffle = document.getElementById("player-shuffle");
  const playerRepeat = document.getElementById("player-repeat");
  const playerTitulo = document.getElementById("player-titulo");
  const playerProgress = document.getElementById("player-progress");
  const playerTimeCurrent = document.getElementById("player-time-current");
  const playerTimeTotal = document.getElementById("player-time-total");
  const playerVolume = document.getElementById("player-volume");

  const videoModal = document.getElementById("video-modal");
  const videoModalBackdrop = document.getElementById("video-modal-backdrop");
  const videoModalClose = document.getElementById("video-modal-close");
  const videoModalPlayer = document.getElementById("video-modal-player");
  const videoModalTitulo = document.getElementById("video-modal-titulo");

  const STORAGE_KEY = "musica-player-state";

  let order = trackEls.map((_, i) => i); // orden de reproducción (respeta shuffle)
  let currentIndex = -1; // índice dentro de `order`
  let shuffle = false;
  let repeatMode = "off"; // off | all | one

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function rebuildOrder(keepCurrent) {
    const currentTrackIdx = currentIndex !== -1 ? order[currentIndex] : null;
    const base = trackEls.map((_, i) => i);
    order = shuffle ? shuffleArray(base) : base;
    if (keepCurrent && currentTrackIdx !== null) {
      const newPos = order.indexOf(currentTrackIdx);
      order.splice(newPos, 1);
      order.unshift(currentTrackIdx);
      currentIndex = 0;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          trackIdx: currentIndex !== -1 ? order[currentIndex] : null,
          time: audio.currentTime || 0,
          volume: audio.volume,
          shuffle,
          repeatMode,
        })
      );
    } catch (e) {
      /* localStorage puede no estar disponible */
    }
  }

  function setPlayIcon(container, playing) {
    container.classList.toggle("is-playing", playing);
  }

  function loadTrack(orderIndex, opts) {
    opts = opts || {};
    const trackIdx = order[orderIndex];
    const el = trackEls[trackIdx];
    audio.src = el.dataset.src;
    currentIndex = orderIndex;

    trackEls.forEach((t) => {
      t.classList.remove("active");
      setPlayIcon(t.querySelector(".track-play"), false);
    });
    el.classList.add("active");

    playerBar.hidden = false;
    playerCover.src = el.dataset.portada;
    playerCover.alt = "Portada de " + el.dataset.proyecto;
    playerTitulo.textContent = el.dataset.titulo + " — " + el.dataset.proyecto;
    playerTimeCurrent.textContent = "0:00";
    playerTimeTotal.textContent = "0:00";
    playerProgress.value = 0;

    if (opts.seekTo) {
      audio.currentTime = opts.seekTo;
    }
  }

  function playTrack(orderIndex, opts) {
    loadTrack(orderIndex, opts);
    audio.play();
  }

  function togglePlay(trackIdx) {
    const orderIndex = order.indexOf(trackIdx);
    if (orderIndex === currentIndex && !audio.paused) {
      audio.pause();
    } else if (orderIndex === currentIndex && audio.paused) {
      audio.play();
    } else {
      playTrack(orderIndex);
    }
  }

  trackEls.forEach((el, trackIdx) => {
    el.querySelector(".track-play").addEventListener("click", () => togglePlay(trackIdx));

    const audioProbe = new Audio(el.dataset.src);
    audioProbe.addEventListener("loadedmetadata", () => {
      const dur = el.querySelector("[data-duracion]");
      if (dur) dur.textContent = formatTime(audioProbe.duration);
    });

    const videoBtn = el.querySelector(".track-video");
    if (videoBtn) {
      videoBtn.addEventListener("click", () => {
        audio.pause();
        videoModalPlayer.src = videoBtn.dataset.video;
        videoModalTitulo.textContent = videoBtn.dataset.titulo;
        videoModal.hidden = false;
        videoModalPlayer.play();
      });
    }
  });

  function closeVideoModal() {
    videoModal.hidden = true;
    videoModalPlayer.pause();
    videoModalPlayer.src = "";
  }
  videoModalClose.addEventListener("click", closeVideoModal);
  videoModalBackdrop.addEventListener("click", closeVideoModal);

  document.querySelectorAll("[data-album-play]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = btn.dataset.albumPlay;
      const firstTrackIdx = trackEls.findIndex((t) => t.dataset.album === slug);
      if (firstTrackIdx === -1) return;
      if (shuffle) rebuildOrder(false);
      const orderIndex = order.indexOf(firstTrackIdx);
      playTrack(orderIndex);
    });
  });

  playerToggle.addEventListener("click", () => {
    if (currentIndex === -1) return;
    audio.paused ? audio.play() : audio.pause();
  });

  playerPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      playTrack(currentIndex - 1);
    } else if (currentIndex === 0 && repeatMode === "all") {
      playTrack(order.length - 1);
    }
  });

  playerNext.addEventListener("click", () => {
    if (currentIndex !== -1 && currentIndex < order.length - 1) {
      playTrack(currentIndex + 1);
    } else if (currentIndex !== -1 && repeatMode === "all") {
      playTrack(0);
    }
  });

  playerShuffle.addEventListener("click", () => {
    shuffle = !shuffle;
    playerShuffle.setAttribute("aria-pressed", String(shuffle));
    playerShuffle.classList.toggle("is-active", shuffle);
    rebuildOrder(true);
    saveState();
  });

  playerRepeat.addEventListener("click", () => {
    repeatMode = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    playerRepeat.dataset.mode = repeatMode;
    playerRepeat.setAttribute("aria-pressed", String(repeatMode !== "off"));
    playerRepeat.classList.toggle("is-active", repeatMode !== "off");
    saveState();
  });

  playerProgress.addEventListener("click", (e) => {
    if (currentIndex === -1 || !audio.duration) return;
    const rect = playerProgress.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
  });

  playerVolume.addEventListener("input", () => {
    audio.volume = Number(playerVolume.value);
    saveState();
  });

  audio.addEventListener("play", () => {
    setPlayIcon(playerToggle, true);
    if (currentIndex !== -1) setPlayIcon(trackEls[order[currentIndex]].querySelector(".track-play"), true);
  });

  audio.addEventListener("pause", () => {
    setPlayIcon(playerToggle, false);
    if (currentIndex !== -1) setPlayIcon(trackEls[order[currentIndex]].querySelector(".track-play"), false);
    saveState();
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      playerProgress.value = (audio.currentTime / audio.duration) * 100;
      playerTimeCurrent.textContent = formatTime(audio.currentTime);
      playerTimeTotal.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener("ended", () => {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      audio.play();
    } else if (currentIndex !== -1 && currentIndex < order.length - 1) {
      playTrack(currentIndex + 1);
    } else if (repeatMode === "all" && order.length > 0) {
      playTrack(0);
    } else {
      setPlayIcon(playerToggle, false);
      if (currentIndex !== -1) setPlayIcon(trackEls[order[currentIndex]].querySelector(".track-play"), false);
    }
  });

  window.addEventListener("beforeunload", saveState);

  // Restaurar estado previo
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      if (typeof saved.volume === "number") {
        audio.volume = saved.volume;
        playerVolume.value = saved.volume;
      }
      if (saved.shuffle) {
        shuffle = true;
        playerShuffle.setAttribute("aria-pressed", "true");
        playerShuffle.classList.add("is-active");
      }
      if (saved.repeatMode && saved.repeatMode !== "off") {
        repeatMode = saved.repeatMode;
        playerRepeat.dataset.mode = repeatMode;
        playerRepeat.setAttribute("aria-pressed", "true");
        playerRepeat.classList.add("is-active");
      }
      rebuildOrder(false);
      if (saved.trackIdx !== null && saved.trackIdx !== undefined && trackEls[saved.trackIdx]) {
        const orderIndex = order.indexOf(saved.trackIdx);
        loadTrack(orderIndex, { seekTo: saved.time || 0 });
      }
    } else {
      rebuildOrder(false);
    }
  } catch (e) {
    rebuildOrder(false);
  }
});

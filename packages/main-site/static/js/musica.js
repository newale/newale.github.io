document.addEventListener("DOMContentLoaded", function () {
  const audio = new Audio();
  const trackEls = Array.from(document.querySelectorAll(".track"));
  if (trackEls.length === 0) return;

  const playerBar = document.getElementById("player-bar");
  const playerToggle = document.getElementById("player-toggle");
  const playerPrev = document.getElementById("player-prev");
  const playerNext = document.getElementById("player-next");
  const playerTitulo = document.getElementById("player-titulo");
  const playerProgress = document.getElementById("player-progress");

  let currentIndex = -1;

  function setPlayIcon(el, playing) {
    el.textContent = playing ? "⏸" : "▶";
  }

  function loadTrack(index) {
    const el = trackEls[index];
    audio.src = el.dataset.src;
    currentIndex = index;

    trackEls.forEach((t) => {
      t.classList.remove("active");
      setPlayIcon(t.querySelector(".track-play"), false);
    });
    el.classList.add("active");

    playerBar.hidden = false;
    playerTitulo.textContent = el.dataset.titulo + " — " + el.dataset.proyecto;
  }

  function playTrack(index) {
    loadTrack(index);
    audio.play();
  }

  function togglePlay(index) {
    if (index === currentIndex && !audio.paused) {
      audio.pause();
    } else if (index === currentIndex && audio.paused) {
      audio.play();
    } else {
      playTrack(index);
    }
  }

  trackEls.forEach((el, index) => {
    el.querySelector(".track-play").addEventListener("click", () => togglePlay(index));
  });

  playerToggle.addEventListener("click", () => {
    if (currentIndex === -1) return;
    audio.paused ? audio.play() : audio.pause();
  });

  playerPrev.addEventListener("click", () => {
    if (currentIndex > 0) playTrack(currentIndex - 1);
  });

  playerNext.addEventListener("click", () => {
    if (currentIndex !== -1 && currentIndex < trackEls.length - 1) playTrack(currentIndex + 1);
  });

  audio.addEventListener("play", () => {
    setPlayIcon(playerToggle, true);
    if (currentIndex !== -1) setPlayIcon(trackEls[currentIndex].querySelector(".track-play"), true);
  });

  audio.addEventListener("pause", () => {
    setPlayIcon(playerToggle, false);
    if (currentIndex !== -1) setPlayIcon(trackEls[currentIndex].querySelector(".track-play"), false);
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      playerProgress.value = (audio.currentTime / audio.duration) * 100;
    }
  });

  audio.addEventListener("ended", () => {
    if (currentIndex !== -1 && currentIndex < trackEls.length - 1) {
      playTrack(currentIndex + 1);
    } else {
      setPlayIcon(playerToggle, false);
      if (currentIndex !== -1) setPlayIcon(trackEls[currentIndex].querySelector(".track-play"), false);
    }
  });
});

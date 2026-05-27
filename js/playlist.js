// playlist.html 専用
// YouTubeプレイリストから曲カードを作り、クリックでNow Playingを変更する

console.log("playlist.js 読み込まれた");

let isPlaying = false;

async function loadPlaylistUI() {
  const playlistList = document.querySelector(".playlist-list");
  const youtubePlayer = document.getElementById("youtube-player");
  const nowTitle = document.querySelector(".player-info h2");
  const artistText = document.querySelector(".artist");
  const playButton = document.querySelector(".play-button");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");

  if (!playlistList || !youtubePlayer || !nowTitle) return;

  const allItems = await fetchAllPlaylistItems();

  if (!allItems || allItems.length === 0) {
    playlistList.innerHTML = "<p>楽曲を取得できませんでした。</p>";
    return;
  }

  playlistList.innerHTML = "";

  allItems.forEach((item, index) => {
    const snippet = item.snippet;
    const videoId = snippet?.resourceId?.videoId;
    const title = snippet?.title;

    if (!videoId || !title) return;

    const thumbnail =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.standard?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const description = createShortDescription(snippet.description);

    const card = document.createElement("article");
    card.className = "song-card";
    card.dataset.videoId = videoId;
    card.dataset.title = title;

    if (index === 0) {
      card.classList.add("is-active");

      updateNowPlaying({
        title,
        videoId,
        youtubePlayer,
        nowTitle,
        artistText,
        autoplay: false,
      });
    }

    card.innerHTML = `
      <img src="${thumbnail}" alt="${escapeHtml(title)}のサムネイル">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
      </div>
      <span>♪</span>
    `;

    card.addEventListener("click", () => {
      selectSong({
        card,
        title,
        videoId,
        youtubePlayer,
        nowTitle,
        artistText,
        autoplay: true,
      });
    });

    playlistList.appendChild(card);
  });

  if (playButton) {
    playButton.addEventListener("click", () => {
      const activeCard = document.querySelector(".song-card.is-active");
      if (!activeCard) return;

      const videoId = activeCard.dataset.videoId;
      const title = activeCard.dataset.title || nowTitle.textContent;

      if (!videoId) return;

      if (!isPlaying) {
        updateNowPlaying({
          title,
          videoId,
          youtubePlayer,
          nowTitle,
          artistText,
          autoplay: true,
        });

        isPlaying = true;
        setPlayButtonState(playButton, true);
        startWave();
      } else {
        // YouTube iframeは外部再生の一時停止を直接制御しにくいので、
        // ここでは見た目の停止＋iframeを再読み込みして止める
        youtubePlayer.src = `https://www.youtube.com/embed/${videoId}`;

        isPlaying = false;
        setPlayButtonState(playButton, false);
        stopWave();
      }
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      moveSong(1, youtubePlayer, nowTitle, artistText);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      moveSong(-1, youtubePlayer, nowTitle, artistText);
    });
  }
}

function selectSong({
  card,
  title,
  videoId,
  youtubePlayer,
  nowTitle,
  artistText,
  autoplay = true,
}) {
  document.querySelectorAll(".song-card").forEach((el) => {
    el.classList.remove("is-active");
  });

  card.classList.add("is-active");

  updateNowPlaying({
    title,
    videoId,
    youtubePlayer,
    nowTitle,
    artistText,
    autoplay,
  });

  isPlaying = autoplay;
  setPlayButtonState(document.querySelector(".play-button"), autoplay);

  if (autoplay) {
    startWave();
  } else {
    stopWave();
  }
}

function updateNowPlaying({
  title,
  videoId,
  youtubePlayer,
  nowTitle,
  artistText,
  autoplay = false,
}) {
  nowTitle.textContent = title;

  if (artistText) {
    artistText.textContent = "サマースチル";
  }

  youtubePlayer.src = autoplay
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : `https://www.youtube.com/embed/${videoId}`;
}

function moveSong(direction, youtubePlayer, nowTitle, artistText) {
  const cards = Array.from(document.querySelectorAll(".song-card"));
  const currentIndex = cards.findIndex((card) =>
    card.classList.contains("is-active")
  );

  if (cards.length === 0 || currentIndex === -1) return;

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) {
    nextIndex = cards.length - 1;
  }

  if (nextIndex >= cards.length) {
    nextIndex = 0;
  }

  const nextCard = cards[nextIndex];
  const videoId = nextCard.dataset.videoId;
  const title = nextCard.dataset.title;

  if (!videoId || !title) return;

  selectSong({
    card: nextCard,
    title,
    videoId,
    youtubePlayer,
    nowTitle,
    artistText,
    autoplay: true,
  });
}

function setPlayButtonState(playButton, playing) {
  if (!playButton) return;

  if (playing) {
    playButton.classList.add("is-playing");
    playButton.textContent = "Ⅱ";
  } else {
    playButton.classList.remove("is-playing");
    playButton.textContent = "▶";
  }
}

function startWave() {
  const wave = document.querySelector(".wave");

  if (wave) {
    wave.classList.add("is-playing");
  }
}

function stopWave() {
  const wave = document.querySelector(".wave");

  if (wave) {
    wave.classList.remove("is-playing");
  }
}

function createShortDescription(description) {
  if (!description) {
    return "サマースチルの楽曲です。";
  }

  const cleanText = description
    .replace(/\n/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .trim();

  if (!cleanText) {
    return "サマースチルの楽曲です。";
  }

  return cleanText.length > 42
    ? cleanText.slice(0, 42) + "..."
    : cleanText;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  loadPlaylistUI();
});
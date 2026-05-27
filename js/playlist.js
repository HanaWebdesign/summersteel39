console.log("playlist.js 読み込まれた");

let player = null;
let isPlayerReady = false;
let isPlaying = false;
let currentVideoId = "";
let currentTitle = "";

/* YouTube IFrame API 読み込み */
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";

const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

/* YouTube API準備完了 */
function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtube-player", {
    width: "100%",
    height: "100%",
    videoId: "",
    playerVars: {
      rel: 0,
      playsinline: 1,
    },
    events: {
      onReady: () => {
        isPlayerReady = true;
        loadPlaylistUI();
      },
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerStateChange(event) {
  const playButton = document.querySelector(".play-button");

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    setPlayButtonState(playButton, true);
    startWave();
  }

  if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
    isPlaying = false;
    setPlayButtonState(playButton, false);
    stopWave();
  }
}

/* プレイリスト読み込み */
async function loadPlaylistUI() {
  const playlistList = document.querySelector(".playlist-list");
  const nowTitle = document.querySelector(".player-info h2");
  const artistText = document.querySelector(".artist");
  const playButton = document.querySelector(".play-button");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");

  if (!playlistList || !nowTitle) return;

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

    card.innerHTML = `
      <img src="${thumbnail}" alt="${escapeHtml(title)}のサムネイル">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
      </div>
      <span>♪</span>
    `;

    card.addEventListener("click", () => {
      selectSong(card, true);
    });

    playlistList.appendChild(card);

    if (index === 0) {
      card.classList.add("is-active");
      currentVideoId = videoId;
      currentTitle = title;
      nowTitle.textContent = title;

      if (artistText) artistText.textContent = "サマースチル";

      if (isPlayerReady && player) {
        player.cueVideoById(videoId);
      }
    }
  });

  if (playButton) {
    playButton.addEventListener("click", () => {
      if (!player || !isPlayerReady || !currentVideoId) return;

      if (!isPlaying) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      moveSong(1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      moveSong(-1);
    });
  }
}

/* 曲選択 */
function selectSong(card, autoplay = true) {
  const nowTitle = document.querySelector(".player-info h2");
  const artistText = document.querySelector(".artist");

  const videoId = card.dataset.videoId;
  const title = card.dataset.title;

  if (!videoId || !title) return;

  document.querySelectorAll(".song-card").forEach((el) => {
    el.classList.remove("is-active");
  });

  card.classList.add("is-active");

  currentVideoId = videoId;
  currentTitle = title;

  nowTitle.textContent = title;

  if (artistText) {
    artistText.textContent = "サマースチル";
  }

  if (!player || !isPlayerReady) return;

  if (autoplay) {
    player.loadVideoById(videoId);
    isPlaying = true;
    setPlayButtonState(document.querySelector(".play-button"), true);
    startWave();
  } else {
    player.cueVideoById(videoId);
    isPlaying = false;
    setPlayButtonState(document.querySelector(".play-button"), false);
    stopWave();
  }
}

/* 前後移動 */
function moveSong(direction) {
  const cards = Array.from(document.querySelectorAll(".song-card"));
  const currentIndex = cards.findIndex((card) =>
    card.classList.contains("is-active")
  );

  if (cards.length === 0 || currentIndex === -1) return;

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = cards.length - 1;
  if (nextIndex >= cards.length) nextIndex = 0;

  selectSong(cards[nextIndex], true);
}

/* ボタン状態 */
function setPlayButtonState(button, playing) {
  if (!button) return;

  if (playing) {
    button.classList.add("is-playing");
    button.textContent = "Ⅱ";
  } else {
    button.classList.remove("is-playing");
    button.textContent = "▶";
  }
}

/* 波形 */
function startWave() {
  const wave = document.querySelector(".wave");
  if (wave) wave.classList.add("is-playing");
}

function stopWave() {
  const wave = document.querySelector(".wave");
  if (wave) wave.classList.remove("is-playing");
}

/* 説明文短縮 */
function createShortDescription(description) {
  if (!description) return "サマースチルの楽曲です。";

  const cleanText = description
    .replace(/\n/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .trim();

  if (!cleanText) return "サマースチルの楽曲です。";

  return cleanText.length > 42
    ? cleanText.slice(0, 42) + "..."
    : cleanText;
}

/* HTMLエスケープ */
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
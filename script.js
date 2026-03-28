// ▼▼▼ APIキーとプレイリストID ▼▼▼
const API_KEY = "AIzaSyD7iHybNfXwiBC_jjh-THvjxjugqe7uOSM";
const PLAYLIST_ID = "PL_23ESG8aDXWqpTywyPxRP0zAvBmHcq3C";
// ▲▲▲ ここは変更しない ▲▲▲


// プレイリスト全件取得
async function fetchAllPlaylistItems() {
  let allItems = [];
  let pageToken = null;

  try {
    while (true) {
      const params = new URLSearchParams({
        part: "snippet",
        maxResults: "50",
        playlistId: PLAYLIST_ID,
        key: API_KEY,
      });

      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        console.error("YouTube API error:", data);
        return [];
      }

      if (Array.isArray(data.items)) {
        allItems.push(...data.items);
      }

      if (!data.nextPageToken) {
        break;
      }

      pageToken = data.nextPageToken;
    }
  } catch (e) {
    console.error("fetchAllPlaylistItems error:", e);
    return [];
  }

  return allItems;
}


// 共通：iframeカード作成
function createVideoCard(videoId) {
  const card = document.createElement("div");
  card.className = "video-card";

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";
  iframe.title = "YouTube video player";

  card.appendChild(iframe);
  return card;
}


// ① music.html（全曲表示）
async function loadAllPlaylistVideos() {
  const gallery = document.getElementById("music-gallery");
  if (!gallery) return;

  const allItems = await fetchAllPlaylistItems();
  if (allItems.length === 0) {
    console.warn("music-gallery: 動画を取得できませんでした");
    return;
  }

  gallery.innerHTML = "";

  allItems.forEach((item) => {
    const videoId = item.snippet?.resourceId?.videoId;
    if (!videoId) return;

    const card = createVideoCard(videoId);
    gallery.appendChild(card);
  });
}


// ② index.html（最新2曲表示）
async function loadTopTwoVideos() {
  const section = document.getElementById("top-latest");
  if (!section) return;

  const buttonRow = section.querySelector(".button-row");

  const allItems = await fetchAllPlaylistItems();
  if (allItems.length === 0) {
    console.warn("top-latest: 動画を取得できませんでした");
    return;
  }

  // 公開日が新しい順
  const sorted = [...allItems].sort(
    (a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
  );

  const latestTwo = sorted.slice(0, 2);

  // 既存の動画削除
  section.querySelectorAll(".video-card").forEach((el) => el.remove());

  latestTwo.forEach((item) => {
    const videoId = item.snippet?.resourceId?.videoId;
    if (!videoId) return;

    const card = createVideoCard(videoId);

    if (buttonRow) {
      section.insertBefore(card, buttonRow);
    } else {
      section.appendChild(card);
    }
  });
}


// フェードイン
function setupFadeIn() {
  const faders = document.querySelectorAll(".fade-in");

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("appear");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.1,
  });

  faders.forEach((fader) => obs.observe(fader));
}


// 読み込み時実行
document.addEventListener("DOMContentLoaded", async () => {
  setupFadeIn();

  await loadAllPlaylistVideos();
  await loadTopTwoVideos();
});
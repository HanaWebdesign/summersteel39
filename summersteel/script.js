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

      if (pageToken) params.set("pageToken", pageToken);

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      if (Array.isArray(data.items)) allItems.push(...data.items);

      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }
  } catch (e) {
    console.error(e);
    return [];
  }

  return allItems;
}


// ① music.html（全曲表示）
async function loadAllPlaylistVideos() {
  const gallery = document.getElementById("music-gallery");
  if (!gallery) return;

  const allItems = await fetchAllPlaylistItems();
  if (allItems.length === 0) return;

  gallery.innerHTML = "";

  allItems.forEach(item => {
    const videoId = item.snippet.resourceId?.videoId;
    if (!videoId) return;

    const wrap = document.createElement("div");
    wrap.className = "video";

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";

    wrap.appendChild(iframe);
    gallery.appendChild(wrap);
  });
}


// ② index.html（最新2曲表示）
async function loadTopTwoVideos() {
  const section = document.getElementById("top-latest");
  if (!section) return;

  const link = section.querySelector(".more-button");

  const allItems = await fetchAllPlaylistItems();
  if (allItems.length === 0) return;

  // ★ 公開日が新しい順に並べ替え
  const sorted = [...allItems].sort((a, b) =>
    new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
  );

  const latestTwo = sorted.slice(0, 2);

  // 既存の動画削除
  section.querySelectorAll(".video-card").forEach(e => e.remove());

  latestTwo.forEach(item => {
    const videoId = item.snippet.resourceId?.videoId;
    if (!videoId) return;

    const card = document.createElement("div");
    card.className = "video-card";

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";

    card.appendChild(iframe);

    section.insertBefore(card, link);
  });
}


// フェードイン
function setupFadeIn() {
  const faders = document.querySelectorAll(".fade-in");
  const obs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("appear");
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  faders.forEach(f => obs.observe(f));
}


// 読み込み時実行
document.addEventListener("DOMContentLoaded", () => {
  loadAllPlaylistVideos();
  loadTopTwoVideos();
  setupFadeIn();
});

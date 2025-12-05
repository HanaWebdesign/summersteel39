// ▼▼▼ ここを自分の値に書き換えてね ▼▼▼
const API_KEY = "AIzaSyD7iHybNfXwiBC_jjh-THvjxjugqe7uOSM";
const PLAYLIST_ID = "PL_23ESG8aDXWqpTywyPxRP0zAvBmHcq3C";
// ▲▲▲ ここまで書き換え ▲▲▲


// 1回のリクエストで取る最大件数（YouTubeの上限は50）
const MAX_RESULTS_PER_PAGE = 50;


// =======================================
// ① music.html → プレイリスト全曲を表示
// =======================================
async function loadAllPlaylistVideos() {
  const gallery = document.getElementById("music-gallery");
  if (!gallery) return;

  gallery.innerHTML = "";

  let allItems = [];
  let pageToken = null;

  try {
    while (true) {
      const params = new URLSearchParams({
        part: "snippet",
        maxResults: MAX_RESULTS_PER_PAGE.toString(),
        playlistId: PLAYLIST_ID,
        key: API_KEY,
      });
      if (pageToken) params.set("pageToken", pageToken);

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error("YouTube API error:", await res.text());
        gallery.innerHTML = "<p class='music-error'>楽曲一覧の読み込みに失敗しました。</p>";
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.items)) allItems = allItems.concat(data.items);

      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }

    if (allItems.length === 0) {
      gallery.innerHTML = "<p class='music-error'>楽曲が見つかりませんでした。</p>";
      return;
    }

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

  } catch (err) {
    console.error("loadAllPlaylistVideos error:", err);
    gallery.innerHTML = "<p class='music-error'>ネットワークエラーが発生しました。</p>";
  }
}


// =======================================
// ② index.html → 最新2曲だけ表示
// =======================================
async function loadTopTwoVideos() {
  const section = document.getElementById("top-latest");
  if (!section) return;

  const link = section.querySelector(".more-button");

  try {
    const params = new URLSearchParams({
      part: "snippet",
      maxResults: "50",
      playlistId: PLAYLIST_ID,
      key: API_KEY,
    });

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error("YouTube API (top) error:", await res.text());
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data.items)) return;

    // 公開日の新しい順に並び替え
    const sorted = [...data.items].sort((a, b) => {
      return new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt);
    });

    const latestTwo = sorted.slice(0, 2);

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

  } catch (err) {
    console.error("loadTopTwoVideos error:", err);
  }
}


// =======================================
// 共通：フェードイン
// =======================================
function setupFadeIn() {
  const faders = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("appear");
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  faders.forEach(f => observer.observe(f));
}


// =======================================
// ページ読み込み後に実行
// =======================================
document.addEventListener("DOMContentLoaded", () => {
  loadAllPlaylistVideos(); // music.html
  loadTopTwoVideos();      // index.html
  setupFadeIn();
});

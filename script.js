// ▼▼▼ 自分の値に書き換え済み ▼▼▼
const API_KEY = "AIzaSyD7iHybNfXwiBC_jjh-THvjxjugqe7uOSM";
const PLAYLIST_ID = "PL_23ESG8aDXWqpTywyPxRP0zAvBmHcq3C";
// ▲▲▲ ここはそのままでOK ▲▲▲


// 1回のリクエストで取る最大件数（YouTubeの上限は50）
const MAX_RESULTS_PER_PAGE = 50;

// 共通：プレイリストの全動画を取得する関数
async function fetchAllPlaylistItems() {
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
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error("YouTube API error:", await res.text());
        return [];
      }

      const data = await res.json();
      if (Array.isArray(data.items)) {
        allItems = allItems.concat(data.items);
      }

      if (!data.nextPageToken) {
        break;
      }
      pageToken = data.nextPageToken;
    }
  } catch (err) {
    console.error("fetchAllPlaylistItems error:", err);
    return [];
  }

  return allItems;
}

// ② index.html 用：公開日の新しい順に最新2曲だけ表示
async function loadTopTwoVideos() {
  const section = document.getElementById("top-latest");
  if (!section) return; // index.html 以外では何もしない

  const link = section.querySelector(".more-button");

  try {
    // プレイリスト全件を取る
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

    // 🔥 公開日の新しい順に並べ替え
    const sorted = data.items.sort((a, b) => {
      return new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt);
    });

    // 🔥 最新2曲だけ取り出し
    const latestTwo = sorted.slice(0, 2);

    // 既存の表示（たぶん何もないけど）を消す
    section.querySelectorAll(".video-card").forEach(n => n.remove());

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

      // Full Collectionリンクの直前に挿入
      section.insertBefore(card, link);
    });

  } catch (err) {
    console.error("loadTopTwoVideos error:", err);
  }
}


// ② index.html 用：公開日の新しい順に最新2曲だけ表示
async function loadTopTwoVideos() {
  const section = document.getElementById("top-latest");
  if (!section) return; // index.html 以外では何もしない

  const link = section.querySelector(".more-button");

  const allItems = await fetchAllPlaylistItems();
  if (allItems.length === 0) {
    return;
  }

  // 公開日の新しい順にソート
  const sorted = [...allItems].sort((a, b) => {
    const da = new Date(a.snippet.publishedAt);
    const db = new Date(b.snippet.publishedAt);
    return db - da; // 新しいほうを先に
  });

  const latestTwo = sorted.slice(0, 2);

  latestTwo.forEach(item => {
    const snippet = item.snippet;
    const videoId = snippet.resourceId && snippet.resourceId.videoId;
    if (!videoId) return;

    const card = document.createElement("div");
    card.className = "video-card";

    const iframe = document.createElement("iframe");
    iframe.setAttribute("allowfullscreen", "");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.loading = "lazy";

    card.appendChild(iframe);

    if (link) {
      section.insertBefore(card, link);
    } else {
      section.appendChild(card);
    }
  });
}

// フェードイン（そのまま）
function setupFadeIn() {
  const faders = document.querySelectorAll(".fade-in");
  const options = { threshold: 0.1 };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("appear");
      observer.unobserve(entry.target);
    });
  }, options);

  faders.forEach(fader => {
    observer.observe(fader);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadAllPlaylistVideos(); // music.html にいたら動く
  loadTopTwoVideos();      // index.html にいたら動く
  setupFadeIn();
});

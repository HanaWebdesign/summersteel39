// ▼▼▼ ここを自分の値に書き換えてね ▼▼▼
// ※ 必ず "ダブルクォーテーション" で囲むこと！
const API_KEY = "AIzaSyD7iHybNfXwiBC_jjh-THvjxjugqe7uOSM";
const PLAYLIST_ID = "PL_23ESG8aDXWqpTywyPxRP0zAvBmHcq3C&index=2"; // PL_ から始まるやつ
// ▲▲▲ ここまで書き換え ▲▲▲


// 1回のリクエストで取る最大件数（YouTubeの上限は50）
const MAX_RESULTS_PER_PAGE = 50;

// プレイリストの全動画を全部取ってきてから表示する
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
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error("YouTube API error:", await res.text());
        gallery.innerHTML = "<p class=\"music-error\">楽曲一覧の読み込みに失敗しました。</p>";
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.items)) {
        allItems = allItems.concat(data.items);
      }

      // 次のページがないならループ終了
      if (!data.nextPageToken) {
        break;
      }
      pageToken = data.nextPageToken;
    }

    if (allItems.length === 0) {
      gallery.innerHTML = "<p class=\"music-error\">楽曲が見つかりませんでした。</p>";
      return;
    }

    // ここで全部の動画を表示
    allItems.forEach(item => {
      const snippet = item.snippet;
      const videoId = snippet.resourceId?.videoId;
      if (!videoId) return;

      const wrapper = document.createElement("div");
      wrapper.className = "video";

      const iframe = document.createElement("iframe");
      iframe.setAttribute("allowfullscreen", "");
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.loading = "lazy";

      wrapper.appendChild(iframe);
      gallery.appendChild(wrapper);
    });
  } catch (err) {
    console.error("loadAllPlaylistVideos error:", err);
    gallery.innerHTML = "<p class=\"music-error\">ネットワークエラーが発生しました。</p>";
  }
}

// フェードイン（元からあったやつ）
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
  loadAllPlaylistVideos();
  setupFadeIn();
});


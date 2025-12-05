// 表示するYouTube動画のリスト
// ★新曲が出たら、この配列に { id: "動画ID" } を1行追加するだけ★
const musicVideos = [
  { id: "6sy40Nt62Qg" },
  { id: "4XapiQNR9hE" },
  { id: "iEIXish0N4Q" },
  { id: "SxHvLZ3qPK0" },
  { id: "CJDA2jX40hA" },
  { id: "cecapTEnZbs" },
  { id: "uO9K0GlkIDg" },
  { id: "MPrVORDlBuc" },
  { id: "DhydFHrB1vI" },
  { id: "1R2tLcBnBS4" }
];

document.addEventListener('DOMContentLoaded', () => {
  // ① Musicページ用：動画を自動で追加
  const gallery = document.getElementById('music-gallery');
  if (gallery) {
    musicVideos.forEach(video => {
      const wrapper = document.createElement('div');
      wrapper.className = 'video';

      const iframe = document.createElement('iframe');
      iframe.setAttribute('allowfullscreen', '');
      iframe.src = `https://www.youtube.com/embed/${video.id}`;

      wrapper.appendChild(iframe);
      gallery.appendChild(wrapper);
    });
  }

  // ② 共通のフェードイン処理
  const faders = document.querySelectorAll('.fade-in');

  const options = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('appear');
      observer.unobserve(entry.target);
    });
  }, options);

  faders.forEach(fader => {
    observer.observe(fader);
  });
});

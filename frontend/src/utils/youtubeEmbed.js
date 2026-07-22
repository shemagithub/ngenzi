/**
 * Resolve a stored or pasted YouTube URL to an embeddable src (for iframes).
 * Handles watch URLs, youtu.be, /shorts/, and existing /embed/ URLs.
 */
export function getYoutubeEmbedSrc(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  if (/youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/i.test(s)) return s.split(/[?#]/)[0];
  let m = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = s.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return null;
}

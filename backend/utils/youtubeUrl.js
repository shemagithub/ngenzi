/**
 * Coerce multipart / JSON body values (string | string[] | number) to a clean string.
 */
export function readYoutubeInput(value) {
    if (value === undefined || value === null) return '';
    let s = value;
    if (Array.isArray(s)) {
        s = s.find((x) => x != null && String(x).trim() !== '') ?? s[0];
    }
    if (s === undefined || s === null) return '';
    return String(s)
        .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
        .trim();
}

function tryUnwrapGoogleRedirect(input) {
    const s = readYoutubeInput(input);
    if (!s || !/google\.com\/url/i.test(s)) return s;
    try {
        const href = s.startsWith('http') ? s : `https://${s}`;
        const u = new URL(href);
        const q = u.searchParams.get('q') || u.searchParams.get('url');
        if (q) return decodeURIComponent(q);
    } catch {
        /* ignore */
    }
    return s;
}

function extractYoutubeVideoId(urlString) {
    if (!urlString) return null;
    let url = urlString.trim();

    const iframeSrc = url.match(/src\s*=\s*["']([^"']+)["']/i);
    if (iframeSrc && /youtube|youtu\.be/i.test(iframeSrc[1])) {
        url = iframeSrc[1].trim();
    }

    url = tryUnwrapGoogleRedirect(url);

    /** Prefer URL API for watch links with extra params (&list=, &index=, etc.) */
    try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`);
        const host = u.hostname.replace(/^www\./i, '').toLowerCase();
        if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
            const v = u.searchParams.get('v');
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v.trim())) return v.trim();
        }
        if (host === 'youtu.be') {
            const seg = u.pathname.replace(/^\//, '').split('/')[0];
            if (seg && /^[a-zA-Z0-9_-]{11}$/.test(seg)) return seg;
        }
    } catch {
        /* fall through to regex */
    }

    let id = null;
    const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
    if (embed) id = embed[1];
    if (!id) {
        const nocookie = url.match(/youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
        if (nocookie) id = nocookie[1];
    }
    if (!id) {
        const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
        if (watch) id = watch[1];
    }
    if (!id) {
        const shortU = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
        if (shortU) id = shortU[1];
    }
    if (!id) {
        const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
        if (shorts) id = shorts[1];
    }
    if (!id) {
        const vPath = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:[/?#]|$)/i);
        if (vPath) id = vPath[1];
    }
    if (!id) {
        const live = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:[/?#]|$)/i);
        if (live) id = live[1];
    }
    return id;
}

/**
 * Accept watch / shorts / youtu.be / embed / iframe HTML / nocookie /v/ /live/.
 * Returns canonical https://www.youtube.com/embed/{id} or null.
 */
export function normalizeYoutubeUrl(raw) {
    const id = extractYoutubeVideoId(readYoutubeInput(raw));
    if (id) return `https://www.youtube.com/embed/${id}`;
    return null;
}

/**
 * Normalize a form field name so youtube_url, YoutubeUrl, YOUTUBEURL all match.
 */
function normalizeBodyKey(k) {
    return String(k).toLowerCase().replace(/_/g, '');
}

/**
 * True if the request URL includes ?youtubeUrl=… (even empty, to clear). Survives broken multipart.
 */
export function hasYoutubeUrlQuery(req) {
    const q = req.query;
    if (!q || typeof q !== 'object') return false;
    return Object.keys(q).some((k) => normalizeBodyKey(k) === 'youtubeurl');
}

function pickYoutubeFromObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return { value: '', hasKey: false };
    }
    const keys = Object.keys(obj);
    const exact = keys.find((k) => normalizeBodyKey(k) === 'youtubeurl');
    if (exact !== undefined) {
        return { value: readYoutubeInput(obj[exact]), hasKey: true };
    }
    const fuzzy = keys.find((k) => /youtube/i.test(k) && /url/i.test(k));
    if (fuzzy !== undefined) {
        return { value: readYoutubeInput(obj[fuzzy]), hasKey: true };
    }
    return { value: '', hasKey: false };
}

/**
 * Read youtubeUrl from multipart body and query string, then optional headers.
 * If body has an empty value but query has the URL (common when multipart text is corrupted), the query wins.
 */
export function resolveYoutubeRawFromRequest(req, headerNames = []) {
    const bodyPick = pickYoutubeFromObject(req.body);
    const queryPick = pickYoutubeFromObject(req.query);

    if (bodyPick.value) return bodyPick.value;
    if (queryPick.value) return queryPick.value;
    if (bodyPick.hasKey) return bodyPick.value;
    if (queryPick.hasKey) return queryPick.value;

    for (const h of headerNames) {
        const raw = req.get(h);
        if (raw != null && String(raw).trim() !== '') return readYoutubeInput(raw);
    }

    const fromOriginal = parseYoutubeQueryFromOriginalUrl(req);
    if (fromOriginal) return readYoutubeInput(fromOriginal);

    const fromAnyField = collectYoutubeLikeStringFromBody(req.body);
    if (fromAnyField) return fromAnyField;

    return '';
}

/**
 * Last resort: some clients send the link under a different field name.
 * Scan every multipart value for an http(s) string containing youtube.com or youtu.be
 */
function collectYoutubeLikeStringFromBody(body) {
    if (!body || typeof body !== 'object') return '';
    for (const k of Object.keys(body)) {
        const val = readYoutubeInput(body[k]);
        if (!val || val.length < 12) continue;
        if (!/^https?:\/\//i.test(val)) continue;
        if (!/(?:youtube\.com|youtu\.be)/i.test(val)) continue;
        return val;
    }
    return '';
}

/**
 * When req.query is empty/incomplete (reverse proxies, long URLs), the full query may still be on originalUrl.
 */
export function parseYoutubeQueryFromOriginalUrl(req) {
    try {
        const raw = req.originalUrl || req.url || '';
        const qIndex = raw.indexOf('?');
        if (qIndex === -1) return '';
        const qs = raw.slice(qIndex + 1);
        const sp = new URLSearchParams(qs);
        const v =
            sp.get('youtubeUrl') ||
            sp.get('youtubeurl') ||
            sp.get('youtube_url');
        return v || '';
    } catch {
        return '';
    }
}

/**
 * Prefer canonical embed URL; otherwise store the user's pasted URL as plain text (still works for embed logic that reads v= / youtu.be).
 * Max length matches DB column (TEXT / VARCHAR).
 */
export function persistYoutubeForDb(rawInput) {
    const raw = readYoutubeInput(rawInput);
    if (!raw) return null;
    const norm = normalizeYoutubeUrl(raw);
    if (norm) return norm;
    let s = raw.trim();
    if (!s) return null;
    // Allow paste without scheme: www.youtube.com/...
    if (!/^https?:\/\//i.test(s) && /(?:youtube\.com|youtu\.be)/i.test(s)) {
        s = `https://${s.replace(/^\/+/, '')}`;
    }
    const maxLen = 2048;
    if (s.length > maxLen) s = s.slice(0, maxLen);
    if (/(?:youtube\.com|youtu\.be)/i.test(s) && /^https?:\/\//i.test(s)) {
        return s;
    }
    return null;
}

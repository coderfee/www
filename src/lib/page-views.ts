const REPORT_PATH = '/api/blog/page-views';
const IGNORED_PATH_PREFIXES = ['/api/', '/assets/', '/_astro/', '/icons/', '/shortcuts/', '/styles/', '/screenshots/'];
const IGNORED_PATH_SUFFIXES = [
  '.xml',
  '.webmanifest',
  '.txt',
  '.json',
  '.js',
  '.mjs',
  '.css',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
];

export function shouldReportPath(pathname: string) {
  return (
    !IGNORED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !IGNORED_PATH_SUFFIXES.some((suffix) => pathname.endsWith(suffix))
  );
}

export function reportPageView() {
  const { pathname } = window.location;
  if (!shouldReportPath(pathname)) return;

  const payload = JSON.stringify({ path: pathname, title: document.title });

  if (navigator.sendBeacon?.(REPORT_PATH, new Blob([payload], { type: 'application/json' }))) {
    return;
  }

  fetch(REPORT_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

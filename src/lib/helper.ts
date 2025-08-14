export const getHref = () => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const hostname = url.hostname.replace(/^(dev\.|local\.)/, '');
  return `https://${hostname}${url.pathname}`.replace(/\/$/, '');
};

export function copyTextToClipboard(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!navigator.clipboard) {
      resolve(fallbackCopyTextToClipboard(text));
    }
    resolve(navigator.clipboard.writeText(text));
  });
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

export function base64Decode(str: string): string {
  if (typeof window === 'undefined') return str;
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(''),
  );
}

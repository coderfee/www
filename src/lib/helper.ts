export function base64Decode(str: string): string {
  if (typeof window === 'undefined') return str;
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(''),
  );
}

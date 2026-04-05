const COOKIE_NAME = 'speechEnabled';

function _isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth <= 480);
}

export function getSpeechPreference(): boolean {
  const cookie = document.cookie.split('; ').find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (cookie) return cookie.split('=')[1] === '1';
  return _isMobile(); // Default enabled on mobile
}

export function setSpeechPreference(enabled: boolean): void {
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${COOKIE_NAME}=${enabled ? '1' : '0'}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * Prakarti Report — Site Configuration (Committed, Public Configuration)
 * Holds public deployment URLs and endpoints. Contains NO secret keys.
 */
(function () {
  const PROD = 'https://pollution-detection-user.vercel.app';
  const LOCAL_USER_APP_URL = ''; // e.g. 'http://localhost:5173' if the citizen app is run locally; empty means "use PROD"

  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
  const protocol = (typeof window !== 'undefined' && window.location && window.location.protocol) || '';

  const isLocal =
    protocol === 'file:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname.endsWith('.local');

  window.EARTHFORWARD_SITE = {
    ENV: isLocal ? 'local' : 'production',
    USER_APP_URL: (isLocal && LOCAL_USER_APP_URL) ? LOCAL_USER_APP_URL : PROD
  };
})();

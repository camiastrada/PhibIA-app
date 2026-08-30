export function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

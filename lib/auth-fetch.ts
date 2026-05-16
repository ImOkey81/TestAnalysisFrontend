export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const tokenCookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('access_token='))
  const token = tokenCookie ? tokenCookie.split('=')[1].trim() : null

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(url, { ...options, credentials: 'include', headers })
}

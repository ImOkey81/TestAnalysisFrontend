// Server-only helpers for driving the authentik flow executor via a cookie jar

export const AUTHENTIK_BASE = 'http://localhost:9000'
export const AUTH_FLOW_URL = `${AUTHENTIK_BASE}/api/v3/flows/executor/default-authentication-flow/?query=`
export const ENROLL_FLOW_URL = `${AUTHENTIK_BASE}/api/v3/flows/executor/default-enrollment-flow/?query=`
export const ME_URL = `${AUTHENTIK_BASE}/api/v3/core/users/me/`

export function getSetCookies(response: Response): string[] {
  if (typeof (response.headers as any).getSetCookie === 'function') {
    return (response.headers as any).getSetCookie()
  }
  const raw = response.headers.get('set-cookie')
  if (!raw) return []
  return raw.split(/,(?=[^ ])/)
}

export function mergeJar(jar: Map<string, string>, response: Response): Map<string, string> {
  const next = new Map(jar)
  for (const header of getSetCookies(response)) {
    const [nameValue] = header.split(';')
    const eqIdx = nameValue.indexOf('=')
    if (eqIdx > 0) {
      next.set(nameValue.slice(0, eqIdx).trim(), nameValue.slice(eqIdx + 1).trim())
    }
  }
  return next
}

export function jarToHeader(jar: Map<string, string>): string {
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

export function extractErrors(
  responseErrors: Record<string, Array<{ string: string }>>,
): string {
  return Object.values(responseErrors)
    .flat()
    .map((e) => e.string)
    .join(', ')
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url, method = 'POST', body } = await req.json()

  const cookieHeader = req.headers.get('cookie') ?? ''

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {}),
  }

  let upstream: Response
  try {
    upstream = await fetch(url, init)
  } catch (err) {
    return NextResponse.json({ error: 'Upstream unreachable' }, { status: 502 })
  }

  const data = await upstream.json()
  const res = NextResponse.json(data, { status: upstream.status })

  // Forward Set-Cookie headers back to the browser.
  // Strip Domain/Secure/SameSite so the browser stores them for localhost:3000.
  const setCookies: string[] =
    typeof (upstream.headers as any).getSetCookie === 'function'
      ? (upstream.headers as any).getSetCookie()
      : (upstream.headers.get('set-cookie') ?? '').split(/,(?=[^ ])/).filter(Boolean)

  for (const cookie of setCookies) {
    const stripped = cookie
      .replace(/;\s*Domain=[^;]*/gi, '')
      .replace(/;\s*Secure/gi, '')
      .replace(/;\s*SameSite=\w+/gi, '')
    res.headers.append('Set-Cookie', stripped)
  }

  return res
}

import { NextRequest, NextResponse } from 'next/server'
import {
  AUTH_FLOW_URL,
  AUTHENTIK_BASE,
  ME_URL,
  mergeJar,
  jarToHeader,
  extractErrors,
} from '@/lib/authentik-flow'

const OAUTH_CLIENT_ID = process.env.AUTHENTIK_CLIENT_ID!
const OAUTH_CLIENT_SECRET = process.env.AUTHENTIK_CLIENT_SECRET!
const TOKEN_URL = `${AUTHENTIK_BASE}/application/o/token/`

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  let jar = new Map<string, string>()

  // Step 1: Initialize flow session
  const initRes = await fetch(AUTH_FLOW_URL, { method: 'GET' })
  jar = mergeJar(jar, initRes)

  // Step 2: Submit username
  const identRes = await fetch(AUTH_FLOW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: jarToHeader(jar) },
    body: JSON.stringify({ component: 'ak-stage-identification', uid_field: username }),
  })
  jar = mergeJar(jar, identRes)
  const identData = await identRes.json()

  if (identData.component !== 'ak-stage-password') {
    const error = identData.response_errors
      ? extractErrors(identData.response_errors)
      : 'Пользователь не найден'
    return NextResponse.json({ success: false, error })
  }

  // Step 3: Submit password
  const passRes = await fetch(AUTH_FLOW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: jarToHeader(jar) },
    body: JSON.stringify({ component: 'ak-stage-password', password }),
  })
  jar = mergeJar(jar, passRes)
  const passData = await passRes.json()

  if (passData.component !== 'xak-flow-redirect') {
    const error = passData.response_errors
      ? extractErrors(passData.response_errors)
      : 'Неверный пароль'
    return NextResponse.json({ success: false, error })
  }

  // Flow succeeded — fetch user info with the established session
  const meRes = await fetch(ME_URL, {
    headers: { Cookie: jarToHeader(jar) },
  })

  if (!meRes.ok) {
    return NextResponse.json({ success: false, error: 'Не удалось получить данные пользователя' })
  }

  const meData = await meRes.json()
  const authentikSession = jar.get('authentik_session') ?? ''

  // Fetch OAuth access token for backend service authorization
  let accessToken: string | null = null
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        scope: 'openid email profile',
      }),
    })
    if (tokenRes.ok) {
      const tokenData = await tokenRes.json()
      accessToken = tokenData.access_token ?? null
    }
  } catch {
    // proceed without access token
  }

  // Authentik may return user nested as data.user or flat; fall back to submitted username
  const rawUser = meData.user ?? meData
  const userData = {
    username: rawUser.username || username,
    email: rawUser.email || '',
    name: rawUser.name || username,
  }

  const response = NextResponse.json({ success: true, user: userData })

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }

  response.cookies.set('auth_token', authentikSession, cookieOpts)
  response.cookies.set('user_info', JSON.stringify(userData), cookieOpts)

  if (accessToken) {
    response.cookies.set('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return response
}

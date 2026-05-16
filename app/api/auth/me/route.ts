import { NextRequest, NextResponse } from 'next/server'
import { ME_URL } from '@/lib/authentik-flow'

export async function GET(req: NextRequest) {
  const authToken = req.cookies.get('auth_token')?.value
  if (!authToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const res = await fetch(ME_URL, {
    headers: { Cookie: `authentik_session=${authToken}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Verify session is valid via Authentik response, then return stored user info
  const data = await res.json()
  const rawUser = data.user ?? data
  const hasUserInfo = rawUser.username || rawUser.email

  const storedInfo = req.cookies.get('user_info')?.value

  if (!hasUserInfo && !storedInfo) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (hasUserInfo) {
    return NextResponse.json({
      username: rawUser.username,
      email: rawUser.email,
      name: rawUser.name,
    })
  }

  return NextResponse.json(JSON.parse(storedInfo!))
}

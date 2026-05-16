import { NextRequest, NextResponse } from 'next/server'
import { AUTHENTIK_BASE, ENROLL_FLOW_URL, mergeJar, jarToHeader, extractErrors } from '@/lib/authentik-flow'

async function flowPost(url: string, jar: Map<string, string>, body: object) {
  const csrf = jar.get('authentik_csrf') || ''
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': jarToHeader(jar),
      ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      'Referer': `${AUTHENTIK_BASE}/`,
      'Origin': AUTHENTIK_BASE,
    },
    body: JSON.stringify(body),
  })
  return res
}

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, password_repeat } = await req.json()

    // Never reuse the browser session — a completed enrollment session causes
    // ak-stage-access-denied on any subsequent enrollment attempt.
    let jar = new Map<string, string>()

    const initRes = await fetch(ENROLL_FLOW_URL, {
      method: 'GET',
      headers: { 'Referer': `${AUTHENTIK_BASE}/` },
    })
    jar = mergeJar(jar, initRes)
    let stageData = await initRes.json()
    console.log('[INIT]', stageData.component, stageData.fields?.map((f: { field_key: string }) => f.field_key))

    // All values we can fill; name mirrors username since the form has no separate name field.
    const values: Record<string, string> = { name: username, username, email, password, password_repeat }

    const submittedFieldSets = new Set<string>()

    for (let step = 1; step <= 5; step++) {
      if (stageData.component === 'xak-flow-redirect') {
        return NextResponse.json({ success: true })
      }

      if (stageData.component !== 'ak-stage-prompt') {
        return NextResponse.json({ success: false, error: 'Unexpected stage: ' + stageData.component })
      }

      const fields: Array<{ field_key: string }> = stageData.fields ?? []
      const fieldSetKey = fields.map(f => f.field_key).sort().join(',')

      // If we've already submitted this exact field set, the enrollment stages are
      // done and the flow is showing a post-enrollment login prompt — stop here.
      if (submittedFieldSets.has(fieldSetKey)) {
        return NextResponse.json({ success: true })
      }
      submittedFieldSets.add(fieldSetKey)

      const submission: Record<string, string> = { component: 'ak-stage-prompt' }
      for (const { field_key } of fields) {
        if (values[field_key] !== undefined) submission[field_key] = values[field_key]
      }

      console.log(`[STEP${step}] submitting`, Object.keys(submission).filter(k => k !== 'component'))

      const res = await flowPost(ENROLL_FLOW_URL, jar, submission)
      jar = mergeJar(jar, res)
      stageData = await res.json()

      console.log(`[STEP${step} response]`, stageData.component, stageData.response_errors ?? null)

      if (stageData.response_errors && Object.keys(stageData.response_errors).length > 0) {
        return NextResponse.json({ success: false, error: extractErrors(stageData.response_errors) })
      }
    }

    return NextResponse.json({ success: false, error: 'Flow did not complete after 5 steps' })
  } catch (e) {
    console.error('[REGISTER]', e)
    return NextResponse.json({ success: false, error: String(e) })
  }
}

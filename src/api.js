/**
 * AlphaWeb API service layer.
 * All backend calls go through here.
 */

const API_BASE = 'http://localhost:8000'

// ── Website Scanner ──────────────────────────────────────────────────────────

export async function createScan(target, request) {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, request }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || JSON.stringify(err))
  }
  return res.json()
}

export async function getScan(scanId) {
  const res = await fetch(`${API_BASE}/api/scan/${scanId}`)
  if (!res.ok) throw new Error(`Scan fetch failed: ${res.statusText}`)
  return res.json()
}

export async function getScanWorkflow(scanId) {
  const res = await fetch(`${API_BASE}/api/scan/${scanId}/workflow`)
  if (!res.ok) throw new Error(`Workflow fetch failed: ${res.statusText}`)
  return res.json()
}

export async function listScans(page = 1, limit = 10) {
  const res = await fetch(`${API_BASE}/api/scans?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error(`Scans list failed: ${res.statusText}`)
  return res.json()
}

// ── Code Analyzer ────────────────────────────────────────────────────────────

export async function analyzeCode(code, language = null, filename = null, scanType = 'full') {
  const res = await fetch(`${API_BASE}/api/analyze-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      language: language || undefined,
      filename: filename || undefined,
      scan_type: scanType,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || JSON.stringify(err))
  }
  return res.json()
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`)
  return res.json()
}

// ── Validation ───────────────────────────────────────────────────────────────

export async function validateScan(target, request) {
  const res = await fetch(`${API_BASE}/api/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, request }),
  })
  if (!res.ok) throw new Error(`Validation failed: ${res.statusText}`)
  return res.json()
}

// ── Polling helper ───────────────────────────────────────────────────────────

export function pollScan(scanId, onUpdate, intervalMs = 2000) {
  let active = true

  async function tick() {
    if (!active) return
    try {
      const data = await getScan(scanId)
      onUpdate(data)
      if (data.status === 'completed' || data.status === 'failed' || data.status === 'timeout') {
        active = false
        return
      }
    } catch (err) {
      console.error('Poll error:', err)
    }
    if (active) setTimeout(tick, intervalMs)
  }

  tick()
  return () => { active = false }
}

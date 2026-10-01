import { useRef, useSyncExternalStore } from 'react'

// A tiny global store so that ElevenLabs client tools (plain async functions)
// and React components share the same live state without stale closures.

export const STEPS = [
  { id: 'receive', label: 'دریافت تماس', icon: 'phone' },
  { id: 'identify', label: 'شناسایی مشتری', icon: 'user' },
  { id: 'knowledge', label: 'جست‌وجوی دانش', icon: 'book' },
  { id: 'access', label: 'اجازه دسترسی', icon: 'key' },
  { id: 'diagnose', label: 'تشخیص روی سرور', icon: 'terminal' },
  { id: 'sandbox', label: 'آزمایش در Sandbox', icon: 'flask' },
  { id: 'approval', label: 'تأیید ادمین', icon: 'shield' },
  { id: 'apply', label: 'اجرا با پشتیبان', icon: 'bolt' },
  { id: 'resolve', label: 'حل یا ارجاع', icon: 'flag' },
]

const freshSteps = () => Object.fromEntries(STEPS.map((s) => [s.id, 'idle']))

export const initialCase = () => ({
  call: 'idle', // idle | connecting | active | ended
  startedAt: null,
  endedAt: null,
  transcript: [],
  steps: freshSteps(),
  logs: [],
  customer: null,
  kbHits: null,
  access: 'none', // none | pending | granted | denied
  finding: null,
  sandbox: null,
  approved: false,
  applied: null,
  ticket: null,
  handoff: null,
  outcome: null, // resolved | escalated | null
  outcomeAt: null,
  newKnowledge: null,
  guardrail: null,
  approval: null, // { kind, title, lines, resolve }
  toolActivity: null,
  speaking: null, // scripted mode only: 'agent' | 'user'
  error: null,
})

let state = {
  page: 'intro',
  mode: 'live', // live | scripted
  scenario: 'workflow',
  agentId: readAgentId(),
  ...initialCase(),
  history: [], // tickets created during this session (shown in dashboard)
}

function readAgentId() {
  try {
    const saved = localStorage.getItem('yara.agentId')
    if (saved) return saved
  } catch {}
  return import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''
}

const listeners = new Set()

export const getState = () => state

export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function subscribe(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function shallowEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false
  const ka = Object.keys(a)
  if (ka.length !== Object.keys(b).length) return false
  return ka.every((k) => Object.is(a[k], b[k]))
}

// Selector results are shallow-compared so selectors may return new objects.
export function useStore(selector = (s) => s) {
  const cache = useRef(undefined)
  const getSnapshot = () => {
    const next = selector(state)
    if (cache.current !== undefined && shallowEqual(cache.current, next)) return cache.current
    cache.current = next
    return next
  }
  return useSyncExternalStore(subscribe, getSnapshot)
}

// ---------- helpers used by tools / script ----------

export const now = () => Date.now()

export function setStep(id, status) {
  setState((s) => ({ steps: { ...s.steps, [id]: status } }))
}

export function addLog(text, level = 'info') {
  setState((s) => ({ logs: [...s.logs, { id: s.logs.length + 1 + Math.random(), t: now(), text, level }] }))
}

export function addMessage(role, text) {
  if (!text) return
  setState((s) => ({ transcript: [...s.transcript, { id: now() + Math.random(), role, text }] }))
}

export function setActivity(text) {
  setState({ toolActivity: text })
}

export function resetCase() {
  const { approval } = state
  if (approval?.resolve) approval.resolve(false)
  setState({ ...initialCase() })
}

export function askApproval({ kind, title, lines }) {
  return new Promise((resolve) => {
    setState({
      approval: {
        kind,
        title,
        lines,
        resolve: (ok) => {
          setState({ approval: null })
          resolve(ok)
        },
      },
    })
  })
}

export function setAgentId(id) {
  try {
    localStorage.setItem('yara.agentId', id)
  } catch {}
  setState({ agentId: id })
}

import {
  getState,
  setState,
  setStep,
  addLog,
  askApproval,
  setActivity,
  now,
} from './store'
import { CUSTOMER, KB, SCENARIOS, FIX_INDEX } from './mockData'

// These functions are registered as ElevenLabs "client tools".
// Tool + parameter names must match the agent config exactly (see AGENT_SETUP.md).
// Safety rules (access before diagnosis, sandbox + approval before any change)
// are enforced HERE in code — not only in the prompt.

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function streamLogs(lines, gap = 260) {
  for (const [level, text] of lines) {
    addLog(text, level)
    await wait(gap + Math.random() * 120)
  }
}

function guardrail(message) {
  setState({ guardrail: { message, t: now() } })
  addLog(`GUARDRAIL · ${message}`, 'guard')
  return JSON.stringify({ ok: false, blocked_by_guardrail: true, reason: message })
}

function markActive(step) {
  setState((s) => {
    const steps = { ...s.steps }
    if (steps.receive === 'idle' || steps.receive === 'active') steps.receive = 'done'
    steps[step] = 'active'
    return { steps }
  })
}

function scenarioFromArea(area) {
  return SCENARIOS[area] || SCENARIOS.other
}

export const tools = {
  async identify_customer({ organization_name } = {}) {
    markActive('identify')
    setActivity('شناسایی مشتری در CRM…')
    addLog(`$ crm lookup --org "${organization_name || CUSTOMER.org}"`)
    await wait(900)
    addLog(`found · ${CUSTOMER.version} · ${CUSTOMER.server}`, 'ok')
    setState({ customer: CUSTOMER })
    setStep('identify', 'done')
    setActivity(null)
    return JSON.stringify({
      organization: CUSTOMER.org,
      admin: CUSTOMER.admin,
      product_version: CUSTOMER.version,
      server: CUSTOMER.server,
      support_contract: CUSTOMER.contract,
      last_update: CUSTOMER.lastUpdate,
    })
  },

  async search_knowledge_base({ query = '', category = 'other' } = {}) {
    markActive('knowledge')
    setActivity('جست‌وجو در مستندات، ویدئوها و تیکت‌های حل‌شده…')
    addLog(`$ kb search "${query}" --category ${category}`)
    await wait(1100)
    const hits = KB.filter((k) => k.category === category)
    setState({ kbHits: { query, items: hits } })
    addLog(hits.length ? `${hits.length} related article(s): ${hits.map((h) => h.id).join(', ')}` : 'no direct match', hits.length ? 'ok' : 'warn')
    setStep('knowledge', 'done')
    setActivity(null)
    return JSON.stringify({
      results: hits.map((h) => ({ id: h.id, title: h.title, summary: h.summary, times_solved: h.solvedCount })),
      note: hits.length
        ? 'Related articles found, but the exact cause must be confirmed on the customer server.'
        : 'No matching article. Server diagnostics recommended.',
    })
  },

  async request_server_access({ reason = 'بررسی لاگ‌ها و تنظیمات' } = {}) {
    markActive('access')
    setState({ access: 'pending' })
    setActivity('در انتظار اجازه ادمین مشتری…')
    addLog('access request sent to customer admin · mode=read-only · ttl=30m', 'info')
    const ok = await askApproval({
      kind: 'access',
      title: 'YARA درخواست دسترسی فقط‌خواندنی دارد',
      lines: [
        `دلیل: ${reason}`,
        'سطح دسترسی: فقط خواندن (لاگ، تنظیمات، کوئری بدون تغییر)',
        'مدت: ۳۰ دقیقه — همه اقدامات در لاگ ممیزی ثبت می‌شوند',
      ],
    })
    setActivity(null)
    setState({ access: ok ? 'granted' : 'denied' })
    setStep('access', ok ? 'done' : 'failed')
    addLog(ok ? 'access GRANTED by admin' : 'access DENIED by admin', ok ? 'ok' : 'error')
    return JSON.stringify(
      ok
        ? { granted: true, mode: 'read-only', expires_in_minutes: 30 }
        : { granted: false, note: 'Admin denied access. Offer to create a ticket for a human expert instead.' },
    )
  },

  async run_diagnostics({ area = 'other' } = {}) {
    if (getState().access !== 'granted') {
      return guardrail('تشخیص روی سرور بدون اجازه ادمین ممکن نیست.')
    }
    const sc = scenarioFromArea(area)
    markActive('diagnose')
    setState({ scenario: sc.id })
    setActivity('اجرای چک‌لیست تشخیصی روی سرور مشتری…')
    await streamLogs(sc.logs)
    setState({ finding: { ...sc.finding, type: sc.type, level: sc.level, fix: sc.fix } })
    setStep('diagnose', 'done')
    if (sc.type === 'bug') {
      setStep('sandbox', 'done') // reproduced in sandbox
      setState({ sandbox: { ok: false, reproduced: true, text: 'خطا در Sandbox بازتولید شد (نسخه 8.2.1 خطا می‌دهد، 8.2.0 سالم است).' } })
      setStep('approval', 'skipped')
      setStep('apply', 'skipped')
    }
    setActivity(null)
    return JSON.stringify({
      root_cause: sc.finding.cause,
      impact: sc.finding.impact,
      confidence: sc.finding.confidence / 100,
      classification: sc.type === 'bug' ? 'product_bug' : sc.type === 'fix' ? 'fixable_on_customer_server' : 'unknown',
      recommended_fix_id: sc.fix?.id || null,
      recommended_fix: sc.fix?.title || null,
      workaround: sc.finding.workaround || null,
      next_step:
        sc.type === 'fix'
          ? 'Explain the cause, then call test_fix_in_sandbox with recommended_fix_id.'
          : sc.type === 'bug'
            ? 'Explain it is a product bug, give the workaround, then call create_ticket.'
            : 'Cause unclear. Call create_ticket or transfer_to_human.',
    })
  },

  async test_fix_in_sandbox({ fix_id } = {}) {
    const sc = FIX_INDEX[fix_id]
    if (!sc) return JSON.stringify({ ok: false, error: `unknown fix_id: ${fix_id}` })
    if (getState().access !== 'granted') return guardrail('بدون اجازه دسترسی، Sandbox ساخته نمی‌شود.')
    markActive('sandbox')
    setActivity('ساخت کپی ایزوله و آزمایش اصلاح…')
    await streamLogs(sc.fix.sandboxLogs, 380)
    setState({ sandbox: { ok: true, fixId: fix_id, text: sc.fix.sandboxResult } })
    setStep('sandbox', 'done')
    setActivity(null)
    return JSON.stringify({ ok: true, fix_id, result: sc.fix.sandboxResult, next_step: 'Ask the admin for approval via request_fix_approval.' })
  },

  async request_fix_approval({ fix_id, explanation = '' } = {}) {
    const sc = FIX_INDEX[fix_id]
    if (!sc) return JSON.stringify({ ok: false, error: `unknown fix_id: ${fix_id}` })
    const sb = getState().sandbox
    if (!sb?.ok || sb.fixId !== fix_id) return guardrail('قبل از درخواست تأیید، اصلاح باید در Sandbox آزمایش شود.')
    markActive('approval')
    setActivity('در انتظار تأیید ادمین برای اعمال تغییر…')
    const ok = await askApproval({
      kind: 'fix',
      title: 'تأیید اعمال اصلاح روی سرور اصلی',
      lines: [
        sc.fix.title,
        `نتیجه Sandbox: ${sc.fix.sandboxResult}`,
        `ریسک: ${sc.fix.risk} · قبل از اجرا پشتیبان گرفته می‌شود و امکان بازگشت وجود دارد`,
        explanation && `توضیح YARA: ${explanation}`,
      ].filter(Boolean),
    })
    setActivity(null)
    setState({ approved: ok ? fix_id : false })
    setStep('approval', ok ? 'done' : 'failed')
    addLog(ok ? `admin APPROVED ${fix_id}` : `admin REJECTED ${fix_id}`, ok ? 'ok' : 'error')
    return JSON.stringify(ok ? { approved: true } : { approved: false, note: 'Do not apply. Offer a ticket for a human expert.' })
  },

  async apply_fix({ fix_id } = {}) {
    const sc = FIX_INDEX[fix_id]
    if (!sc) return JSON.stringify({ ok: false, error: `unknown fix_id: ${fix_id}` })
    const s = getState()
    if (!s.sandbox?.ok || s.sandbox.fixId !== fix_id) return guardrail('اصلاح آزمایش‌نشده در Sandbox اجرا نمی‌شود.')
    if (s.approved !== fix_id) return guardrail('بدون تأیید صریح ادمین هیچ تغییری روی سرور اصلی اعمال نمی‌شود.')
    markActive('apply')
    setActivity('پشتیبان‌گیری، اعمال اصلاح و راستی‌آزمایی…')
    await streamLogs(sc.fix.applyLogs, 420)
    setState({ applied: { fixId: fix_id, text: sc.fix.result } })
    setStep('apply', 'done')
    setActivity(null)
    return JSON.stringify({ ok: true, backup: 'created', verified: true, result: sc.fix.result, next_step: 'Confirm with the customer, then call close_case.' })
  },

  async close_case({ summary = '' } = {}) {
    const s = getState()
    const sc = SCENARIOS[s.scenario]
    markActive('resolve')
    setActivity('ثبت نتیجه و افزودن به پایگاه دانش…')
    await wait(700)
    const kbId = `KB-${300 + Math.floor(Math.random() * 600)}`
    const entry = {
      id: `YRA-${2300 + s.history.length}`,
      org: CUSTOMER.org,
      title: sc?.label || summary || 'درخواست پشتیبانی',
      level: sc?.type === 'bug' ? 'L3' : 'L2',
      status: 'auto',
      time: formatElapsed(now() - (s.startedAt || now())),
      fresh: true,
    }
    setState((st) => ({
      outcome: 'resolved',
      outcomeAt: now(),
      newKnowledge: { id: kbId, title: sc?.finding?.title || summary },
      history: [entry, ...st.history],
    }))
    addLog(`case closed · knowledge article ${kbId} drafted (pending expert review)`, 'ok')
    setStep('resolve', 'done')
    setActivity(null)
    return JSON.stringify({ closed: true, knowledge_article: kbId })
  },

  async create_ticket({ title = '', severity = 'high', summary = '' } = {}) {
    const s = getState()
    const sc = SCENARIOS[s.scenario]
    markActive('resolve')
    setActivity('ساخت تیکت کامل با شواهد…')
    await wait(1000)
    const id = `DEV-${4100 + Math.floor(Math.random() * 800)}`
    const ticket = {
      id,
      title: title || sc?.finding?.title || 'درخواست پشتیبانی',
      severity,
      summary: summary || sc?.finding?.cause,
      org: CUSTOMER.org,
      version: CUSTOMER.version,
      evidence: sc?.finding?.evidence || [],
      repro: sc?.type === 'bug'
        ? ['ایجاد نامه با پیوستی که نام فارسی بالای ۱۲۰ کاراکتر دارد', 'خروجی PDF از نامه', 'مشاهده NullReferenceException در PdfRenderer:412']
        : ['جزئیات در لاگ پیوست‌شده'],
      workaround: sc?.finding?.workaround,
      logsAttached: s.logs.length,
      assignee: 'تیم توسعه ماژول Export',
      sla: '۴ ساعت کاری',
    }
    const entry = {
      id: `YRA-${2300 + s.history.length}`,
      org: CUSTOMER.org,
      title: ticket.title,
      level: 'L3',
      status: 'escalated',
      time: formatElapsed(now() - (s.startedAt || now())),
      fresh: true,
    }
    setState((st) => ({ ticket, outcome: 'escalated', outcomeAt: now(), history: [entry, ...st.history] }))
    addLog(`ticket ${id} created · ${ticket.logsAttached} log lines + repro steps attached → ${ticket.assignee}`, 'ok')
    setStep('resolve', 'done')
    setActivity(null)
    return JSON.stringify({ ticket_id: id, assigned_to: ticket.assignee, sla: ticket.sla })
  },

  async transfer_to_human({ reason = '' } = {}) {
    markActive('resolve')
    setActivity('انتقال به کارشناس انسانی با پرونده کامل…')
    await wait(900)
    setState({ handoff: { reason, t: now() }, outcome: getState().outcome || 'escalated', outcomeAt: now() })
    addLog(`handoff → human expert · context package attached · reason: ${reason}`, 'ok')
    setStep('resolve', 'done')
    setActivity(null)
    return JSON.stringify({ transferred: true, expected_wait_minutes: 3 })
  },
}

export function formatElapsed(ms) {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

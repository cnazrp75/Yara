import { useEffect, useRef } from 'react'
import Icon from './Icon'
import { useStore } from '../engine/store'

function Console() {
  const logs = useStore((s) => s.logs)
  const access = useStore((s) => s.access)
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight })
  }, [logs.length])

  return (
    <div className="card console">
      <div className="card-title">
        <Icon name="terminal" /> کنسول تشخیص روی سرور مشتری
        <span className={`tag access ${access}`}>
          <Icon name="lock" size={12} />
          {access === 'granted' ? 'فقط‌خواندنی · ۳۰ دقیقه' : access === 'pending' ? 'در انتظار اجازه' : access === 'denied' ? 'دسترسی رد شد' : 'بدون دسترسی'}
        </span>
      </div>
      <div className="term" ref={ref} dir="ltr">
        {logs.length === 0 && <div className="term-line muted">yara-probe ready · waiting for permission…</div>}
        {logs.map((l) => (
          <div key={l.id} className={`term-line ${l.level}`}>
            {l.text}
          </div>
        ))}
        <div className="term-cursor">▍</div>
      </div>
    </div>
  )
}

function CaseFile() {
  const s = useStore((st) => ({
    customer: st.customer,
    kbHits: st.kbHits,
    finding: st.finding,
    sandbox: st.sandbox,
    applied: st.applied,
    ticket: st.ticket,
    guardrail: st.guardrail,
    newKnowledge: st.newKnowledge,
  }))

  const empty = !s.customer && !s.kbHits && !s.finding
  const ref = useRef(null)
  const count = [s.customer, s.kbHits, s.finding, s.sandbox, s.applied, s.ticket, s.guardrail, s.newKnowledge].filter(Boolean).length
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [count])

  return (
    <div className="card casefile">
      <div className="card-title">
        <Icon name="book" /> پرونده هوشمند مسئله
      </div>
      <div className="case-scroll" ref={ref}>
        {empty && <div className="empty">YARA در طول مکالمه، شواهد را این‌جا جمع می‌کند.</div>}

        {s.guardrail && (
          <div className="case-item guard">
            <Icon name="shield" /> <b>محافظ ایمنی فعال شد:</b> {s.guardrail.message}
          </div>
        )}

        {s.customer && (
          <div className="case-item">
            <div className="ci-head">
              <Icon name="user" /> مشتری
            </div>
            <div className="kv">
              <span>سازمان</span>
              <b>{s.customer.org}</b>
              <span>نسخه</span>
              <b dir="ltr">{s.customer.version}</b>
              <span>سرور</span>
              <b dir="ltr">{s.customer.server}</b>
              <span>قرارداد</span>
              <b>{s.customer.contract}</b>
            </div>
          </div>
        )}

        {s.kbHits && (
          <div className="case-item">
            <div className="ci-head">
              <Icon name="book" /> دانش مرتبط
            </div>
            {s.kbHits.items.length === 0 ? (
              <div className="muted">مقاله مستقیمی پیدا نشد → تشخیص روی سرور لازم است</div>
            ) : (
              s.kbHits.items.map((k) => (
                <div className="kb" key={k.id}>
                  <span className="kb-id" dir="ltr">{k.id}</span> {k.title}
                  <span className="kb-count">{k.solvedCount.toLocaleString('fa-IR')} بار حل شده</span>
                </div>
              ))
            )}
          </div>
        )}

        {s.finding && (
          <div className={`case-item finding ${s.finding.type}`}>
            <div className="ci-head">
              <Icon name="terminal" /> تشخیص: {s.finding.title}
            </div>
            <p>{s.finding.cause}</p>
            <p className="impact">{s.finding.impact}</p>
            <div className="confidence">
              <span>اطمینان</span>
              <div className="bar">
                <i style={{ width: `${s.finding.confidence}%` }} />
              </div>
              <b>{s.finding.confidence.toLocaleString('fa-IR')}٪</b>
            </div>
            <div className="chips">
              {s.finding.evidence.map((e) => (
                <span key={e} className="chip">{e}</span>
              ))}
              <span className="chip level">{s.finding.level}</span>
            </div>
            {s.finding.workaround && <p className="workaround">راه موقت: {s.finding.workaround}</p>}
          </div>
        )}

        {s.sandbox && (
          <div className={`case-item ${s.sandbox.ok ? 'good' : 'warn'}`}>
            <div className="ci-head">
              <Icon name="flask" /> Sandbox
            </div>
            {s.sandbox.text}
          </div>
        )}

        {s.applied && (
          <div className="case-item good">
            <div className="ci-head">
              <Icon name="bolt" /> اصلاح اعمال شد
            </div>
            {s.applied.text}
            <div className="muted small">پشتیبان گرفته شد · امکان بازگشت با یک کلیک · ثبت در لاگ ممیزی</div>
          </div>
        )}

        {s.ticket && (
          <div className="case-item ticket">
            <div className="ci-head">
              <Icon name="ticket" /> تیکت <span dir="ltr">{s.ticket.id}</span> برای {s.ticket.assignee}
            </div>
            <b>{s.ticket.title}</b>
            <div className="kv">
              <span>شدت</span>
              <b>{s.ticket.severity === 'high' ? 'بالا' : 'متوسط'}</b>
              <span>نسخه</span>
              <b dir="ltr">{s.ticket.version}</b>
              <span>پیوست</span>
              <b>{s.ticket.logsAttached.toLocaleString('fa-IR')} خط لاگ + مراحل بازتولید</b>
              <span>SLA</span>
              <b>{s.ticket.sla}</b>
            </div>
            <ol className="repro">
              {s.ticket.repro.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>
        )}

        {s.newKnowledge && (
          <div className="case-item know">
            <div className="ci-head">
              <Icon name="sparkle" /> دانش جدید ساخته شد
            </div>
            <span dir="ltr">{s.newKnowledge.id}</span> · {s.newKnowledge.title} <span className="muted">(در انتظار تأیید کارشناس)</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OpsPanel() {
  return (
    <div className="ops">
      <Console />
      <CaseFile />
    </div>
  )
}

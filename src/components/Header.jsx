import { useState } from 'react'
import Icon from './Icon'
import { useStore, setState, setAgentId, resetCase } from '../engine/store'

const PAGES = [
  { id: 'intro', label: 'معرفی' },
  { id: 'demo', label: 'دمو زنده' },
  { id: 'dashboard', label: 'داشبورد پشتیبانی' },
  { id: 'roi', label: 'ارزش اقتصادی' },
  { id: 'arch', label: 'معماری و امنیت' },
]

function Settings({ onClose }) {
  const agentId = useStore((s) => s.agentId)
  const [val, setVal] = useState(agentId)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>
          <Icon name="settings" /> اتصال به ElevenLabs
        </h3>
        <label>Agent ID</label>
        <input dir="ltr" value={val} onChange={(e) => setVal(e.target.value.trim())} placeholder="agent_xxxxxxxxxxxxxxxx" />
        <p className="muted small">
          شناسه Agent ساخته‌شده در داشبورد ElevenLabs. راهنمای ساخت Agent و تعریف ابزارها در فایل <code>AGENT_SETUP.md</code> است. این مقدار فقط در همین مرورگر ذخیره می‌شود.
        </p>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            انصراف
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setAgentId(val)
              onClose()
            }}
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const page = useStore((s) => s.page)
  const mode = useStore((s) => s.mode)
  const call = useStore((s) => s.call)
  const agentId = useStore((s) => s.agentId)
  const [open, setOpen] = useState(false)
  const busy = call === 'active' || call === 'connecting'

  const switchMode = (m) => {
    if (busy || m === mode) return
    resetCase()
    setState({ mode: m })
  }

  return (
    <header className="header">
      <div className="brand" onClick={() => setState({ page: 'intro' })}>
        <img src={`${import.meta.env.BASE_URL}yara.svg`} alt="" />
        <div>
          <b>YARA</b>
          <span>Your AI Response Assistant</span>
        </div>
      </div>
      <nav>
        {PAGES.map((p) => (
          <button key={p.id} className={page === p.id ? 'active' : ''} onClick={() => setState({ page: p.id })}>
            {p.label}
          </button>
        ))}
      </nav>
      <div className="header-tools">
        <div className={`mode-toggle ${busy ? 'locked' : ''}`} title={busy ? 'در حین تماس قابل تغییر نیست' : ''}>
          <button className={mode === 'live' ? 'on' : ''} onClick={() => switchMode('live')}>
            <span className={`dot ${agentId ? 'ok' : ''}`} /> صدای زنده
          </button>
          <button className={mode === 'scripted' ? 'on' : ''} onClick={() => switchMode('scripted')}>
            <Icon name="wifiOff" size={14} /> دمو آفلاین
          </button>
        </div>
        <button className="icon-btn" onClick={() => setOpen(true)} title="تنظیمات ElevenLabs">
          <Icon name="settings" />
        </button>
      </div>
      {open && <Settings onClose={() => setOpen(false)} />}
    </header>
  )
}

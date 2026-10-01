import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { useStore, setState } from '../engine/store'
import { formatElapsed } from '../engine/tools'
import { SCENARIOS } from '../engine/mockData'

function useTicker(active) {
  const [, force] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => force((x) => x + 1), 500)
    return () => clearInterval(id)
  }, [active])
}

function Orb({ conversation }) {
  const ref = useRef(null)
  const s = useStore((st) => ({ call: st.call, mode: st.mode, speaking: st.speaking }))
  const sRef = useRef(s)
  sRef.current = s

  useEffect(() => {
    let raf
    let t = 0
    const loop = () => {
      t += 1
      const { call, mode, speaking } = sRef.current
      let out = 0
      let inp = 0
      if (call === 'active') {
        if (mode === 'live') {
          try {
            out = conversation.getOutputVolume?.() || 0
            inp = conversation.getInputVolume?.() || 0
          } catch {}
        } else {
          const wobble = (Math.sin(t / 4) + Math.sin(t / 7) + 2) / 4
          out = speaking === 'agent' ? 0.25 + wobble * 0.5 : 0
          inp = speaking === 'user' ? 0.2 + wobble * 0.4 : 0
        }
      }
      const level = Math.min(1, Math.max(out, inp * 0.8))
      if (ref.current) {
        ref.current.style.setProperty('--lvl', level.toFixed(3))
        ref.current.dataset.who = out > inp ? 'agent' : inp > 0.05 ? 'user' : 'idle'
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [conversation])

  return (
    <div className={`orb-wrap ${s.call}`} ref={ref}>
      <div className="orb-ring r1" />
      <div className="orb-ring r2" />
      <div className="orb-ring r3" />
      <div className="orb">
        <span className="orb-glyph">Y</span>
      </div>
    </div>
  )
}

function ApprovalSheet() {
  const approval = useStore((s) => s.approval)
  if (!approval) return null
  const isFix = approval.kind === 'fix'
  return (
    <div className="sheet-backdrop">
      <div className={`sheet ${isFix ? 'fix' : 'access'}`}>
        <div className="sheet-head">
          <Icon name={isFix ? 'shield' : 'key'} size={20} />
          <span>{approval.title}</span>
        </div>
        <ul>
          {approval.lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <div className="sheet-actions">
          <button className="btn danger ghost" onClick={() => approval.resolve(false)}>
            <Icon name="x" /> رد
          </button>
          <button className="btn success" onClick={() => approval.resolve(true)}>
            <Icon name="check" /> {isFix ? 'تأیید و اجرا' : 'اجازه می‌دهم'}
          </button>
        </div>
        <p className="sheet-foot">شما در نقش ادمین سازمان مشتری هستید. هیچ اقدامی بدون این تأیید انجام نمی‌شود.</p>
      </div>
    </div>
  )
}

export default function CallPanel({ session }) {
  const { start, stop, conversation } = session
  const st = useStore((s) => ({
    call: s.call,
    mode: s.mode,
    scenario: s.scenario,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    agentId: s.agentId,
    error: s.error,
  }))
  useTicker(st.call === 'active')
  const [muted, setMuted] = useState(false)

  const elapsed =
    st.startedAt && (st.call === 'active' || st.call === 'ended')
      ? formatElapsed((st.call === 'ended' ? st.endedAt : Date.now()) - st.startedAt)
      : '0:00'

  const statusText = {
    idle: 'آماده دریافت تماس',
    connecting: 'در حال اتصال…',
    active: conversation.isSpeaking && st.mode === 'live' ? 'یارا صحبت می‌کند' : 'در حال مکالمه',
    ended: 'تماس پایان یافت',
  }[st.call]

  const toggleMute = () => {
    const m = !muted
    setMuted(m)
    try {
      conversation.setMuted(m)
    } catch {}
  }

  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-top">
        <span className="caller">ادمین سازمان مشتری</span>
        <span className={`live-dot ${st.call === 'active' ? 'on' : ''}`}>{st.mode === 'live' ? 'LIVE' : 'DEMO'}</span>
      </div>

      <Orb conversation={conversation} />

      <div className="phone-name">YARA</div>
      <div className="phone-sub">{statusText}</div>
      <div className="phone-timer">{elapsed}</div>

      {st.mode === 'scripted' && st.call !== 'active' && (
        <div className="scenario-pick">
          <label>سناریوی دمو</label>
          <select value={st.scenario} onChange={(e) => setState({ scenario: e.target.value })}>
            {['workflow', 'export', 'performance'].map((id) => (
              <option key={id} value={id}>
                {SCENARIOS[id].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {st.mode === 'live' && st.call === 'idle' && (
        <div className="hint">
          با میکروفون واقعی صحبت کنید. مثلاً بگویید:
          <em>«از دیروز نامه‌ها به معاونت مالی ارجاع نمی‌شه.»</em>
        </div>
      )}

      {st.error && <div className="phone-error">{st.error}</div>}

      <div className="phone-controls">
        {st.call === 'active' || st.call === 'connecting' ? (
          <>
            {st.mode === 'live' && (
              <button className={`round ${muted ? 'muted' : ''}`} onClick={toggleMute} title="بی‌صدا">
                <Icon name={muted ? 'micOff' : 'mic'} size={22} />
              </button>
            )}
            <button className="round end" onClick={stop} title="پایان تماس">
              <Icon name="phoneOff" size={24} />
            </button>
          </>
        ) : (
          <button className="round start" onClick={start} title="شروع تماس">
            <Icon name={st.call === 'ended' ? 'refresh' : 'phone'} size={24} />
          </button>
        )}
      </div>
      <div className="phone-caption">
        {st.call === 'active' || st.call === 'connecting' ? 'پایان تماس' : st.call === 'ended' ? 'تماس دوباره' : 'تماس با پشتیبانی'}
      </div>

      <ApprovalSheet />
    </div>
  )
}

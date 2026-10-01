import { useEffect, useRef } from 'react'
import Icon from './Icon'
import { useStore } from '../engine/store'

export default function Transcript() {
  const transcript = useStore((s) => s.transcript)
  const speaking = useStore((s) => s.speaking)
  const call = useStore((s) => s.call)
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [transcript.length, speaking])

  return (
    <div className="card transcript">
      <div className="card-title">
        <Icon name="mic" /> متن زنده مکالمه
        <span className="tag">گفتار ← متن</span>
      </div>
      <div className="bubbles" ref={ref}>
        {transcript.length === 0 && (
          <div className="empty">
            {call === 'idle' ? 'برای شروع، روی دکمه تماس بزنید.' : 'در انتظار شروع گفت‌وگو…'}
          </div>
        )}
        {transcript.map((m) => (
          <div key={m.id} className={`bubble ${m.role}`}>
            <div className="who">{m.role === 'agent' ? 'YARA' : 'ادمین مشتری'}</div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        {speaking && (
          <div className={`bubble ${speaking} typing`}>
            <div className="who">{speaking === 'agent' ? 'YARA' : 'ادمین مشتری'}</div>
            <div className="dots">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

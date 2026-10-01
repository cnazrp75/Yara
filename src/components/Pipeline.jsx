import Icon from './Icon'
import { STEPS, useStore } from '../engine/store'

const STATUS_LABEL = { idle: '', active: 'در حال انجام', done: 'انجام شد', failed: 'متوقف', skipped: 'لازم نشد' }

export default function Pipeline() {
  const steps = useStore((s) => s.steps)
  const activity = useStore((s) => s.toolActivity)
  const doneCount = STEPS.filter((s) => steps[s.id] === 'done' || steps[s.id] === 'skipped').length
  const pct = Math.round((doneCount / STEPS.length) * 100)

  return (
    <div className="pipeline card">
      <div className="pipeline-head">
        <div className="card-title">
          <Icon name="sparkle" /> مسیر حل مسئله توسط YARA
        </div>
        <div className="activity">{activity ? <><span className="spinner" /> {activity}</> : <span className="muted">—</span>}</div>
      </div>
      <div className="pipeline-track">
        <div className="pipeline-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.id} className={`step ${steps[s.id]}`}>
            <div className="step-dot">
              {steps[s.id] === 'done' ? <Icon name="check" size={16} stroke={3} /> : steps[s.id] === 'failed' ? <Icon name="x" size={16} stroke={3} /> : <Icon name={s.icon} size={16} />}
            </div>
            <div className="step-label">
              <span className="step-num">{(i + 1).toLocaleString('fa-IR')}</span> {s.label}
            </div>
            <div className="step-status">{STATUS_LABEL[steps[s.id]]}</div>
          </li>
        ))}
      </ol>
    </div>
  )
}

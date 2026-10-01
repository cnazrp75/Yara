import Icon from './Icon'
import { useStore } from '../engine/store'
import { SCENARIOS } from '../engine/mockData'
import { formatElapsed } from '../engine/tools'

export default function OutcomeBanner() {
  const s = useStore((st) => ({ outcome: st.outcome, outcomeAt: st.outcomeAt, startedAt: st.startedAt, scenario: st.scenario, ticket: st.ticket }))
  if (!s.outcome) return null
  const sc = SCENARIOS[s.scenario]
  const t = formatElapsed(s.outcomeAt - s.startedAt)
  const resolved = s.outcome === 'resolved'

  return (
    <div className={`outcome ${s.outcome}`}>
      <div className="outcome-main">
        <div className="outcome-icon">
          <Icon name={resolved ? 'check' : 'ticket'} size={28} stroke={2.6} />
        </div>
        <div>
          <div className="outcome-title">
            {resolved ? 'مسئله حل شد، بدون دخالت کارشناس' : 'باگ تشخیص داده شد و با پرونده کامل ارجاع شد'}
          </div>
          <div className="outcome-sub">
            {resolved ? 'ادمین فقط دو بار تأیید کرد: اجازه دسترسی و اجرای اصلاح.' : 'کارشناس بدون حتی یک سؤال اضافه از مشتری، کار را شروع می‌کند.'}
          </div>
        </div>
      </div>
      <div className="compare">
        <div className="cmp-col">
          <span className="cmp-h">روش فعلی</span>
          <span>زمان: {sc?.traditional.time}</span>
          <span>افراد درگیر: {sc?.traditional.people}</span>
          <span>تکرار سؤال از مشتری: {sc?.traditional.questions}</span>
        </div>
        <div className="cmp-col yara">
          <span className="cmp-h">با YARA</span>
          <span>
            زمان: <b dir="ltr">{t}</b> دقیقه
          </span>
          <span>افراد درگیر: {resolved ? '۰ کارشناس' : '۱ کارشناس (فقط برای رفع باگ)'}</span>
          <span>تکرار سؤال از مشتری: ۰</span>
        </div>
      </div>
    </div>
  )
}

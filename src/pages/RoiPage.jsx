import { useState } from 'react'
import Icon from '../components/Icon'

const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { maximumFractionDigits: d })

function Slider({ label, value, onChange, min, max, step = 1, unit = '', hint }) {
  return (
    <div className="slider">
      <div className="slider-head">
        <span>{label}</span>
        <b>
          {fa(value, 1)}
          {unit}
        </b>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <small className="muted">{hint}</small>}
    </div>
  )
}

export default function RoiPage() {
  const [agents, setAgents] = useState(20)
  const [cost, setCost] = useState(35) // million toman / month (assumption)
  const [tickets, setTickets] = useState(6000)
  const [s1, setS1] = useState(60)
  const [s2, setS2] = useState(30)
  const [a1, setA1] = useState(60)
  const [a2, setA2] = useState(30)
  const [h, setH] = useState(20)
  const [yaraCost, setYaraCost] = useState(2500)

  const s3 = Math.max(0, 100 - s1 - s2)
  const W = [1, 3, 4] // relative cost per ticket (MetricNet ratio)
  const effort = (s1 * W[0] + s2 * W[1] + s3 * W[2]) / 100
  const removed = ((s1 * a1) / 100) * W[0] / 100 + ((s2 * a2) / 100) * W[1] / 100
  const remaining = (effort - removed) * (1 - h / 100)
  const reduction = effort > 0 ? 1 - remaining / effort : 0
  const autoShare = (s1 * a1 + s2 * a2) / 10000
  const autoTickets = tickets * autoShare
  const fte = agents * reduction
  const gross = agents * cost * 12 * reduction
  const net = gross - yaraCost

  return (
    <main className="roi">
      <div className="page-head">
        <h2>ارزش اقتصادی برای یک شرکت نرم‌افزاری</h2>
        <p className="muted">همه ورودی‌ها فرض‌اند و قابل تغییر؛ هدف، نشان‌دادن منطق محاسبه است. مقادیر پیش‌فرض همان سناریوی پایه مستند ماست.</p>
      </div>

      <div className="roi-grid">
        <div className="card roi-inputs">
          <div className="card-title">
            <Icon name="settings" /> فرض‌ها
          </div>
          <Slider label="تعداد کارشناسان پشتیبانی" value={agents} onChange={setAgents} min={5} max={100} unit=" نفر" />
          <Slider label="هزینه ماهانه هر کارشناس" value={cost} onChange={setCost} min={10} max={100} unit=" م.ت" hint="میلیون تومان، با بیمه و سربار (فرض)" />
          <Slider label="تعداد تیکت ماهانه" value={tickets} onChange={setTickets} min={500} max={30000} step={500} />
          <Slider label="سهم تیکت‌های سطح ۱ (آموزشی، تنظیمات)" value={s1} onChange={(v) => setS1(Math.min(v, 100 - s2))} min={0} max={100} unit="٪" />
          <Slider label="سهم تیکت‌های سطح ۲ (داده و سرور مشتری)" value={s2} onChange={(v) => setS2(Math.min(v, 100 - s1))} min={0} max={100} unit="٪" hint={`سهم سطح ۳ (باگ): ${fa(s3)}٪`} />
          <Slider label="حل خودکار سطح ۱ توسط YARA" value={a1} onChange={setA1} min={0} max={95} unit="٪" />
          <Slider label="حل خودکار سطح ۲ توسط YARA" value={a2} onChange={setA2} min={0} max={80} unit="٪" />
          <Slider label="کاهش زمان رسیدگی تیکت‌های ارجاعی" value={h} onChange={setH} min={0} max={40} unit="٪" hint="به‌خاطر پرونده کامل؛ مطالعه NBER: ۱۴٪ با دستیار ساده‌تر" />
          <Slider label="هزینه سالانه YARA (لایسنس + زیرساخت)" value={yaraCost} onChange={setYaraCost} min={0} max={15000} step={250} unit=" م.ت" hint="فرض؛ باید با پیش‌فاکتور واقعی جایگزین شود" />
        </div>

        <div className="roi-out">
          <div className="big-numbers">
            <div className="card bn">
              <span>کاهش بار کاری پشتیبانی</span>
              <b className="grad">{fa(reduction * 100)}٪</b>
            </div>
            <div className="card bn">
              <span>تیکت حل‌شده بدون انسان در ماه</span>
              <b>{fa(autoTickets)}</b>
              <small>{fa(autoShare * 100)}٪ از کل</small>
            </div>
            <div className="card bn">
              <span>ظرفیت آزادشده</span>
              <b>{fa(fte, 1)}</b>
              <small>معادل تمام‌وقت</small>
            </div>
            <div className="card bn">
              <span>صرفه‌جویی خالص سالانه</span>
              <b className={net >= 0 ? 'pos' : 'neg'}>{fa(net)}</b>
              <small>میلیون تومان (ناخالص {fa(gross)})</small>
            </div>
          </div>

          <div className="card formula">
            <div className="card-title">
              <Icon name="cpu" /> منطق محاسبه
            </div>
            <ol>
              <li>هزینه نسبی هر تیکت بر اساس سطح: سطح ۱ = ۱، سطح ۲ = ۳، سطح ۳ = ۴ (نسبت‌های بنچمارک MetricNet).</li>
              <li>بار حذف‌شده = سهم هر سطح × درصد حل خودکار × هزینه نسبی آن سطح.</li>
              <li>بار باقی‌مانده × (۱ − کاهش زمان رسیدگی)، چون تیکت‌ها با پرونده کامل می‌رسند.</li>
              <li>صرفه‌جویی = کارشناسان × هزینه سالانه × درصد کاهش بار − هزینه YARA.</li>
            </ol>
            <p className="muted small">
              برای مقایسه: Gartner پیش‌بینی می‌کند تا ۲۰۲۹ هوش مصنوعی عامل‌محور ۸۰٪ مسائل رایج خدمات مشتری را بدون انسان حل کند و هزینه عملیاتی را ۳۰٪ کاهش
              دهد. سقف ۷۰٪ را فقط برای مرحله بلوغ پایگاه دانش هدف‌گذاری می‌کنیم. همه این فرض‌ها در پایلوت حالت سایه سنجیده می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

import Icon from '../components/Icon'
import { useStore } from '../engine/store'
import { SEED_TICKETS } from '../engine/mockData'

const WEEKS = [18, 22, 27, 31, 35, 38, 42, 46]
const TOP_ISSUES = [
  ['مسیر ارجاع با کاربر غیرفعال', 34],
  ['تعریف جانشین در مرخصی', 27],
  ['پرشدن دیسک لاگ', 15],
  ['قفل‌شدن حساب پس از تغییر رمز', 12],
  ['خطای خروجی PDF (8.2.1)', 9],
]

function fa(n) {
  return Number(n).toLocaleString('fa-IR')
}

export default function DashboardPage() {
  const history = useStore((s) => s.history)
  const rows = [...history, ...SEED_TICKETS]
  const max = Math.max(...WEEKS)

  return (
    <main className="dash">
      <div className="page-head">
        <h2>داشبورد تیم پشتیبانی</h2>
        <p className="muted">نمای کارشناس و مدیر پشتیبانی در شرکت نرم‌افزاری. داده‌های این صفحه ساختگی‌اند؛ تماس‌های دمو در جدول اضافه می‌شوند.</p>
      </div>

      <div className="kpis">
        {[
          ['حل خودکار این هفته', '۴۶٪', 'از ۱۸٪ در هفته اول', 'good'],
          ['میانگین زمان حل', '۳:۲۰', 'دقیقه — قبلاً ۶ ساعت', 'good'],
          ['تیکت ارجاعی با پرونده کامل', '۱۰۰٪', 'لاگ + بازتولید + نسخه', 'info'],
          ['تغییر بدون تأیید ادمین', '۰', 'محافظ ایمنی فعال', 'info'],
        ].map(([t, v, sub, tone]) => (
          <div className={`kpi card ${tone}`} key={t}>
            <span>{t}</span>
            <b>{v}</b>
            <small>{sub}</small>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-title">
            <Icon name="chart" /> رشد حل خودکار با یادگیری از مسائل حل‌شده
          </div>
          <div className="bars">
            {WEEKS.map((w, i) => (
              <div className="bar-col" key={i}>
                <div className="bar-v" style={{ height: `${(w / max) * 100}%` }}>
                  <span>{fa(w)}٪</span>
                </div>
                <small>هفته {fa(i + 1)}</small>
              </div>
            ))}
          </div>
          <p className="muted small">هر مسئله حل‌شده پس از تأیید کارشناس به دانش اضافه می‌شود؛ برای همین نرخ حل خودکار هفته‌به‌هفته بالا می‌رود.</p>
        </div>

        <div className="card">
          <div className="card-title">
            <Icon name="sparkle" /> پرتکرارترین مشکلات (بینش برای تیم محصول)
          </div>
          <div className="issues">
            {TOP_ISSUES.map(([name, n]) => (
              <div className="issue" key={name}>
                <span>{name}</span>
                <div className="bar">
                  <i style={{ width: `${(n / TOP_ISSUES[0][1]) * 100}%` }} />
                </div>
                <b>{fa(n)}</b>
              </div>
            ))}
          </div>
          <p className="muted small">پیشنهاد YARA به تیم محصول: هنگام غیرفعال‌کردن کاربر، مسیرهای ارجاع او به‌طور خودکار هشدار بدهند.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <Icon name="ticket" /> آخرین درخواست‌ها
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>سازمان</th>
              <th>موضوع</th>
              <th>سطح</th>
              <th>زمان</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.fresh ? 'fresh' : ''}>
                <td dir="ltr">{r.id}</td>
                <td>{r.org}</td>
                <td>
                  {r.title} {r.fresh && <span className="chip new">همین الان در دمو</span>}
                </td>
                <td dir="ltr">{r.level}</td>
                <td dir="ltr">{r.time}</td>
                <td>
                  <span className={`status ${r.status}`}>{r.status === 'auto' ? 'حل خودکار' : 'ارجاع با پرونده کامل'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

import Icon from '../components/Icon'
import { setState } from '../engine/store'

const FLOW_OLD = ['تماس مشتری', 'کارشناس سطح ۱', 'سؤال‌های تکراری', 'تیکت ناقص', 'کارشناس سطح ۲', 'دسترسی از راه دور', 'حل مسئله']
const FLOW_NEW = ['تماس مشتری', 'YARA تشخیص می‌دهد', 'آزمایش در Sandbox', 'تأیید ادمین', 'حل مسئله']

export default function IntroPage() {
  return (
    <main className="intro">
      <section className="hero">
        <div className="hero-badge">
          <Icon name="sparkle" size={14} /> رویداد پُل — آینده پشتیبانی نرم‌افزارهای سازمانی
        </div>
        <h1>
          پشتیبانی که مشکل را <span className="grad">حل می‌کند</span>،
          <br />
          نه فقط جواب می‌دهد.
        </h1>
        <p className="lead">
          YARA یک کارشناس پشتیبانی هوش مصنوعی برای نرم‌افزارهای On-premise است. به تماس مشتری گوش می‌دهد، با اجازه ادمین مشکل را روی سرور
          خودش تشخیص می‌دهد، اصلاح را در محیط ایزوله آزمایش می‌کند و پس از تأیید انسانی اجرا می‌کند. اگر مشکل باگ باشد، تیکتی کامل با همه شواهد
          برای تیم توسعه می‌سازد.
        </p>
        <div className="hero-cta">
          <button className="btn primary big" onClick={() => setState({ page: 'demo' })}>
            <Icon name="phone" /> شروع دمو زنده
          </button>
          <button className="btn ghost big" onClick={() => setState({ page: 'roi' })}>
            <Icon name="chart" /> محاسبه ارزش اقتصادی
          </button>
        </div>
        <div className="hero-stats">
          <div>
            <b>≈ ۴۵٪</b>
            <span>تیکت‌ها بدون کارشناس حل می‌شوند*</span>
          </div>
          <div>
            <b>۱۰۰٪</b>
            <span>تیکت‌های ارجاعی با پرونده کامل</span>
          </div>
          <div>
            <b>۴۰–۵۰٪</b>
            <span>کاهش بار کاری پشتیبانی*</span>
          </div>
          <div>
            <b>۰</b>
            <span>تغییر بدون تأیید ادمین</span>
          </div>
        </div>
        <p className="foot-note">* برآورد سناریوی پایه با فرض‌های شفاف؛ جزئیات در صفحه «ارزش اقتصادی».</p>
      </section>

      <section className="flows">
        <div className="flow card">
          <div className="flow-title bad">امروز: یک مشکل ۵ دقیقه‌ای، یک روز کاری</div>
          <div className="flow-row">
            {FLOW_OLD.map((f, i) => (
              <span key={f} className="flow-node">
                {f}
                {i < FLOW_OLD.length - 1 && <Icon name="arrow" size={14} />}
              </span>
            ))}
          </div>
        </div>
        <div className="flow card">
          <div className="flow-title good">با YARA: در همان تماس اول، در چند دقیقه</div>
          <div className="flow-row">
            {FLOW_NEW.map((f, i) => (
              <span key={f} className={`flow-node ${f.includes('YARA') ? 'hl' : ''}`}>
                {f}
                {i < FLOW_NEW.length - 1 && <Icon name="arrow" size={14} />}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pillars">
        {[
          ['terminal', 'تشخیص روی سیستم واقعی', 'از روی وضعیت واقعی سرور مشتری استدلال می‌کند، نه فقط از روی مستندات.'],
          ['flask', 'اول Sandbox، بعد سرور اصلی', 'هر اصلاح ابتدا روی کپی ایزوله آزمایش می‌شود و نتیجه‌اش به ادمین نشان داده می‌شود.'],
          ['shield', 'کنترل انسانی در کد', 'محافظ‌های ایمنی در خود سیستم پیاده شده‌اند؛ هیچ تغییری بدون تأیید اجرا نمی‌شود.'],
          ['lock', 'کاملاً محلی', 'LLM، گفتار و دانش روی زیرساخت خود سازمان اجرا می‌شوند؛ داده بیرون نمی‌رود.'],
          ['ticket', 'تیکت کامل برای انسان', 'باگ‌ها با لاگ، مراحل بازتولید و نسخه به تیم توسعه می‌رسند.'],
          ['book', 'یادگیری مداوم', 'هر مسئله حل‌شده، پس از تأیید کارشناس، به دانش سازمان اضافه می‌شود.'],
        ].map(([icon, title, text]) => (
          <div className="pillar card" key={title}>
            <div className="pillar-icon">
              <Icon name={icon} size={22} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

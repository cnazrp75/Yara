import Icon from '../components/Icon'

const LADDER = [
  ['۰', 'حالت سایه', 'YARA فقط پیشنهاد می‌دهد و کارشناس تصمیم می‌گیرد؛ دقت اندازه‌گیری می‌شود.'],
  ['۱', 'فقط خواندن', 'تشخیص روی سرور با اجازه زمان‌دار ادمین در هر جلسه.'],
  ['۲', 'اقدام با تأیید', 'هر تغییر فقط با آزمایش در Sandbox، تأیید صریح ادمین، پشتیبان‌گیری و امکان بازگشت.'],
  ['۳', 'خودکار محدود', 'فقط اقدامات کم‌خطر و از پیش تأییدشده (مثل راه‌اندازی دوباره سرویس) خودکار انجام می‌شوند.'],
]

const GUARDS = [
  'run_diagnostics بدون اجازه ادمین مسدود می‌شود',
  'request_fix_approval بدون آزمایش موفق Sandbox مسدود می‌شود',
  'apply_fix بدون تأیید صریح ادمین مسدود می‌شود',
  'هر اقدام با پشتیبان‌گیری و لاگ ممیزی تغییرناپذیر انجام می‌شود',
]

export default function ArchPage() {
  return (
    <main className="arch">
      <div className="page-head">
        <h2>معماری کاملاً محلی و کنترل انسانی</h2>
        <p className="muted">داده هیچ‌وقت از زیرساخت شرکت نرم‌افزاری و سازمان مشتری خارج نمی‌شود.</p>
      </div>

      <div className="arch-diagram card">
        <div className="lane">
          <div className="lane-title">
            <Icon name="user" /> کانال‌ها
          </div>
          <div className="node">تلفن (VoIP)</div>
          <div className="node">چت داخل نرم‌افزار</div>
          <div className="node">ایمیل</div>
        </div>
        <div className="arrow-col">
          <Icon name="arrow" size={26} />
        </div>
        <div className="lane core">
          <div className="lane-title">
            <Icon name="cpu" /> مغز YARA — زیرساخت محلی شرکت نرم‌افزاری
          </div>
          <div className="node">گفتار به متن: Whisper تنظیم‌شده برای فارسی</div>
          <div className="node hl">LLM متن‌باز محلی + برنامه‌ریز ابزارها</div>
          <div className="node">پایگاه دانش (RAG): مستندات، ویدئوها، تیکت‌ها</div>
          <div className="node">متن به گفتار فارسی</div>
          <div className="node guard">لایه محافظ ایمنی و لاگ ممیزی</div>
        </div>
        <div className="arrow-col">
          <Icon name="arrow" size={26} />
        </div>
        <div className="lane">
          <div className="lane-title">
            <Icon name="server" /> ابزارها
          </div>
          <div className="node">CRM و قرارداد مشتری</div>
          <div className="node hl">Agent تشخیصی سبک روی سرور سازمان مشتری</div>
          <div className="node">Sandbox ایزوله (کپی Snapshot)</div>
          <div className="node">سامانه تیکت و مدیریت پروژه</div>
          <div className="node">
            <Icon name="human" size={14} /> کارشناس انسانی
          </div>
        </div>
      </div>

      <div className="arch-grid">
        <div className="card">
          <div className="card-title">
            <Icon name="shield" /> پله‌های اختیار
          </div>
          <div className="ladder">
            {LADDER.map(([n, t, d]) => (
              <div className="rung" key={n}>
                <div className="rung-n">{n}</div>
                <div>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <Icon name="lock" /> محافظ‌هایی که در خود کد اعمال می‌شوند
          </div>
          <ul className="guards">
            {GUARDS.map((g) => (
              <li key={g}>
                <Icon name="check" size={14} stroke={3} /> {g}
              </li>
            ))}
          </ul>
          <p className="muted small">
            این قواعد فقط در پرامپت نوشته نشده‌اند. اگر مدل زبانی اشتباه کند و بخواهد بدون تأیید اقدام کند، خود سیستم درخواست را رد می‌کند. در دمو می‌توانید
            این را با رد کردن درخواست‌ها ببینید.
          </p>
          <div className="note-box">
            <Icon name="sparkle" size={16} />
            <span>
              <b>درباره این دمو:</b> برای نمایش مکالمه زنده، صدا و LLM از ElevenLabs استفاده می‌کنند. در نسخه واقعی همین ابزارها و محافظ‌ها با مدل‌های محلی اجرا
              می‌شوند.
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}

import { tools } from './tools'
import { addMessage, setState, getState } from './store'
import { CUSTOMER } from './mockData'

// Offline "scripted" demo: same tools and UI as the live ElevenLabs agent,
// but the dialogue is pre-written. Approvals still wait for real clicks.
// Use it as a backup on stage if the network or microphone fails.

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const A = (text) => ({ role: 'agent', text })
const U = (text) => ({ role: 'user', text })
const T = (name, args, branches) => ({ tool: name, args, branches })

const GREETING = A('سلام، من یارا هستم، دستیار هوشمند پشتیبانی نامه‌نگار. چطور می‌تونم کمکتون کنم؟')

const INTRO = (problem) => [
  GREETING,
  U(`سلام، ${CUSTOMER.admin} هستم از ${CUSTOMER.org}. ${problem}`),
  T('identify_customer', { organization_name: CUSTOMER.org }),
]

const DENIED = [
  A('کاملاً متوجهم. بدون دسترسی نمی‌تونم سرور رو بررسی کنم؛ یک تیکت با همه اطلاعاتی که تا الان گفتید برای کارشناس ثبت می‌کنم.'),
  T('create_ticket', { title: 'بررسی نیازمند کارشناس (دسترسی داده نشد)', severity: 'medium' }),
  A('تیکت ثبت شد و کارشناس بدون اینکه دوباره سؤال بپرسه پیگیری می‌کنه.'),
]

const REJECTED = [
  A('باشه، هیچ تغییری روی سرور اعمال نمی‌کنم. نتیجه تشخیص و آزمایش Sandbox رو برای کارشناس ثبت می‌کنم تا با هماهنگی شما اقدام کنه.'),
  T('create_ticket', { title: 'اصلاح آماده — منتظر هماهنگی ادمین', severity: 'medium' }),
]

export const SCRIPTS = {
  workflow: [
    ...INTRO('از دیروز عصر نامه‌ها به معاونت مالی ارجاع نمی‌شه.'),
    A('ممنون مهندس احمدی. سازمان شما نسخه 8.2.1 رو داره و قرارداد پشتیبانی طلایی فعاله. اول موارد مشابه رو بررسی می‌کنم.'),
    T('search_knowledge_base', { query: 'ارجاع نامه انجام نمی‌شود', category: 'workflow' }),
    A('دو مقاله مرتبط پیدا کردم که معمولاً به تنظیمات گردش کار برمی‌گرده. برای اینکه مطمئن بشم، اجازه می‌دید لاگ‌ها و تنظیمات گردش کار رو روی سرورتون بررسی کنم؟ دسترسی فقط‌خواندنیه.'),
    T('request_server_access', { reason: 'بررسی لاگ‌ها و تنظیمات گردش کار ارجاع' }, { denied: DENIED }),
    T('run_diagnostics', { area: 'workflow' }),
    A('علت رو پیدا کردم: کاربر معاون مالی، آقای رحیمی، روز ۸ مهر غیرفعال شده ولی هنوز مقصد مسیر ارجاع معاونت مالیه. ۳۷ نامه از دیروز معطل مونده. پیشنهادم اینه که مقصد به کاربر فعال جدید، خانم کریمی، منتقل بشه و نامه‌ها دوباره ارسال بشن. اول روی محیط آزمایشی تستش می‌کنم.'),
    T('test_fix_in_sandbox', { fix_id: 'reassign_finance_route' }),
    A('روی کپی آزمایشی اجرا شد و هر ۳۷ نامه بدون خطا ارجاع شدن. اجازه می‌دید روی سرور اصلی اعمالش کنم؟ قبلش نسخه پشتیبان می‌گیرم.'),
    T('request_fix_approval', { fix_id: 'reassign_finance_route', explanation: 'جایگزینی مقصد مسیر و ارسال مجدد نامه‌های معطل' }, { rejected: REJECTED }),
    T('apply_fix', { fix_id: 'reassign_finance_route' }),
    A('انجام شد. پشتیبان گرفته شد، مسیر اصلاح شد و ۳۷ نامه به کارتابل خانم کریمی رسید. یک نامه آزمایشی هم فرستادم که درست رسید.'),
    U('عالیه، خیلی ممنون!'),
    T('close_case', { summary: 'اصلاح مسیر ارجاع معاونت مالی' }),
    A('خواهش می‌کنم. این مورد رو هم برای بررسی کارشناس به پایگاه دانش اضافه کردم تا دفعه بعد سریع‌تر حل بشه. روز خوبی داشته باشید!'),
  ],

  export: [
    ...INTRO('از امروز صبح، بعد از آپدیت دیشب، خروجی PDF بعضی نامه‌ها خطا می‌ده.'),
    A('ممنون. سازمان شما دیشب به نسخه 8.2.1 ارتقا داده. اول پایگاه دانش رو بررسی می‌کنم.'),
    T('search_knowledge_base', { query: 'خطای خروجی PDF', category: 'export' }),
    A('مورد مشابهی برای این خطا ثبت نشده. اجازه می‌دید لاگ‌های سرویس خروجی رو روی سرورتون بررسی کنم؟ فقط‌خواندنیه.'),
    T('request_server_access', { reason: 'بررسی لاگ‌های سرویس خروجی PDF' }, { denied: DENIED }),
    T('run_diagnostics', { area: 'export' }),
    A('پیداش کردم و در محیط آزمایشی هم بازتولیدش کردم. این یک باگ در نسخه 8.2.1 هست: نامه‌هایی که نام پیوستشون بیشتر از ۱۲۰ کاراکتره، موقع خروجی PDF خطا می‌دن. تا انتشار اصلاحیه، اگر نام پیوست رو کوتاه کنید مشکل حل می‌شه. الان برای تیم توسعه تیکت کامل ثبت می‌کنم.'),
    T('create_ticket', { title: 'خطای خروجی PDF برای پیوست با نام طولانی (رگرسیون 8.2.1)', severity: 'high' }),
    A('تیکت با لاگ‌ها، مراحل بازتولید و نسخه برای تیم توسعه ثبت شد. زمان پاسخ‌گویی حداکثر ۴ ساعت کاریه و نتیجه رو بهتون اطلاع می‌دیم.'),
    U('ممنون، پس فعلاً اسم فایل‌ها رو کوتاه می‌کنیم.'),
  ],

  performance: [
    ...INTRO('سیستم از صبح خیلی کنده و صفحه‌ها دیر باز می‌شن.'),
    A('متوجه شدم. اول موارد مشابه رو بررسی می‌کنم.'),
    T('search_knowledge_base', { query: 'کندی سامانه', category: 'performance' }),
    A('اجازه می‌دید منابع و تنظیمات سرور رو بررسی کنم؟ دسترسی فقط‌خواندنیه.'),
    T('request_server_access', { reason: 'بررسی منابع و تنظیمات سرور' }, { denied: DENIED }),
    T('run_diagnostics', { area: 'performance' }),
    A('علت پیدا شد: حالت Debug لاگ از یک جلسه پشتیبانی قبلی روشن مونده و دیسک لاگ ۹۷ درصد پر شده. پیشنهاد می‌کنم سطح لاگ برگرده و لاگ‌های قدیمی فشرده بشن. اول روی محیط آزمایشی تست می‌کنم.'),
    T('test_fix_in_sandbox', { fix_id: 'archive_logs_disable_debug' }),
    A('آزمایش موفق بود. اجازه می‌دید روی سرور اصلی اجرا کنم؟'),
    T('request_fix_approval', { fix_id: 'archive_logs_disable_debug', explanation: 'برگرداندن سطح لاگ و آرشیو' }, { rejected: REJECTED }),
    T('apply_fix', { fix_id: 'archive_logs_disable_debug' }),
    A('انجام شد. ۴۱ گیگابایت آزاد شد و زمان پاسخ صفحات از ۴.۸ ثانیه به ۰.۶ ثانیه رسید.'),
    U('الان خیلی سریع شد، ممنون!'),
    T('close_case', { summary: 'رفع کندی با اصلاح سطح لاگ' }),
  ],
}

export async function runScript(id, isCancelled) {
  let queue = [...SCRIPTS[id]]
  while (queue.length) {
    if (isCancelled()) return
    const item = queue.shift()
    if (item.tool) {
      await wait(500)
      const raw = await tools[item.tool](item.args)
      let res = {}
      try {
        res = JSON.parse(raw)
      } catch {}
      if (item.branches?.denied && res.granted === false) queue = [...item.branches.denied]
      if (item.branches?.rejected && res.approved === false) queue = [...item.branches.rejected]
      continue
    }
    // simulate speech: show "speaking" state proportional to text length
    setState({ speaking: item.role })
    await wait(item.role === 'agent' ? 600 : 450)
    if (isCancelled()) return
    addMessage(item.role, item.text)
    await wait(Math.min(4200, 700 + item.text.length * 22))
    setState({ speaking: null })
    await wait(350)
  }
  if (!isCancelled() && getState().call === 'active') {
    await wait(800)
    setState({ call: 'ended', endedAt: Date.now(), speaking: null })
  }
}

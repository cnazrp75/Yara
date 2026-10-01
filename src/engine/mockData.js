// All data in this demo is fictional. No real customer, product or company data.

export const PRODUCT = {
  name: 'نامه‌نگار',
  fullName: 'سامانه اتوماسیون اداری نامه‌نگار',
  vendor: 'شرکت نرم‌افزاری نمونه',
}

export const CUSTOMER = {
  org: 'سازمان نمونه توسعه شهری',
  admin: 'مهندس احمدی',
  version: '8.2.1',
  server: 'srv-office-01 (on-premise)',
  contract: 'پشتیبانی طلایی — فعال تا ۱۴۰۶/۰۲',
  users: 1240,
  lastUpdate: '۹ مهر ۱۴۰۵ — ارتقا به 8.2.1',
  openTickets: 1,
}

export const KB = [
  {
    id: 'KB-112',
    category: 'workflow',
    title: 'ارجاع نامه انجام نمی‌شود پس از تغییر سمت یا غیرفعال‌شدن کاربر',
    summary: 'مسیرهای ارجاعی که مقصدشان کاربر غیرفعال است باید به کاربر فعال جانشین منتقل شوند.',
    solvedCount: 23,
  },
  {
    id: 'KB-087',
    category: 'workflow',
    title: 'تعریف جانشین در زمان مرخصی',
    summary: 'از منوی کاربران > جانشینی، بازه زمانی و کاربر جانشین را تعیین کنید.',
    solvedCount: 61,
  },
  {
    id: 'KB-203',
    category: 'export',
    title: 'تنظیم قالب خروجی PDF نامه',
    summary: 'قالب سربرگ و فونت خروجی از تنظیمات چاپ قابل تغییر است.',
    solvedCount: 14,
  },
  {
    id: 'KB-150',
    category: 'performance',
    title: 'کندی سامانه و بررسی فضای دیسک سرور',
    summary: 'پرشدن دیسک لاگ‌ها یا فعال‌ماندن حالت Debug باعث کندی شدید می‌شود.',
    solvedCount: 9,
  },
]

export const SCENARIOS = {
  workflow: {
    id: 'workflow',
    label: 'ارجاع نامه‌ها انجام نمی‌شود',
    type: 'fix',
    level: 'سطح ۲ — داده/تنظیمات روی سرور مشتری',
    logs: [
      ['info', '$ yara-probe connect srv-office-01 --mode=read-only'],
      ['ok', 'connected · session=YRA-7F2C · expires in 30m'],
      ['info', '$ yara-probe check services'],
      ['ok', 'WorkflowEngine ........ running'],
      ['ok', 'MailGateway ........... running'],
      ['ok', 'SQL Server ............ running (latency 4ms)'],
      ['info', '$ yara-probe logs WorkflowEngine --since "2026-09-30 00:00" --level warn+'],
      ['warn', '2026-09-30 16:42:11 WARN  Route[Finance-Deputy] target u-1043 (m.rahimi) is DISABLED'],
      ['error', '2026-09-30 16:42:11 ERROR Referral #88213 failed: TargetUserInactiveException'],
      ['error', '2026-09-30 16:58:40 ERROR Referral #88231 failed: TargetUserInactiveException'],
      ['error', '… 35 more identical errors'],
      ['info', '$ yara-probe sql "SELECT status FROM Users WHERE id=\'u-1043\'"  (read-only)'],
      ['warn', 'u-1043 · m.rahimi · status=DISABLED · changed 2026-09-30 16:40 by hr-sync'],
      ['info', '$ yara-probe sql "SELECT COUNT(*) FROM Referrals WHERE state=\'FAILED\'"'],
      ['warn', '37 referrals stuck in FAILED state'],
      ['ok', 'root cause identified · confidence 0.94'],
    ],
    finding: {
      title: 'کاربر مقصد مسیر ارجاع غیرفعال شده است',
      cause: 'کاربر «معاون مالی» (m.rahimi) روز ۸ مهر توسط همگام‌سازی منابع انسانی غیرفعال شده، اما هنوز مقصد مسیر ارجاع «معاونت مالی» است.',
      impact: '۳۷ نامه از دیروز ساعت ۱۶:۴۲ معطل مانده‌اند.',
      confidence: 94,
      evidence: ['TargetUserInactiveException × 37', 'u-1043 status=DISABLED', 'KB-112 (۲۳ مورد مشابه حل‌شده)'],
    },
    fix: {
      id: 'reassign_finance_route',
      title: 'انتقال مقصد مسیر «معاونت مالی» به کاربر فعال جدید (s.karimi) و ارسال مجدد ۳۷ نامه',
      risk: 'متوسط — تغییر داده',
      sandboxLogs: [
        ['info', '$ yara-sandbox clone srv-office-01 --snapshot=latest'],
        ['ok', 'sandbox sbx-31 ready (isolated, no outbound mail)'],
        ['info', '$ apply fix reassign_finance_route --target sbx-31'],
        ['ok', 'Route[Finance-Deputy] target → u-1187 (s.karimi)'],
        ['info', '$ replay 37 failed referrals'],
        ['ok', '37/37 delivered · 0 errors'],
        ['ok', 'regression checks: 12/12 passed'],
      ],
      sandboxResult: '۳۷ از ۳۷ نامه بدون خطا ارجاع شدند؛ ۱۲ تست بازگشتی موفق.',
      applyLogs: [
        ['info', '$ yara-probe backup Routes,Referrals --tag pre-YRA-7F2C'],
        ['ok', 'backup saved · bk-2026-10-01-0812 · rollback ready'],
        ['info', '$ apply fix reassign_finance_route --target srv-office-01'],
        ['ok', 'Route[Finance-Deputy] target → u-1187 (s.karimi)'],
        ['info', '$ replay 37 failed referrals'],
        ['ok', '37/37 delivered'],
        ['info', '$ verify: send test referral → Finance-Deputy'],
        ['ok', 'test referral delivered in 0.8s ✔'],
      ],
      result: 'مسیر اصلاح شد و ۳۷ نامه به کارتابل خانم کریمی رسید.',
    },
    traditional: { time: '≈ ۱ روز کاری', people: '۳ نفر', questions: '۴ بار' },
  },

  export: {
    id: 'export',
    label: 'خطای خروجی PDF بعد از به‌روزرسانی',
    type: 'bug',
    level: 'سطح ۳ — باگ محصول',
    logs: [
      ['info', '$ yara-probe connect srv-office-01 --mode=read-only'],
      ['ok', 'connected · session=YRA-91AD · expires in 30m'],
      ['info', '$ yara-probe check services'],
      ['ok', 'all services running'],
      ['info', '$ yara-probe logs ExportService --since "2026-10-01 00:00" --level error'],
      ['error', '2026-10-01 09:14:02 ERROR PdfRenderer.RenderAttachment: NullReferenceException'],
      ['error', '   at Namehnegar.Export.PdfRenderer.RenderAttachment(Attachment a) line 412'],
      ['error', '   at Namehnegar.Export.LetterExporter.Export(Letter l)'],
      ['warn', '21 failures · all letters with attachment filename > 120 chars (Persian)'],
      ['info', '$ yara-probe diff-version 8.2.0 → 8.2.1 --module Export'],
      ['warn', 'changed: PdfRenderer.cs (filename truncation logic)'],
      ['info', '$ yara-sandbox reproduce --case long-persian-filename'],
      ['error', 'reproduced in sbx-32 ✔  (8.2.1 fails · 8.2.0 passes)'],
      ['ok', 'classified: PRODUCT BUG · regression in 8.2.1 · confidence 0.91'],
    ],
    finding: {
      title: 'باگ محصول: خطای خروجی PDF برای پیوست‌هایی با نام طولانی',
      cause: 'در نسخه 8.2.1، منطق کوتاه‌سازی نام فایل در PdfRenderer تغییر کرده و برای نام‌های فارسی بالای ۱۲۰ کاراکتر خطا می‌دهد.',
      impact: '۲۱ خروجی ناموفق از صبح امروز؛ در Sandbox بازتولید شد.',
      confidence: 91,
      evidence: ['NullReferenceException @ PdfRenderer:412', 'بازتولید در sbx-32', 'تغییر کد بین 8.2.0 و 8.2.1'],
      workaround: 'تا انتشار اصلاحیه، نام پیوست را کوتاه‌تر از ۱۲۰ کاراکتر کنید.',
    },
    fix: null,
    traditional: { time: '≈ ۲ تا ۳ روز تا رسیدن به تیم توسعه', people: '۴ نفر', questions: '۵ بار' },
  },

  performance: {
    id: 'performance',
    label: 'کندی شدید سامانه از صبح',
    type: 'fix',
    level: 'سطح ۲ — زیرساخت سرور مشتری',
    logs: [
      ['info', '$ yara-probe connect srv-office-01 --mode=read-only'],
      ['ok', 'connected · session=YRA-3B10 · expires in 30m'],
      ['info', '$ yara-probe check resources'],
      ['ok', 'CPU 31% · RAM 58%'],
      ['error', 'Disk D:\\ (logs) 97% used · 2.1 GB free'],
      ['info', '$ yara-probe config get Logging.Level'],
      ['warn', 'Logging.Level = DEBUG (set 2026-09-28 by support session S-552)'],
      ['warn', 'log growth: 14 GB/day · IO wait 62%'],
      ['ok', 'root cause identified · confidence 0.89'],
    ],
    finding: {
      title: 'پرشدن دیسک لاگ به‌خاطر فعال‌ماندن حالت Debug',
      cause: 'حالت Debug لاگ از جلسه پشتیبانی ۶ مهر روشن مانده و روزانه ۱۴ گیگابایت لاگ تولید می‌کند؛ دیسک لاگ ۹۷٪ پر است.',
      impact: 'زمان پاسخ صفحات ۸ برابر شده است.',
      confidence: 89,
      evidence: ['Disk D: 97%', 'Logging.Level=DEBUG', 'KB-150'],
    },
    fix: {
      id: 'archive_logs_disable_debug',
      title: 'برگرداندن سطح لاگ به INFO و فشرده‌سازی لاگ‌های قدیمی‌تر از ۷ روز',
      risk: 'کم — بدون تغییر داده',
      sandboxLogs: [
        ['info', '$ yara-sandbox clone srv-office-01 --config-only'],
        ['ok', 'sandbox sbx-33 ready'],
        ['info', '$ apply fix archive_logs_disable_debug --target sbx-33'],
        ['ok', 'Logging.Level → INFO · archive plan: 46 GB → 5 GB'],
        ['ok', 'service restart test passed'],
      ],
      sandboxResult: 'تنظیم لاگ برگشت و آرشیو آزمایشی بدون خطا انجام شد.',
      applyLogs: [
        ['info', '$ yara-probe backup config --tag pre-YRA-3B10'],
        ['ok', 'backup saved · rollback ready'],
        ['info', '$ apply fix archive_logs_disable_debug --target srv-office-01'],
        ['ok', 'Logging.Level → INFO'],
        ['ok', 'archived 41 GB · Disk D: 38% used'],
        ['ok', 'page response p95: 4.8s → 0.6s ✔'],
      ],
      result: 'سطح لاگ اصلاح شد، ۴۱ گیگابایت آزاد شد و زمان پاسخ به حالت عادی برگشت.',
    },
    traditional: { time: '≈ نصف روز کاری', people: '۲ نفر', questions: '۳ بار' },
  },

  other: {
    id: 'other',
    label: 'مسئله ناشناخته',
    type: 'unknown',
    level: 'نامشخص',
    logs: [
      ['info', '$ yara-probe connect srv-office-01 --mode=read-only'],
      ['ok', 'connected'],
      ['info', '$ yara-probe check services && check resources'],
      ['ok', 'all services running · resources normal'],
      ['warn', 'no matching error signature found'],
    ],
    finding: {
      title: 'علت قطعی پیدا نشد',
      cause: 'سرویس‌ها و منابع سالم‌اند و الگوی خطای شناخته‌شده‌ای پیدا نشد.',
      impact: 'نیاز به بررسی کارشناس.',
      confidence: 35,
      evidence: ['سرویس‌ها سالم', 'بدون خطای ثبت‌شده'],
    },
    fix: null,
    traditional: { time: '—', people: '—', questions: '—' },
  },
}

export const FIX_INDEX = Object.fromEntries(
  Object.values(SCENARIOS)
    .filter((s) => s.fix)
    .map((s) => [s.fix.id, s]),
)

export const SEED_TICKETS = [
  { id: 'YRA-2291', org: 'شرکت آب منطقه‌ای (نمونه)', title: 'تعریف جانشین در زمان مرخصی', level: 'L1', status: 'auto', time: '۱:۴۰' },
  { id: 'YRA-2290', org: 'دانشگاه نمونه', title: 'قفل‌شدن حساب پس از تغییر رمز در AD', level: 'L2', status: 'auto', time: '۳:۱۲' },
  { id: 'YRA-2288', org: 'شهرداری منطقه ۲ (نمونه)', title: 'خطای همگام‌سازی ایمیل سازمانی', level: 'L3', status: 'escalated', time: '۴:۰۵' },
  { id: 'YRA-2286', org: 'بیمارستان نمونه', title: 'کندی جست‌وجوی بایگانی', level: 'L2', status: 'auto', time: '۵:۳۰' },
  { id: 'YRA-2285', org: 'سازمان نمونه توسعه شهری', title: 'تغییر امضای دیجیتال مدیرعامل', level: 'L1', status: 'auto', time: '۲:۰۱' },
  { id: 'YRA-2283', org: 'شرکت حمل‌ونقل نمونه', title: 'گزارش‌ساز خروجی Excel خالی می‌دهد', level: 'L3', status: 'escalated', time: '۳:۴۴' },
]

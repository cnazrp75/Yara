import CallPanel from '../components/CallPanel'
import Pipeline from '../components/Pipeline'
import Transcript from '../components/Transcript'
import OpsPanel from '../components/OpsPanel'
import OutcomeBanner from '../components/OutcomeBanner'
import { useStore } from '../engine/store'

export default function DemoPage({ session }) {
  const mode = useStore((s) => s.mode)
  return (
    <main className="demo">
      <Pipeline />
      <OutcomeBanner />
      <div className="demo-grid">
        <CallPanel session={session} />
        <Transcript />
        <OpsPanel />
      </div>
      <p className="disclaimer">
        {mode === 'live'
          ? 'در این دمو، صدا و مدل زبانی از ElevenLabs (ابری) استفاده می‌کنند تا امکان مکالمه زنده نشان داده شود. در نسخه واقعی، همین Agent با مدل‌های محلی (LLM، Whisper و TTS) روی زیرساخت خود سازمان اجرا می‌شود.'
          : 'حالت دمو آفلاین: گفت‌وگو از پیش نوشته شده، اما ابزارها، محافظ‌های ایمنی و تأییدهای ادمین همان نسخه زنده‌اند.'}{' '}
        همه داده‌ها، سازمان‌ها و لاگ‌ها ساختگی‌اند.
      </p>
    </main>
  )
}

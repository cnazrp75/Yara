import { ConversationProvider } from '@elevenlabs/react'
import Header from './components/Header'
import IntroPage from './pages/IntroPage'
import DemoPage from './pages/DemoPage'
import DashboardPage from './pages/DashboardPage'
import RoiPage from './pages/RoiPage'
import ArchPage from './pages/ArchPage'
import { useStore } from './engine/store'
import { useYaraSession } from './engine/useYaraSession'

function Shell() {
  const page = useStore((s) => s.page)
  const session = useYaraSession()
  return (
    <div className="app">
      <div className="bg-glow" />
      <Header />
      {page === 'intro' && <IntroPage />}
      {page === 'demo' && <DemoPage session={session} />}
      {page === 'dashboard' && <DashboardPage />}
      {page === 'roi' && <RoiPage />}
      {page === 'arch' && <ArchPage />}
      <footer className="footer">
        YARA · تیم Golden Gate · رویداد پُل ۱۴۰۵ — همه داده‌های نمایشی ساختگی‌اند
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ConversationProvider>
      <Shell />
    </ConversationProvider>
  )
}

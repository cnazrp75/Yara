import { useRef, useCallback } from 'react'
import { useConversation } from '@elevenlabs/react'
import { tools } from './tools'
import { runScript } from './script'
import { getState, setState, setStep, addMessage, resetCase, now } from './store'

export function useYaraSession() {
  const cancelRef = useRef(false)

  const conversation = useConversation({
    onConnect: () => {
      setState({ call: 'active', startedAt: now(), error: null })
      setStep('receive', 'active')
    },
    onDisconnect: () => {
      if (getState().call === 'active' || getState().call === 'connecting') {
        setState({ call: 'ended', endedAt: now() })
      }
      getState().approval?.resolve(false)
    },
    onMessage: ({ message, role, source }) => {
      const r = role === 'agent' || source === 'ai' ? 'agent' : 'user'
      addMessage(r, message)
    },
    onError: (message) => {
      setState({ error: typeof message === 'string' ? message : 'خطا در ارتباط با ElevenLabs' })
    },
  })

  const start = useCallback(async () => {
    resetCase()
    const { mode, scenario, agentId } = getState()

    if (mode === 'scripted') {
      cancelRef.current = false
      setState({ call: 'active', startedAt: now() })
      setStep('receive', 'active')
      runScript(scenario, () => cancelRef.current)
      return
    }

    if (!agentId) {
      setState({ error: 'شناسه Agent ElevenLabs تنظیم نشده است. از دکمه تنظیمات وارد کنید یا حالت «دمو آفلاین» را انتخاب کنید.' })
      return
    }

    setState({ call: 'connecting', startedAt: now() })
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setState({ call: 'idle', error: 'دسترسی به میکروفون داده نشد.' })
      return
    }
    conversation.startSession({ agentId, connectionType: 'webrtc', clientTools: tools })
  }, [conversation])

  const stop = useCallback(() => {
    const { mode } = getState()
    getState().approval?.resolve(false)
    if (mode === 'scripted') cancelRef.current = true
    else conversation.endSession()
    setState({ call: 'ended', endedAt: now(), speaking: null })
  }, [conversation])

  return { start, stop, conversation }
}

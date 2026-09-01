'use client'

import { useEffect, useRef, useState } from 'react'

type MessageDetail = {
  text: string
  tone?: 'success' | 'error'
}

export default function Message() {
  const [message, setMessage] = useState<MessageDetail | null>(null)
  const [visible, setVisible] = useState(false)
  const frame = useRef<number | null>(null)
  const hideTimer = useRef<number | null>(null)
  const removeTimer = useRef<number | null>(null)

  useEffect(() => {
    const clearTimers = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      if (hideTimer.current !== null) clearTimeout(hideTimer.current)
      if (removeTimer.current !== null) clearTimeout(removeTimer.current)
    }

    const showMessage = (event: Event) => {
      const detail = (event as CustomEvent<MessageDetail>).detail
      if (!detail?.text) return

      clearTimers()
      setVisible(false)
      setMessage(detail)
      frame.current = requestAnimationFrame(() => setVisible(true))
      hideTimer.current = window.setTimeout(() => setVisible(false), 3000)
      removeTimer.current = window.setTimeout(() => setMessage(null), 3260)
    }

    window.addEventListener('portfolio:message', showMessage)
    return () => {
      window.removeEventListener('portfolio:message', showMessage)
      clearTimers()
    }
  }, [])

  if (!message) return null

  return (
    <div
      className={`message ${visible ? 'is-visible' : ''} ${message.tone === 'error' ? 'is-error' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {message.tone === 'error'
          ? <path d="M7 7l10 10M17 7 7 17" />
          : <path d="m5 12 4 4L19 6" />}
      </svg>
      <span>{message.text}</span>
    </div>
  )
}

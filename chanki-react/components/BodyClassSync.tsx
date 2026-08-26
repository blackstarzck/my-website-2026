'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/useUIStore'

export default function BodyClassSync() {
  const origenOn = useUIStore((s) => s.origenOn)
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.body.classList.toggle('origen', origenOn)
  }, [origenOn])

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
  }, [theme])

  return null
}

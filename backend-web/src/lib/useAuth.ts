'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const storedId = localStorage.getItem('forge_userId')
    if (!storedId && pathname !== '/auth') {
      router.replace('/auth')
    } else {
      setUserId(storedId)
    }
    setIsReady(true)
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem('forge_userId')
    localStorage.removeItem('forge_email')
    localStorage.removeItem('forge_username')
    router.replace('/auth')
  }

  return { userId, isReady, logout }
}

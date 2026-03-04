'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { isHiddenLayoutRoute } from './route-config'

export function ConditionalNavbar() {
  const pathname = usePathname()

  if (isHiddenLayoutRoute(pathname)) {
    return null
  }

  return <Navbar />
}

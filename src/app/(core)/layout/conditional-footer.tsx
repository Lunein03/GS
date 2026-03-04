'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/shared/components/footer'
import { isHiddenLayoutRoute } from './route-config'

export function ConditionalFooter() {
  const pathname = usePathname()

  if (isHiddenLayoutRoute(pathname)) {
    return null
  }

  return <Footer />
}

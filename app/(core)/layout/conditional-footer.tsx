'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  const hideFooterOnModules = ['/patrimonio', '/drive-qr']
  const shouldHideFooter = hideFooterOnModules.some((routePrefix) => pathname?.startsWith(routePrefix))
  
  if (shouldHideFooter) {
    return null
  }
  
  return <Footer />
}
'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  const hideNavbarOnModules = ['/patrimonio', '/drive-qr']
  const shouldHideNavbar = hideNavbarOnModules.some((routePrefix) => pathname?.startsWith(routePrefix))
  
  if (shouldHideNavbar) {
    return null
  }
  
  return <Navbar />
}
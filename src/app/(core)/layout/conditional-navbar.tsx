'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  const hideNavbarOnModules = ['/patrimonio', '/drive-qr', '/gs-propostas']
  const shouldHideNavbar = hideNavbarOnModules.some((routePrefix) => pathname?.startsWith(routePrefix))
  
  if (shouldHideNavbar) {
    return null
  }
  
  return <Navbar />
}
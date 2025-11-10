'use client'

import { useEffect } from 'react'

export function ParallaxBackground() {
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (ticking) {
        return
      }

      window.requestAnimationFrame(() => {
        const noiseSpeed = 0.07
        const noiseYPos = currentScrollY * noiseSpeed
        document.documentElement.style.setProperty('--noise-parallax-y', `${noiseYPos}px`)

        ticking = false
      })

      ticking = true
    }

    // Adicionar listener apenas se não estiver em dispositivo móvel (melhor performance)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}

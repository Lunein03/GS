"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

function ThemeTransitionEffect({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()
  const [key, setKey] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  React.useEffect(() => {
    if (!mounted) return
    setKey(prev => prev + 1)
  }, [theme, resolvedTheme, mounted])
  
  if (!mounted) {
    return <>{children}</>
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ 
          opacity: 0, 
          scale: 0.95,
          rotateX: 5,
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotateX: 0,
        }}
        exit={{ 
          opacity: 0, 
          scale: 1.05,
          rotateX: -5,
        }}
        transition={{
          duration: 0.35,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ 
          width: '100%', 
          minHeight: '100vh',
          transformPerspective: 1000,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeTransitionEffect>
        {children}
      </ThemeTransitionEffect>
    </NextThemesProvider>
  )
} 
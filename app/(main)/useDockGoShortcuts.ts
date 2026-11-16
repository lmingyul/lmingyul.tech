'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'

import { navigationItems } from '~/config/nav'

export const GO_TIMEOUT_MS = 1000

/** Two-key `G` then `<key>` navigation chords. */
export const DOCK_GO_SHORTCUTS: Record<string, string> = {
  h: '/',
  b: '/blog',
  i: '/ai',
  g: '/guestbook',
  a: '/about',
  p: '/projects',
  q: '/ama',
}

/** Returns the uppercase chord key for a dock route, e.g. `/` -> `"H"`. */
export function dockGoKeyFor(href: string): string | undefined {
  const entry = Object.entries(DOCK_GO_SHORTCUTS).find(
    ([, path]) => path === href
  )
  return entry?.[0]?.toUpperCase()
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

/**
 * Registers global `G` -> `<key>` keyboard chords for currently enabled nav routes.
 */
export function useDockGoShortcuts({
  onNavigate,
}: {
  onNavigate?: (href: string, keyboardInitiated: boolean) => void
}) {
  const router = useRouter()
  const pendingGoRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate

  const enabledRoutes = useMemo(
    () => new Set<string>(navigationItems.map((item) => item.href)),
    []
  )

  useEffect(() => {
    function clearPending() {
      pendingGoRef.current = false
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    function armGo() {
      pendingGoRef.current = true
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(clearPending, GO_TIMEOUT_MS)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        clearPending()
        return
      }
      if (event.repeat) return
      if (isTypingTarget(event.target)) {
        clearPending()
        return
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

      if (!pendingGoRef.current) {
        if (key === 'g') {
          event.preventDefault()
          armGo()
        }
        return
      }

      if (key === 'Escape') {
        event.preventDefault()
        clearPending()
        return
      }

      // Resolve before checking re-arm so `G` then `G` navigates to /guestbook.
      const href = DOCK_GO_SHORTCUTS[key]
      clearPending()
      if (!href || !enabledRoutes.has(href)) return

      event.preventDefault()
      onNavigateRef.current?.(href, true)
      router.push(href)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      clearPending()
    }
  }, [enabledRoutes, router])
}

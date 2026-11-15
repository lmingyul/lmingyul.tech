'use client'

import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * Computes and positions the sliding active dot under the active dock item
 * using offsetLeft/offsetWidth (transform-invariant during dock scale animation).
 */
export function useDockActiveIndicator(activeKey: string | undefined) {
  const dockRef = useRef<HTMLElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>())
  const activeKeyRef = useRef(activeKey)
  const keyboardNavigationRef = useRef(false)
  const indicatorFrameRef = useRef<number | null>(null)

  const registerItem = useCallback(
    (key: string, element: HTMLAnchorElement | null) => {
      if (element) itemRefs.current.set(key, element)
      else itemRefs.current.delete(key)
    },
    []
  )

  const clearIndicatorFrame = useCallback(() => {
    if (indicatorFrameRef.current === null) return
    window.cancelAnimationFrame(indicatorFrameRef.current)
    indicatorFrameRef.current = null
  }, [])

  const positionIndicator = useCallback(
    (instant: boolean) => {
      const dock = dockRef.current
      const indicator = indicatorRef.current
      const key = activeKeyRef.current
      const activeItem = key ? itemRefs.current.get(key) : undefined

      if (!dock || !indicator || !activeItem) {
        indicator?.removeAttribute('data-ready')
        return
      }

      // Local layout offsets stay accurate while .dock scales between 0.96 and 1
      const center = activeItem.offsetLeft + activeItem.offsetWidth / 2
      const shouldSnap = instant || !indicator.hasAttribute('data-ready')

      clearIndicatorFrame()
      if (shouldSnap) indicator.setAttribute('data-instant', '')

      indicator.style.setProperty('--dock-indicator-x', `${center}px`)
      indicator.setAttribute('data-ready', '')

      if (shouldSnap) {
        indicatorFrameRef.current = window.requestAnimationFrame(() => {
          indicatorFrameRef.current = window.requestAnimationFrame(() => {
            indicatorFrameRef.current = null
            indicator.removeAttribute('data-instant')
          })
        })
      }
    },
    [clearIndicatorFrame]
  )

  const handleNavigate = useCallback((href: string, keyboardInitiated: boolean) => {
    keyboardNavigationRef.current =
      href !== activeKeyRef.current && keyboardInitiated
  }, [])

  useLayoutEffect(() => {
    activeKeyRef.current = activeKey
    positionIndicator(keyboardNavigationRef.current)
    keyboardNavigationRef.current = false
  }, [activeKey, positionIndicator])

  useLayoutEffect(() => {
    const dock = dockRef.current
    if (!dock || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => positionIndicator(true))
    observer.observe(dock)

    return () => observer.disconnect()
  }, [positionIndicator])

  useLayoutEffect(() => () => clearIndicatorFrame(), [clearIndicatorFrame])

  return { dockRef, indicatorRef, registerItem, handleNavigate }
}

'use client'

import {
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
} from 'd3-geo'
import { useTheme } from 'next-themes'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { feature, mesh } from 'topojson-client'
import worldAtlas from 'world-atlas/countries-110m.json'

import { getMessages, type Locale } from '~/lib/i18n'
import { type VisitorGeoPoint, type VisitorMapResponse } from '~/lib/visitor-geo'

const MIN_ZOOM = 1
const MAX_ZOOM = 7
const DEFAULT_ROTATION: [number, number] = [-108, -24]

type ScreenPoint = {
  x: number
  y: number
  radius: number
  point: VisitorGeoPoint
  isCurrent: boolean
}

type HoveredState = {
  x: number
  y: number
  point: VisitorGeoPoint
  isCurrent: boolean
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function shortestLngDelta(fromLng: number, toLng: number): number {
  let delta = ((toLng - fromLng + 540) % 360) - 180
  if (delta < -180) delta += 360
  return delta
}

function countryCodeToFlag(code: string): string {
  const cc = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return ''
  return String.fromCodePoint(
    0x1f1e6 + cc.charCodeAt(0) - 65,
    0x1f1e6 + cc.charCodeAt(1) - 65
  )
}

function formatLocationName(point: VisitorGeoPoint): string {
  if (point.city) {
    return `${point.city}, ${point.countryCode}`
  }
  return `${point.country} (${point.countryCode})`
}

export function VisitorWorldMap({ locale }: { locale: Locale }) {
  const t = getMessages(locale).visitorMap
  const { resolvedTheme } = useTheme()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [mapData, setMapData] = useState<VisitorMapResponse | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [zoomDisplay, setZoomDisplay] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isWheelActive, setIsWheelActive] = useState(false)
  const [hovered, setHovered] = useState<HoveredState | null>(null)

  const rotationRef = useRef<[number, number]>([...DEFAULT_ROTATION])
  const zoomRef = useRef(1)
  const targetZoomRef = useRef(1)
  const animRef = useRef<{
    active: boolean
    startTime: number
    duration: number
    fromRot: [number, number]
    toRot: [number, number]
  }>({
    active: false,
    startTime: 0,
    duration: 900,
    fromRot: [...DEFAULT_ROTATION],
    toRot: [...DEFAULT_ROTATION],
  })

  const userInteractedRef = useRef(false)
  const isHoveredRef = useRef(false)
  const isWheelActiveRef = useRef(false)
  const draggingPointerIdRef = useRef<number | null>(null)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchDistanceRef = useRef<number | null>(null)
  const screenPointsRef = useRef<ScreenPoint[]>([])
  const sizeRef = useRef<{ width: number; height: number }>({
    width: 340,
    height: 300,
  })
  const dataRef = useRef<VisitorMapResponse | null>(null)
  const themeRef = useRef(resolvedTheme)

  useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  const { countries, borders, graticule } = useMemo(() => {
    const topo = worldAtlas as unknown as {
      type: 'Topology'
      objects: {
        countries: Parameters<typeof feature>[1] & Parameters<typeof mesh>[1]
      }
    }
    return {
      countries: feature(topo as never, topo.objects.countries),
      borders: mesh(
        topo as never,
        topo.objects.countries as never,
        (a, b) => a !== b
      ),
      graticule: geoGraticule10(),
    }
  }, [])

  const easeRotateTo = useCallback((toRot: [number, number], duration = 900) => {
    animRef.current = {
      active: true,
      startTime: performance.now(),
      duration,
      fromRot: [...rotationRef.current],
      toRot: [toRot[0], clamp(toRot[1], -75, 75)],
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadVisitorMap() {
      try {
        const res = await fetch('/api/visitor-map', {
          cache: 'no-store',
          credentials: 'same-origin',
        })
        if (!res.ok) return
        const json = (await res.json()) as VisitorMapResponse
        if (cancelled) return
        dataRef.current = json
        setMapData(json)
        if (json.current && !userInteractedRef.current) {
          easeRotateTo([-json.current.lng, -json.current.lat], 950)
        }
      } catch {
        // Keep globe usable with empty state if API is temporarily unreachable.
      } finally {
        if (!cancelled) {
          setLoaded(true)
        }
      }
    }
    void loadVisitorMap()
    return () => {
      cancelled = true
    }
  }, [easeRotateTo])

  // Track container dimensions & DPI cleanly without reflow jitter.
  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const syncSize = () => {
      const rect = wrapper.getBoundingClientRect()
      const width = Math.max(220, Math.round(rect.width))
      const height = Math.max(220, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { width, height }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }

    syncSize()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncSize)
      return () => window.removeEventListener('resize', syncSize)
    }

    const observer = new ResizeObserver(syncSize)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  // Blur wheel focus when clicking outside the map card.
  useEffect(() => {
    const handleDocPointerDown = (e: PointerEvent) => {
      if (
        wrapperRef.current &&
        e.target instanceof Node &&
        !wrapperRef.current.contains(e.target)
      ) {
        isWheelActiveRef.current = false
        setIsWheelActive(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWheelActiveRef.current) {
        isWheelActiveRef.current = false
        setIsWheelActive(false)
      }
    }
    document.addEventListener('pointerdown', handleDocPointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handleDocPointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Non-passive wheel listener: only captures scroll when focused or Cmd/Ctrl pressed.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && !isWheelActiveRef.current) {
        return
      }
      e.preventDefault()
      userInteractedRef.current = true
      animRef.current.active = false
      const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14
      const next = clamp(targetZoomRef.current * factor, MIN_ZOOM, MAX_ZOOM)
      targetZoomRef.current = next
      setZoomDisplay(Number(next.toFixed(2)))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [])

  // Main 60fps Canvas render loop; pauses automatically when tab is hidden.
  useEffect(() => {
    let rafId = 0
    let stopped = false

    const renderFrame = (now: number) => {
      if (stopped) return

      const canvas = canvasRef.current
      if (!canvas) {
        rafId = window.requestAnimationFrame(renderFrame)
        return
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { width, height } = sizeRef.current
      const dpr = canvas.width / Math.max(1, width)
      const isDark = themeRef.current === 'dark'

      // Smooth zoom lerp
      const zoomDiff = targetZoomRef.current - zoomRef.current
      if (Math.abs(zoomDiff) > 0.001) {
        zoomRef.current += zoomDiff * 0.16
      } else {
        zoomRef.current = targetZoomRef.current
      }
      const zoom = zoomRef.current

      // Smooth camera transition toward visitor location / reset
      if (animRef.current.active) {
        const elapsed = now - animRef.current.startTime
        const progress = clamp(elapsed / animRef.current.duration, 0, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const dLng = shortestLngDelta(
          animRef.current.fromRot[0],
          animRef.current.toRot[0]
        )
        const dLat = animRef.current.toRot[1] - animRef.current.fromRot[1]
        rotationRef.current = [
          animRef.current.fromRot[0] + dLng * eased,
          clamp(animRef.current.fromRot[1] + dLat * eased, -75, 75),
        ]
        if (progress >= 1) {
          animRef.current.active = false
        }
      } else if (
        !userInteractedRef.current &&
        !isHoveredRef.current &&
        draggingPointerIdRef.current === null &&
        zoom <= 1.1
      ) {
        // Gentle idle spin on initial view before user grabs the globe.
        rotationRef.current[0] = (rotationRef.current[0] + 0.045) % 360
      }

      const rot = rotationRef.current
      const baseRadius = Math.min(width, height) * 0.41
      const scale = baseRadius * zoom

      const projection = geoOrthographic()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([rot[0], rot[1], 0])
        .clipAngle(90)

      const path = geoPath(projection, ctx)

      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      // 1. Subtle atmospheric outer halo when zoomed out near sphere form
      const haloAlpha = clamp(1.3 - zoom * 0.35, 0.15, 1)
      const cx = width / 2
      const cy = height / 2
      const atmoGrad = ctx.createRadialGradient(
        cx,
        cy,
        scale * 0.92,
        cx,
        cy,
        scale * 1.18
      )
      if (isDark) {
        atmoGrad.addColorStop(0, `rgba(16, 185, 129, ${0.14 * haloAlpha})`)
        atmoGrad.addColorStop(0.55, `rgba(56, 189, 248, ${0.06 * haloAlpha})`)
        atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      } else {
        atmoGrad.addColorStop(0, `rgba(132, 204, 22, ${0.14 * haloAlpha})`)
        atmoGrad.addColorStop(0.55, `rgba(14, 165, 233, ${0.06 * haloAlpha})`)
        atmoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      }
      ctx.fillStyle = atmoGrad
      ctx.fillRect(0, 0, width, height)

      // 2. Ocean sphere base with subtle 3D spherical shading
      ctx.beginPath()
      path({ type: 'Sphere' })
      const sphereGrad = ctx.createRadialGradient(
        cx - scale * 0.32,
        cy - scale * 0.32,
        scale * 0.1,
        cx,
        cy,
        scale
      )
      if (isDark) {
        sphereGrad.addColorStop(0, '#1e293b')
        sphereGrad.addColorStop(0.65, '#111827')
        sphereGrad.addColorStop(1, '#090d16')
      } else {
        sphereGrad.addColorStop(0, '#f8fafc')
        sphereGrad.addColorStop(0.7, '#eef2f6')
        sphereGrad.addColorStop(1, '#e2e8f0')
      }
      ctx.fillStyle = sphereGrad
      ctx.fill()

      // Clip interior strokes cleanly inside sphere
      ctx.save()
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.clip()

      // 3. Subtle latitude / longitude graticule
      ctx.beginPath()
      path(graticule)
      ctx.strokeStyle = isDark
        ? 'rgba(148, 163, 184, 0.08)'
        : 'rgba(100, 116, 139, 0.1)'
      ctx.lineWidth = 0.65
      ctx.stroke()

      // 4. Vector landmasses + country borders
      ctx.beginPath()
      path(countries as never)
      ctx.fillStyle = isDark ? '#273244' : '#cbd5e1'
      ctx.fill()

      ctx.beginPath()
      path(borders as never)
      ctx.strokeStyle = isDark
        ? 'rgba(148, 163, 184, 0.24)'
        : 'rgba(148, 163, 184, 0.45)'
      ctx.lineWidth = Math.min(1.1, 0.55 + zoom * 0.08)
      ctx.stroke()

      ctx.restore()

      // 5. Crisp sphere outline
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.strokeStyle = isDark
        ? 'rgba(148, 163, 184, 0.25)'
        : 'rgba(100, 116, 139, 0.28)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 6. Plot visitor markers (amber historical first, current red pulsing on top)
      const data = dataRef.current
      const centerGeo: [number, number] = [-rot[0], -rot[1]]
      const nextScreenPoints: ScreenPoint[] = []

      if (data) {
        const currentKey = data.current?.key ?? null
        const pastLocations = data.locations.filter(
          (loc) => loc.key !== currentKey
        )
        const maxCount = Math.max(
          1,
          ...data.locations.map((loc) => Math.max(1, loc.count))
        )
        const logDenom = Math.log1p(maxCount)

        for (const loc of pastLocations) {
          const dist = geoDistance([loc.lng, loc.lat], centerGeo)
          if (dist >= Math.PI / 2 - 0.02) continue
          const projected = projection([loc.lng, loc.lat])
          if (!projected) continue
          const [px, py] = projected
          const ratio = logDenom > 0 ? Math.log1p(loc.count) / logDenom : 0.4
          const coreR = (2.8 + 5.6 * ratio) * Math.pow(zoom, 0.18)
          const glowR = coreR * 3.1

          // Warm amber glow
          const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR)
          glow.addColorStop(
            0,
            isDark ? 'rgba(251, 191, 36, 0.72)' : 'rgba(245, 158, 11, 0.65)'
          )
          glow.addColorStop(
            0.45,
            isDark ? 'rgba(245, 158, 11, 0.26)' : 'rgba(217, 119, 6, 0.22)'
          )
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)')
          ctx.beginPath()
          ctx.arc(px, py, glowR, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()

          // Core dot
          ctx.beginPath()
          ctx.arc(px, py, coreR, 0, Math.PI * 2)
          ctx.fillStyle = isDark ? '#fbbf24' : '#f59e0b'
          ctx.fill()

          // Inner bright specular dot
          ctx.beginPath()
          ctx.arc(px, py, Math.max(1.1, coreR * 0.36), 0, Math.PI * 2)
          ctx.fillStyle = '#fef3c7'
          ctx.fill()

          nextScreenPoints.push({
            x: px,
            y: py,
            radius: coreR,
            point: loc,
            isCurrent: false,
          })
        }

        if (data.current) {
          const cur = data.current
          const dist = geoDistance([cur.lng, cur.lat], centerGeo)
          if (dist < Math.PI / 2 - 0.02) {
            const projected = projection([cur.lng, cur.lat])
            if (projected) {
              const [px, py] = projected
              const pulsePhase = (now % 2200) / 2200
              const pulseRadius = 5 + pulsePhase * 18
              const pulseAlpha = (1 - pulsePhase) * 0.65

              // Expanding red pulse ring
              ctx.beginPath()
              ctx.arc(px, py, pulseRadius, 0, Math.PI * 2)
              ctx.strokeStyle = `rgba(239, 68, 68, ${pulseAlpha})`
              ctx.lineWidth = 1.6
              ctx.stroke()

              // Persistent red glow
              const redGlow = ctx.createRadialGradient(px, py, 0, px, py, 16)
              redGlow.addColorStop(0, 'rgba(239, 68, 68, 0.7)')
              redGlow.addColorStop(0.45, 'rgba(239, 68, 68, 0.24)')
              redGlow.addColorStop(1, 'rgba(239, 68, 68, 0)')
              ctx.beginPath()
              ctx.arc(px, py, 16, 0, Math.PI * 2)
              ctx.fillStyle = redGlow
              ctx.fill()

              // Core red dot
              const coreR = 4.5 * Math.pow(zoom, 0.14)
              ctx.beginPath()
              ctx.arc(px, py, coreR, 0, Math.PI * 2)
              ctx.fillStyle = '#ef4444'
              ctx.fill()

              ctx.beginPath()
              ctx.arc(px, py, 1.7, 0, Math.PI * 2)
              ctx.fillStyle = '#ffe4e6'
              ctx.fill()

              nextScreenPoints.push({
                x: px,
                y: py,
                radius: coreR + 2,
                point: cur,
                isCurrent: true,
              })
            }
          }
        }
      }

      screenPointsRef.current = nextScreenPoints
      ctx.restore()
      rafId = window.requestAnimationFrame(renderFrame)
    }

    const startLoop = () => {
      if (!rafId && !stopped && document.visibilityState !== 'hidden') {
        rafId = window.requestAnimationFrame(renderFrame)
      }
    }
    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
      }
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopLoop()
      } else {
        startLoop()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    startLoop()
    return () => {
      stopped = true
      stopLoop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [borders, countries, graticule])

  const findHitPoint = useCallback(
    (localX: number, localY: number): ScreenPoint | null => {
      let best: ScreenPoint | null = null
      let bestDist = Infinity
      for (const item of screenPointsRef.current) {
        const dx = localX - item.x
        const dy = localY - item.y
        const dist = Math.hypot(dx, dy)
        const threshold = Math.max(14, item.radius + 7)
        if (dist <= threshold && dist < bestDist) {
          best = item
          bestDist = dist
        }
      }
      return best
    },
    []
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    isWheelActiveRef.current = true
    setIsWheelActive(true)
    userInteractedRef.current = true
    animRef.current.active = false

    canvas.setPointerCapture(e.pointerId)
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values())
      pinchDistanceRef.current = Math.hypot(
        pts[0]!.x - pts[1]!.x,
        pts[0]!.y - pts[1]!.y
      )
      draggingPointerIdRef.current = null
      setIsDragging(false)
      return
    }

    draggingPointerIdRef.current = e.pointerId
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)

    const rect = canvas.getBoundingClientRect()
    const hit = findHitPoint(e.clientX - rect.left, e.clientY - rect.top)
    if (hit) {
      setHovered({
        x: hit.x,
        y: hit.y,
        point: hit.point,
        isCurrent: hit.isCurrent,
      })
    } else {
      setHovered(null)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }

    // Touch pinch-to-zoom
    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values())
      const dist = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y)
      if (pinchDistanceRef.current && pinchDistanceRef.current > 0) {
        const scaleRatio = dist / pinchDistanceRef.current
        const next = clamp(
          targetZoomRef.current * scaleRatio,
          MIN_ZOOM,
          MAX_ZOOM
        )
        targetZoomRef.current = next
        setZoomDisplay(Number(next.toFixed(2)))
      }
      pinchDistanceRef.current = dist
      return
    }

    if (draggingPointerIdRef.current === e.pointerId && lastPointerRef.current) {
      const dx = e.clientX - lastPointerRef.current.x
      const dy = e.clientY - lastPointerRef.current.y
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      const sensitivity = 0.42 / Math.max(1, zoomRef.current * 0.78)
      rotationRef.current = [
        rotationRef.current[0] + dx * sensitivity,
        clamp(rotationRef.current[1] - dy * sensitivity, -75, 75),
      ]
      setHovered(null)
      return
    }

    const rect = canvas.getBoundingClientRect()
    const hit = findHitPoint(e.clientX - rect.left, e.clientY - rect.top)
    if (hit) {
      setHovered({
        x: hit.x,
        y: hit.y,
        point: hit.point,
        isCurrent: hit.isCurrent,
      })
    } else if (hovered) {
      setHovered(null)
    }
  }

  const handlePointerUpOrCancel = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    activePointersRef.current.delete(e.pointerId)
    if (activePointersRef.current.size < 2) {
      pinchDistanceRef.current = null
    }
    if (draggingPointerIdRef.current === e.pointerId) {
      draggingPointerIdRef.current = null
      lastPointerRef.current = null
      setIsDragging(false)
    }
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture already released
    }
  }

  const handleZoomIn = () => {
    userInteractedRef.current = true
    const next = clamp(targetZoomRef.current * 1.45, MIN_ZOOM, MAX_ZOOM)
    targetZoomRef.current = next
    setZoomDisplay(Number(next.toFixed(2)))
  }

  const handleZoomOut = () => {
    userInteractedRef.current = true
    const raw = targetZoomRef.current / 1.45
    const next = raw < 1.15 ? MIN_ZOOM : clamp(raw, MIN_ZOOM, MAX_ZOOM)
    targetZoomRef.current = next
    setZoomDisplay(Number(next.toFixed(2)))
  }

  const handleReset = () => {
    userInteractedRef.current = false
    targetZoomRef.current = MIN_ZOOM
    setZoomDisplay(MIN_ZOOM)
    setHovered(null)
    const cur = dataRef.current?.current
    if (cur) {
      easeRotateTo([-cur.lng, -cur.lat], 850)
    } else {
      easeRotateTo(DEFAULT_ROTATION, 850)
    }
  }

  const handleDoubleClick = () => {
    userInteractedRef.current = true
    if (targetZoomRef.current >= MAX_ZOOM - 0.5) {
      handleReset()
      return
    }
    const next = clamp(targetZoomRef.current * 1.65, MIN_ZOOM, MAX_ZOOM)
    targetZoomRef.current = next
    setZoomDisplay(Number(next.toFixed(2)))
  }

  const currentPoint = mapData?.current ?? null
  const currentLabel = currentPoint
    ? `${countryCodeToFlag(currentPoint.countryCode)} ${formatLocationName(currentPoint)}`.trim()
    : loaded
      ? t.waiting
      : t.loading
  const totalLocations = mapData?.totalLocations ?? 0

  const tooltipLeft = hovered
    ? clamp(hovered.x, 78, Math.max(78, sizeRef.current.width - 78))
    : 0
  const tooltipTop = hovered ? (hovered.y < 64 ? hovered.y + 18 : hovered.y - 16) : 0
  const tooltipBelow = hovered ? hovered.y < 64 : false

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => {
        isHoveredRef.current = true
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false
        setHovered(null)
      }}
      className={[
        'group relative h-[280px] w-full select-none overflow-hidden rounded-2xl border bg-zinc-50/85 shadow-sm backdrop-blur-sm transition-colors sm:h-[300px] lg:h-[296px] xl:h-[316px]',
        'dark:bg-zinc-900/75',
        isWheelActive
          ? 'border-lime-500/60 dark:border-lime-400/45'
          : 'border-zinc-200/80 dark:border-zinc-800/90',
      ].join(' ')}
    >
      <canvas
        ref={canvasRef}
        aria-label={t.canvasAria}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onDoubleClick={handleDoubleClick}
        className={[
          'h-full w-full touch-none outline-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
      />

      {/* Top-left current visitor badge */}
      <div className="pointer-events-none absolute left-3 top-3 flex max-w-[calc(100%-5.5rem)] items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/85 px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm backdrop-blur-md dark:border-zinc-700/70 dark:bg-zinc-900/85 dark:text-zinc-200">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span className="truncate">
          {currentPoint ? `${t.youPrefix} · ${currentLabel}` : currentLabel}
        </span>
      </div>

      {/* Top-right place counter badge */}
      {totalLocations > 0 && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-zinc-200/80 bg-white/80 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 backdrop-blur-md dark:border-zinc-700/70 dark:bg-zinc-900/80 dark:text-zinc-400">
          {t.placesCount(totalLocations)}
        </div>
      )}

      {/* Bottom-left minimal legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full border border-zinc-200/75 bg-white/80 px-2.5 py-1 text-[10px] text-zinc-600 backdrop-blur-md dark:border-zinc-700/70 dark:bg-zinc-900/80 dark:text-zinc-300">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
          {t.legendCurrent}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          {t.legendPast}
        </span>
      </div>

      {/* Bottom-right zoom controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white/85 p-1 shadow-sm backdrop-blur-md dark:border-zinc-700/75 dark:bg-zinc-900/85">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomDisplay <= MIN_ZOOM + 0.02}
          aria-label={t.zoomOut}
          title={t.zoomOut}
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-35 dark:text-zinc-200 dark:hover:bg-zinc-700/70"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomDisplay >= MAX_ZOOM - 0.05}
          aria-label={t.zoomIn}
          title={t.zoomIn}
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-35 dark:text-zinc-200 dark:hover:bg-zinc-700/70"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label={t.resetView}
          title={t.resetView}
          className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-700/70"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="4.5" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Hover / Tap Tooltip */}
      {hovered && (
        <div
          style={{
            left: `${tooltipLeft}px`,
            top: `${tooltipTop}px`,
            transform: tooltipBelow
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
          }}
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-zinc-200/90 bg-white/95 px-2.5 py-1.5 text-[11px] shadow-md backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95"
        >
          <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
            <span
              className={[
                'h-2 w-2 shrink-0 rounded-full',
                hovered.isCurrent ? 'bg-red-500' : 'bg-amber-400',
              ].join(' ')}
            />
            <span>{countryCodeToFlag(hovered.point.countryCode)}</span>
            <span>{formatLocationName(hovered.point)}</span>
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
            {hovered.isCurrent ? `${t.youHere} · ` : ''}
            {t.visitsCount(hovered.point.count)}
          </div>
        </div>
      )}
    </div>
  )
}

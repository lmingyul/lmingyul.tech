'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Container } from '~/components/ui/Container'
import {
  getMessages,
  type Locale,
  localeFromPathname,
  PHOTO_CAPTIONS_BY_LOCALE,
} from '~/lib/i18n'

const RESTING_ROTATIONS = [-0.8, 1.1, -1.5, 1.9, -2.4, 2.8, -3.2, 2.5, -3.6]
const RESTING_Y_OFFSETS = [0, 2, -2, 3, -3, 4, -4, 3, -2]

interface DeckLayout {
  padX: number
  cardWidth: number
  cardHeight: number
  xs: number[]
  bands: [number, number][]
}

function computeDeckLayout(containerWidth: number, count: number): DeckLayout {
  const padX = 8
  const cardWidth = Math.round(
    Math.min(260, Math.max(132, containerWidth * 0.252))
  )
  const cardHeight = Math.round(cardWidth * 0.75)

  if (count <= 1) {
    return {
      padX,
      cardWidth,
      cardHeight,
      xs: count === 1 ? [padX] : [],
      bands: count === 1 ? [[0, containerWidth]] : [],
    }
  }

  const span = Math.max(0, containerWidth - padX * 2 - cardWidth)
  const denom = Math.max(1, count - 2)
  const raw: number[] = []
  let totalRaw = 0
  for (let i = 0; i < count - 1; i++) {
    const weight = Math.pow(1 - i / denom, 2.15) + 0.128
    raw.push(weight)
    totalRaw += weight
  }

  const xs: number[] = [padX]
  for (let i = 0; i < raw.length; i++) {
    const step = totalRaw > 0 ? (raw[i] / totalRaw) * span : 0
    xs.push(xs[xs.length - 1] + step)
  }

  const bands: [number, number][] = []
  for (let idx = 0; idx < count; idx++) {
    if (idx === 0) {
      bands.push([0, xs[0] + cardWidth])
    } else if (idx < count - 1) {
      bands.push([xs[idx - 1] + cardWidth, xs[idx] + cardWidth])
    } else {
      bands.push([xs[idx - 1] + cardWidth, containerWidth])
    }
  }

  return { padX, cardWidth, cardHeight, xs, bands }
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function Photos({
  photos,
  locale: localeProp,
}: {
  photos: string[]
  locale?: Locale
}) {
  const pathname = usePathname()
  const locale = localeProp ?? localeFromPathname(pathname)
  const t = getMessages(locale).photos

  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    const node = stageRef.current
    if (!node) return

    const updateWidth = () => {
      const nextWidth = Math.round(node.getBoundingClientRect().width)
      setContainerWidth((prev) => (prev === nextWidth ? prev : nextWidth))
    }

    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver(() => {
      updateWidth()
    })
    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

  const layout = React.useMemo(
    () =>
      computeDeckLayout(
        containerWidth > 0 ? containerWidth : 960,
        photos.length
      ),
    [containerWidth, photos.length]
  )

  const findBandIndex = React.useCallback(
    (relX: number): number | null => {
      if (photos.length === 0 || layout.bands.length === 0) return null
      const widthLimit = containerWidth > 0 ? containerWidth : 960
      const clampedX = clamp(relX, 0, widthLimit)
      for (let i = 0; i < layout.bands.length; i++) {
        const [start, end] = layout.bands[i]
        if (clampedX >= start && clampedX <= end) {
          return i
        }
      }
      return clampedX <= 0 ? 0 : photos.length - 1
    },
    [containerWidth, layout.bands, photos.length]
  )

  if (photos.length === 0) {
    return null
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nextIdx = findBandIndex(e.clientX - rect.left)
    setActiveIndex((prev) => (prev === nextIdx ? prev : nextIdx))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const hit = findBandIndex(e.clientX - rect.left)
    if (hit === null) return
    setActiveIndex((prev) => (prev === hit ? null : hit))
  }

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    setActiveIndex(null)
  }

  const stageHeight = layout.cardHeight + 32

  return (
    <Container className="mt-16 sm:mt-20">
      <motion.div
        ref={stageRef}
        className="relative w-full touch-pan-y select-none"
        style={{
          height: stageHeight,
          opacity: containerWidth > 0 ? 1 : 0,
        }}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: containerWidth > 0 ? 1 : 0, y: 0 }}
        transition={
          shouldReduceMotion ? { duration: 0 } : { delay: 0.35, type: 'spring' }
        }
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
      >
        {photos.map((image, idx) => {
          const meta = PHOTO_CAPTIONS_BY_LOCALE[image]?.[locale]
          const isActive = activeIndex === idx
          const baseX = layout.xs[idx] ?? layout.padX
          const effectiveWidth = containerWidth > 0 ? containerWidth : 960

          let targetX = baseX
          if (isActive) {
            const minActiveX = layout.padX + layout.cardWidth * 0.025
            const maxActiveX =
              effectiveWidth - layout.padX - layout.cardWidth * 1.025
            targetX =
              minActiveX <= maxActiveX
                ? clamp(baseX, minActiveX, maxActiveX)
                : (effectiveWidth - layout.cardWidth) / 2
          } else if (activeIndex !== null) {
            const partOffset = idx < activeIndex ? -14 : 14
            const minX = layout.padX
            const maxX = Math.max(
              layout.padX,
              effectiveWidth - layout.padX - layout.cardWidth
            )
            targetX = clamp(baseX + partOffset, minX, maxX)
          }

          const restingY = RESTING_Y_OFFSETS[idx % RESTING_Y_OFFSETS.length]
          const restingRotate =
            RESTING_ROTATIONS[idx % RESTING_ROTATIONS.length]

          return (
            <motion.button
              key={image}
              type="button"
              aria-label={
                meta
                  ? `${meta.location} (${meta.date})`
                  : t.fallbackCaption(idx)
              }
              onFocus={() => setActiveIndex(idx)}
              onBlur={(e) => {
                if (!stageRef.current?.contains(e.relatedTarget as Node | null)) {
                  setActiveIndex(null)
                }
              }}
              className="group absolute left-0 top-4 overflow-hidden rounded-2xl border-2 border-white bg-zinc-100 p-0 text-left shadow-[-6px_10px_24px_-6px_rgba(24,24,27,0.24)] ring-1 ring-zinc-900/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-600 dark:border-zinc-700/90 dark:bg-zinc-800 dark:shadow-[-8px_12px_28px_-6px_rgba(0,0,0,0.6)] dark:ring-white/10 dark:focus-visible:outline-lime-400"
              style={{
                width: layout.cardWidth,
                height: layout.cardHeight,
                zIndex: isActive ? photos.length + 20 : photos.length - idx,
              }}
              initial={false}
              animate={{
                x: targetX,
                y: shouldReduceMotion ? 0 : isActive ? -14 : restingY,
                rotate: shouldReduceMotion ? 0 : isActive ? 0 : restingRotate,
                scale: shouldReduceMotion
                  ? 1
                  : isActive
                  ? 1.05
                  : activeIndex !== null
                  ? 0.985
                  : 1,
                opacity: activeIndex === null || isActive ? 1 : 0.8,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 320,
                      damping: 28,
                      mass: 0.7,
                    }
              }
            >
              <Image
                src={image}
                alt={
                  meta
                    ? `${meta.date} ${meta.location}`
                    : t.fallbackCaption(idx)
                }
                width={640}
                height={480}
                sizes="(min-width: 1024px) 260px, (min-width: 640px) 200px, 150px"
                className="pointer-events-none h-full w-full select-none object-cover"
                unoptimized
                priority={idx < 4}
              />
              {meta && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white transition-opacity duration-200"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  <span className="truncate">{meta.location}</span>
                  <time className="shrink-0 text-white/80">{meta.date}</time>
                </div>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </Container>
  )
}

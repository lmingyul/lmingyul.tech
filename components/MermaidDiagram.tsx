'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { clsxm } from '@zolplay/utils'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import React from 'react'

import { ClipboardCheckIcon, ClipboardDataIcon, XIcon } from '~/assets'
import { getMessages, localeFromPathname } from '~/lib/i18n'

const MERMAID_FONT_FAMILY =
  'var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const MIN_SCALE = 0.25
const MAX_SCALE = 3
const SCALE_STEP = 0.2

function loadMermaid() {
  return import('mermaid').then((mod) => mod.default)
}

let mermaidPromise: ReturnType<typeof loadMermaid> | null = null
let renderQueue: Promise<void> = Promise.resolve()

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = loadMermaid().catch((err) => {
      mermaidPromise = null
      throw err
    })
  }
  return mermaidPromise
}

function enqueueMermaidRender<T>(task: () => Promise<T>): Promise<T> {
  const run = renderQueue.then(task, task)
  renderQueue = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

function cleanupMermaidTempNodes(renderId: string) {
  if (typeof document === 'undefined') return
  document.getElementById(`d${renderId}`)?.remove()
  document.getElementById(renderId)?.remove()
}

function getMermaidThemeVariables(isDark: boolean) {
  if (isDark) {
    return {
      darkMode: true,
      background: '#18181b',
      fontFamily: MERMAID_FONT_FAMILY,
      fontSize: '14px',
      primaryColor: '#27272a',
      primaryTextColor: '#f4f4f5',
      primaryBorderColor: '#52525b',
      lineColor: '#a1a1aa',
      secondaryColor: '#1a2e05',
      secondaryTextColor: '#ecfccb',
      secondaryBorderColor: '#65a30d',
      tertiaryColor: '#141417',
      tertiaryTextColor: '#e4e4e7',
      tertiaryBorderColor: '#3f3f46',
      clusterBkg: '#141417',
      clusterBorder: '#3f3f46',
      edgeLabelBackground: '#18181b',
      textColor: '#f4f4f5',
      noteBkgColor: '#27272a',
      noteTextColor: '#f4f4f5',
      noteBorderColor: '#52525b',
    }
  }

  return {
    darkMode: false,
    background: '#ffffff',
    fontFamily: MERMAID_FONT_FAMILY,
    fontSize: '14px',
    primaryColor: '#f4f4f5',
    primaryTextColor: '#18181b',
    primaryBorderColor: '#a1a1aa',
    lineColor: '#71717a',
    secondaryColor: '#ecfccb',
    secondaryTextColor: '#1a2e05',
    secondaryBorderColor: '#84cc16',
    tertiaryColor: '#fafafa',
    tertiaryTextColor: '#27272a',
    tertiaryBorderColor: '#d4d4d8',
    clusterBkg: '#fafafa',
    clusterBorder: '#d4d4d8',
    edgeLabelBackground: '#ffffff',
    textColor: '#18181b',
    noteBkgColor: '#fef9c3',
    noteTextColor: '#18181b',
    noteBorderColor: '#eab308',
  }
}

function clampScale(value: number): number {
  return Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, value)) * 100) / 100
}

function ExpandIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 3H21M21 3V9M21 3L14 10M9 21H3M3 21V15M3 21L10 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CodeBracketsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 18L22 12L16 6M8 6L2 12L8 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DiagramFlowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="15"
        width="7"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 6H14C15.6569 6 17 7.34315 17 9V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const pathname = usePathname()
  const t = getMessages(localeFromPathname(pathname)).mermaid
  const { resolvedTheme } = useTheme()

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const reactId = React.useId()
  const baseId = React.useMemo(
    () => `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId]
  )
  const renderSeqRef = React.useRef(0)
  const prevChartRef = React.useRef(chart)

  const [rendered, setRendered] = React.useState<{
    id: string
    svg: string
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [showSource, setShowSource] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const [scale, setScale] = React.useState(1)
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [viewportEl, setViewportEl] = React.useState<HTMLDivElement | null>(
    null
  )
  const svgBoxRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const copyTimerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    let cancelled = false
    if (prevChartRef.current !== chart) {
      prevChartRef.current = chart
      setRendered(null)
    }
    setError(null)

    renderSeqRef.current += 1
    const renderId = `${baseId}-${renderSeqRef.current}`

    enqueueMermaidRender(async () => {
      if (cancelled) return
      const mermaid = await getMermaid()
      if (cancelled) return

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        htmlLabels: true,
        fontFamily: MERMAID_FONT_FAMILY,
        flowchart: {
          useMaxWidth: false,
          curve: 'basis',
          padding: 14,
        },
        sequence: {
          useMaxWidth: false,
        },
        gantt: {
          useMaxWidth: false,
        },
        themeVariables: getMermaidThemeVariables(isDark),
      })

      try {
        const result = await mermaid.render(renderId, chart)
        if (!cancelled) {
          setRendered({ id: renderId, svg: result.svg })
          setError(null)
        }
      } finally {
        cleanupMermaidTempNodes(renderId)
      }
    }).catch((err) => {
      if (!cancelled) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Mermaid render error')
      }
    })

    return () => {
      cancelled = true
    }
  }, [baseId, chart, isDark, mounted])

  const modalSvg = React.useMemo(() => {
    if (!rendered) return ''
    return rendered.svg.replaceAll(rendered.id, `${rendered.id}-modal`)
  }, [rendered])

  const fitToViewport = React.useCallback(() => {
    const vp = viewportEl
    const box = svgBoxRef.current
    if (!vp || !box) return

    const svgEl = box.querySelector('svg')
    const naturalWidth =
      svgEl?.scrollWidth || svgEl?.clientWidth || box.offsetWidth
    const naturalHeight =
      svgEl?.scrollHeight || svgEl?.clientHeight || box.offsetHeight

    if (!naturalWidth || !naturalHeight) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
      return
    }

    const availableWidth = Math.max(120, vp.clientWidth - 48)
    const availableHeight = Math.max(120, vp.clientHeight - 48)
    const nextScale = clampScale(
      Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight)
    )
    setScale(nextScale)
    setOffset({ x: 0, y: 0 })
  }, [viewportEl])

  React.useEffect(() => {
    if (!isFullscreen || !modalSvg || !viewportEl) return
    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        fitToViewport()
      })
    })
    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [fitToViewport, isFullscreen, modalSvg, viewportEl])

  React.useEffect(() => {
    if (!viewportEl) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const factor = event.deltaY < 0 ? 1.1 : 0.9
      setScale((prev) => clampScale(prev * factor))
    }

    viewportEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      viewportEl.removeEventListener('wheel', handleWheel)
    }
  }, [viewportEl])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(chart)
      setCopied(true)
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      // Clipboard API may be blocked in restricted browser contexts
    }
  }, [chart])

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: offset.x,
        originY: offset.y,
      }
      setIsDragging(true)
    },
    [offset.x, offset.y]
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      setOffset({
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      })
    },
    []
  )

  const handlePointerEnd = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragRef.current = null
      setIsDragging(false)
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    },
    []
  )

  const canExpand = Boolean(rendered && !error)

  const toolbarBtnClass =
    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200/70 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lime-600 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-lime-400'

  return (
    <>
      <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200/70 bg-zinc-50/80 px-3.5 py-2 dark:border-zinc-800 dark:bg-zinc-900/90">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <DiagramFlowIcon className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
            <span>{t.label}</span>
          </span>
          <div className="flex items-center gap-1">
            {!error && (
              <button
                type="button"
                onClick={() => setShowSource((prev) => !prev)}
                className={toolbarBtnClass}
              >
                {showSource ? (
                  <DiagramFlowIcon className="h-3.5 w-3.5" />
                ) : (
                  <CodeBracketsIcon className="h-3.5 w-3.5" />
                )}
                <span>{showSource ? t.viewDiagram : t.viewSource}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className={toolbarBtnClass}
            >
              {copied ? (
                <ClipboardCheckIcon className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
              ) : (
                <ClipboardDataIcon className="h-3.5 w-3.5" />
              )}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
            <button
              type="button"
              disabled={!canExpand}
              onClick={() => setIsFullscreen(true)}
              aria-label={t.expand}
              className={toolbarBtnClass}
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.expand}</span>
            </button>
          </div>
        </div>

        {error ? (
          <div>
            <div className="border-b border-amber-500/20 bg-amber-50/70 px-3.5 py-2 text-xs text-amber-800 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-200">
              {t.renderError}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-zinc-700 dark:text-zinc-300">
              <code>{chart}</code>
            </pre>
          </div>
        ) : showSource ? (
          <pre className="max-h-[70vh] overflow-auto p-4 font-mono text-xs leading-6 text-zinc-700 dark:text-zinc-300">
            <code>{chart}</code>
          </pre>
        ) : !rendered ? (
          <div className="flex min-h-[160px] items-center justify-center px-4 py-8 text-xs text-zinc-400 dark:text-zinc-500">
            {t.loading}
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto p-4 sm:p-6">
            <div
              className="mx-auto w-fit [&_svg]:block [&_svg]:max-w-none"
              dangerouslySetInnerHTML={{ __html: rendered.svg }}
            />
          </div>
        )}
      </figure>

      <DialogPrimitive.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-sm" />
          <DialogPrimitive.Content className="not-prose fixed inset-3 z-[101] flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 shadow-2xl outline-none dark:border-zinc-700/70 dark:bg-zinc-950 sm:inset-6">
            <DialogPrimitive.Description className="sr-only">
              {t.panHint}
            </DialogPrimitive.Description>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 bg-white/90 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/90">
              <DialogPrimitive.Title className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                <DiagramFlowIcon className="h-4 w-4 text-lime-600 dark:text-lime-400" />
                <span>{t.label}</span>
              </DialogPrimitive.Title>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setScale((prev) => clampScale(prev - SCALE_STEP))
                  }
                  aria-label={t.zoomOut}
                  className={toolbarBtnClass}
                >
                  <span className="text-sm leading-none">−</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScale(1)
                    setOffset({ x: 0, y: 0 })
                  }}
                  title={t.resetZoom}
                  className={clsxm(
                    toolbarBtnClass,
                    'min-w-[3.25rem] justify-center tabular-nums'
                  )}
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setScale((prev) => clampScale(prev + SCALE_STEP))
                  }
                  aria-label={t.zoomIn}
                  className={toolbarBtnClass}
                >
                  <span className="text-sm leading-none">+</span>
                </button>
                <button
                  type="button"
                  onClick={fitToViewport}
                  className={toolbarBtnClass}
                >
                  {t.fitView}
                </button>
                <DialogPrimitive.Close
                  aria-label={t.close}
                  className={clsxm(toolbarBtnClass, 'ml-1')}
                >
                  <XIcon className="h-4 w-4" />
                </DialogPrimitive.Close>
              </div>
            </div>

            <div
              ref={setViewportEl}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onDoubleClick={fitToViewport}
              className={clsxm(
                'relative flex flex-1 select-none items-center justify-center overflow-hidden touch-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              )}
            >
              <div
                ref={svgBoxRef}
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                  transformOrigin: 'center center',
                }}
                className="w-fit will-change-transform [&_svg]:block [&_svg]:max-w-none"
                dangerouslySetInnerHTML={{ __html: modalSvg }}
              />

              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200/80 bg-white/90 px-3 py-1 text-[11px] font-medium text-zinc-500 shadow-sm backdrop-blur dark:border-zinc-700/70 dark:bg-zinc-900/90 dark:text-zinc-400">
                {t.panHint}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}

export default MermaidDiagram

'use client'

import { Popover } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'

import portraitImage from '~/assets/Portrait.png'
import portraitAltImage from '~/assets/PortraitAlt.jpg'
import { navigationItems } from '~/config/nav'

import {
  AboutIcon,
  AiSparkIcon,
  AmaIcon,
  GuestbookIcon,
  MonitorMiniIcon,
  MoonMiniIcon,
  PreferencesIcon,
  ProjectsIcon,
  SunMiniIcon,
  WritingIcon,
} from './DockIcons'
import { useDockActiveIndicator } from './useDockActiveIndicator'
import { dockGoKeyFor, useDockGoShortcuts } from './useDockGoShortcuts'

const ROUTE_ICONS: Record<string, React.ComponentType> = {
  '/blog': WritingIcon,
  '/ai': AiSparkIcon,
  '/guestbook': GuestbookIcon,
  '/about': AboutIcon,
  '/projects': ProjectsIcon,
  '/ama': AmaIcon,
}

const THEME_OPTIONS = [
  { value: 'light', label: '浅色', icon: SunMiniIcon },
  { value: 'system', label: '系统', icon: MonitorMiniIcon },
  { value: 'dark', label: '深色', icon: MoonMiniIcon },
] as const

const DOCK_GLASS_STYLE: React.CSSProperties = {
  backdropFilter: 'blur(12px) saturate(1.25)',
  WebkitBackdropFilter: 'blur(12px) saturate(1.25)',
}

function isItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function DockTip({ label, goKey }: { label: string; goKey?: string }) {
  return (
    <span className="dock-tip" aria-hidden="true">
      <span className="dock-tip-label">{label}</span>
      {goKey ? (
        <span className="dock-tip-keys">
          <kbd className="dock-tip-key">G</kbd>
          <kbd className="dock-tip-key">{goKey}</kbd>
        </span>
      ) : null}
    </span>
  )
}

function DockItem({
  href,
  label,
  goKey,
  active,
  pathname,
  itemRef,
  onNavigate,
  onContextMenu,
  children,
}: {
  href: string
  label: string
  goKey?: string
  active: boolean
  pathname: string
  itemRef: (element: HTMLAnchorElement | null) => void
  onNavigate: (href: string, keyboardInitiated: boolean) => void
  onContextMenu?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
  const ariaLabel = goKey ? `${label}，快捷键 G 然后 ${goKey}` : label

  return (
    <Link
      ref={itemRef}
      href={href}
      className="dock-item"
      data-active={active || undefined}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      onContextMenu={onContextMenu}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return
        }
        onNavigate(href, event.detail === 0)
        if (pathname === href) {
          event.preventDefault()
          const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches
          window.scrollTo({
            top: 0,
            behavior: reducedMotion ? 'auto' : 'smooth',
          })
        }
      }}
    >
      {children}
      <DockTip label={label} goKey={goKey} />
    </Link>
  )
}

function DockPopoverAutoClose({
  visible,
  open,
  close,
}: {
  visible: boolean
  open: boolean
  close: () => void
}) {
  useEffect(() => {
    if (!visible && open) {
      close()
    }
  }, [visible, open, close])

  return null
}

function DockPreferences({ visible }: { visible: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const activeTheme = mounted && theme ? theme : 'system'

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <DockPopoverAutoClose visible={visible} open={open} close={close} />
          <Popover.Button
            type="button"
            className="dock-item"
            aria-label="外观设置"
          >
            <PreferencesIcon />
            {!open && <DockTip label="外观" />}
          </Popover.Button>
          <Popover.Panel className="dock-prefs-panel" aria-label="外观设置">
            <div className="dock-prefs-row">
              <span className="dock-prefs-label">外观</span>
              <div
                className="dock-prefs-group"
                role="radiogroup"
                aria-label="外观主题"
              >
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const selected = activeTheme === value
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={label}
                      title={label}
                      data-selected={selected || undefined}
                      className="dock-prefs-option"
                      onClick={() => setTheme(value)}
                    >
                      <Icon />
                    </button>
                  )
                })}
              </div>
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  )
}

export function FloatingDock({
  visible,
  altAvatar,
  onAvatarContextMenu,
}: {
  visible: boolean
  altAvatar: boolean
  onAvatarContextMenu?: (event: React.MouseEvent<HTMLElement>) => void
}) {
  const pathname = usePathname()
  const activeHref = navigationItems.find(({ href }) =>
    isItemActive(pathname, href)
  )?.href
  const { dockRef, indicatorRef, registerItem, handleNavigate } =
    useDockActiveIndicator(activeHref)
  const [tipDismissed, setTipDismissed] = useState(false)

  useDockGoShortcuts({ onNavigate: handleNavigate })

  useEffect(() => {
    if (!visible) {
      setTipDismissed(false)
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setTipDismissed(true)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [visible])

  const homeItem = navigationItems.find((item) => item.href === '/')
  const navIconItems = navigationItems.filter((item) => item.href !== '/')

  return (
    <nav
      ref={dockRef}
      className="dock"
      data-visible={visible || undefined}
      data-tip-dismissed={tipDismissed || undefined}
      aria-label="悬浮导航"
      onPointerMove={() => {
        if (tipDismissed) setTipDismissed(false)
      }}
      onFocus={() => {
        if (tipDismissed) setTipDismissed(false)
      }}
    >
      <span className="dock-glass" aria-hidden="true" style={DOCK_GLASS_STYLE} />
      <span
        ref={indicatorRef}
        className="dock-active-indicator"
        aria-hidden="true"
      />

      {homeItem && (
        <>
          <DockItem
            href={homeItem.href}
            label={homeItem.text}
            goKey={dockGoKeyFor(homeItem.href)}
            active={isItemActive(pathname, homeItem.href)}
            pathname={pathname}
            itemRef={(el) => registerItem(homeItem.href, el)}
            onNavigate={handleNavigate}
            onContextMenu={onAvatarContextMenu}
          >
            <span className="dock-avatar">
              <Image
                src={altAvatar ? portraitAltImage : portraitImage}
                alt=""
                width={26}
                height={26}
                sizes="26px"
              />
            </span>
          </DockItem>
          <span className="dock-rule" aria-hidden="true" />
        </>
      )}

      {navIconItems.map(({ href, text }) => {
        const Icon = ROUTE_ICONS[href] ?? WritingIcon
        return (
          <DockItem
            key={href}
            href={href}
            label={text}
            goKey={dockGoKeyFor(href)}
            active={isItemActive(pathname, href)}
            pathname={pathname}
            itemRef={(el) => registerItem(href, el)}
            onNavigate={handleNavigate}
          >
            <Icon />
          </DockItem>
        )
      })}

      <span className="dock-rule" aria-hidden="true" />
      <DockPreferences visible={visible} />
    </nav>
  )
}

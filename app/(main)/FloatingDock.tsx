'use client'

import { Popover } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'

import portraitImage from '~/assets/Portrait.png'
import portraitAltImage from '~/assets/PortraitAlt.jpg'
import {
  getMessages,
  getNavigationItems,
  localeFromPathname,
  switchLocalePath,
} from '~/lib/i18n'

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

const DOCK_GLASS_STYLE: React.CSSProperties = {
  backdropFilter: 'blur(12px) saturate(1.25)',
  WebkitBackdropFilter: 'blur(12px) saturate(1.25)',
}

function isItemActive(pathname: string, href: string, baseHref: string) {
  if (baseHref === '/') return pathname === href
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
  baseHref,
  label,
  ariaLabel,
  goKey,
  active,
  pathname,
  itemRef,
  onNavigate,
  onContextMenu,
  children,
}: {
  href: string
  baseHref: string
  label: string
  ariaLabel: string
  goKey?: string
  active: boolean
  pathname: string
  itemRef: (element: HTMLAnchorElement | null) => void
  onNavigate: (baseHref: string, keyboardInitiated: boolean) => void
  onContextMenu?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
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
        onNavigate(baseHref, event.detail === 0)
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

function DockPreferences({
  visible,
  pathname,
}: {
  visible: boolean
  pathname: string
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const locale = localeFromPathname(pathname)
  const t = getMessages(locale).nav

  useEffect(() => setMounted(true), [])

  const activeTheme = mounted && theme ? theme : 'system'
  const themeOptions = [
    { value: 'light', label: t.dockLight, icon: SunMiniIcon },
    { value: 'system', label: t.dockSystem, icon: MonitorMiniIcon },
    { value: 'dark', label: t.dockDark, icon: MoonMiniIcon },
  ] as const

  const langOptions = [
    { code: 'zh', label: '中文', htmlLang: 'zh-CN' },
    { code: 'en', label: 'EN', htmlLang: 'en' },
  ] as const

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <DockPopoverAutoClose visible={visible} open={open} close={close} />
          <Popover.Button
            type="button"
            className="dock-item"
            aria-label={t.dockAppearanceSettings}
          >
            <PreferencesIcon />
            {!open && <DockTip label={t.dockAppearance} />}
          </Popover.Button>
          <Popover.Panel
            className="dock-prefs-panel"
            aria-label={t.dockAppearanceSettings}
          >
            <div className="dock-prefs-row">
              <span className="dock-prefs-label">{t.dockAppearance}</span>
              <div
                className="dock-prefs-group"
                role="radiogroup"
                aria-label={t.themeSwitchAria}
              >
                {themeOptions.map(({ value, label, icon: Icon }) => {
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
            <div className="dock-prefs-row">
              <span className="dock-prefs-label">{t.dockLanguage}</span>
              <div className="dock-prefs-group">
                {langOptions.map(({ code, label, htmlLang }) => {
                  const selected = locale === code
                  return (
                    <Link
                      key={code}
                      href={switchLocalePath(pathname || '/', code)}
                      lang={htmlLang}
                      hrefLang={htmlLang}
                      aria-current={selected ? 'true' : undefined}
                      data-selected={selected || undefined}
                      className="dock-prefs-option dock-prefs-lang"
                      onClick={() => close()}
                    >
                      {label}
                    </Link>
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
  const locale = localeFromPathname(pathname)
  const navigationItems = getNavigationItems(locale)
  const t = getMessages(locale).nav
  const activeBaseHref = navigationItems.find(({ href, baseHref }) =>
    isItemActive(pathname, href, baseHref)
  )?.baseHref
  const { dockRef, indicatorRef, registerItem, handleNavigate } =
    useDockActiveIndicator(activeBaseHref)
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

  const homeItem = navigationItems.find((item) => item.baseHref === '/')
  const navIconItems = navigationItems.filter((item) => item.baseHref !== '/')

  return (
    <nav
      ref={dockRef}
      className="dock"
      data-visible={visible || undefined}
      data-tip-dismissed={tipDismissed || undefined}
      aria-label={t.dockAriaLabel}
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
            baseHref={homeItem.baseHref}
            label={homeItem.text}
            ariaLabel={(() => {
              const key = dockGoKeyFor(homeItem.baseHref)
              return key ? t.shortcutHint(homeItem.text, key) : homeItem.text
            })()}
            goKey={dockGoKeyFor(homeItem.baseHref)}
            active={isItemActive(pathname, homeItem.href, homeItem.baseHref)}
            pathname={pathname}
            itemRef={(el) => registerItem(homeItem.baseHref, el)}
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

      {navIconItems.map(({ href, baseHref, text }) => {
        const Icon = ROUTE_ICONS[baseHref] ?? WritingIcon
        const goKey = dockGoKeyFor(baseHref)
        return (
          <DockItem
            key={baseHref}
            href={href}
            baseHref={baseHref}
            label={text}
            ariaLabel={goKey ? t.shortcutHint(text, goKey) : text}
            goKey={goKey}
            active={isItemActive(pathname, href, baseHref)}
            pathname={pathname}
            itemRef={(el) => registerItem(baseHref, el)}
            onNavigate={handleNavigate}
          >
            <Icon />
          </DockItem>
        )
      })}

      <span className="dock-rule" aria-hidden="true" />
      <DockPreferences visible={visible} pathname={pathname || '/'} />
    </nav>
  )
}

'use client'

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React from 'react'

import { FloatingDock } from '~/app/(main)/FloatingDock'
import { LanguageSwitcher } from '~/app/(main)/LanguageSwitcher'
import { NavigationBar } from '~/app/(main)/NavigationBar'
import { SiteSearch } from '~/app/(main)/SiteSearch'
import { ThemeSwitcher } from '~/app/(main)/ThemeSwitcher'
import {
  GitHubBrandIcon,
  GoogleBrandIcon,
  MailIcon,
  UserArrowLeftIcon,
} from '~/assets'
import { Avatar } from '~/components/Avatar'
import { Container } from '~/components/ui/Container'
import { Tooltip } from '~/components/ui/Tooltip'
import { url } from '~/lib'
import { getMessages, localeFromPathname } from '~/lib/i18n'

export function Header() {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const t = getMessages(locale).nav
  const homeHref = locale === 'en' ? '/en' : '/'
  const isHomePage = pathname === '/' || pathname === '/en'

  const headerBarRef = React.useRef<HTMLDivElement>(null)
  const [isDockVisible, setIsDockVisible] = React.useState(false)

  React.useEffect(() => {
    const el = headerBarRef.current
    if (!el) return

    setIsDockVisible(el.getBoundingClientRect().bottom <= 0)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsDockVisible(!entry.isIntersecting)
        }
      },
      { threshold: 0 }
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [pathname])

  const [isShowingAltAvatar, setIsShowingAltAvatar] = React.useState(false)
  const onAvatarContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault()
      setIsShowingAltAvatar((prev) => !prev)
    },
    []
  )

  return (
    <>
      <header className="pointer-events-none relative z-40 flex flex-col">
        <div ref={headerBarRef} className="relative z-10 h-16 pt-6">
          <Container className="w-full">
            <div className="relative flex gap-2 sm:gap-4">
              <motion.div
                className="flex flex-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 200,
                }}
              >
                <AnimatePresence>
                  {!isHomePage && (
                    <motion.div
                      layoutId="avatar"
                      layout
                      onContextMenu={onAvatarContextMenu}
                    >
                      <Avatar>
                        <Avatar.Image
                          href={homeHref}
                          label={t.homeLabel}
                          alt={isShowingAltAvatar}
                        />
                      </Avatar>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <div className="flex flex-1 justify-end md:justify-center">
                <NavigationBar.Mobile className="pointer-events-auto relative z-50 md:hidden" />
                <NavigationBar.Desktop className="pointer-events-auto relative z-50 hidden md:block" />
              </div>
              <motion.div
                className="flex items-center justify-end gap-1.5 sm:gap-3 md:flex-1"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                <UserInfo signInLabel={t.signIn} />
                <div className="pointer-events-auto">
                  <SiteSearch />
                </div>
                <div className="pointer-events-auto">
                  <LanguageSwitcher />
                </div>
                <div className="pointer-events-auto">
                  <ThemeSwitcher />
                </div>
              </motion.div>
            </div>
          </Container>
        </div>

        <AnimatePresence>
          {isHomePage && (
            <Container className="-mb-3 mt-16">
              <motion.div
                className="w-full select-none"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 200,
                }}
              >
                <motion.div
                  className="relative inline-flex"
                  layoutId="avatar"
                  layout
                  onContextMenu={onAvatarContextMenu}
                >
                  <div className="block h-16 w-16">
                    <Avatar.Image
                      large
                      href={homeHref}
                      label={t.homeLabel}
                      alt={isShowingAltAvatar}
                      className="block h-full w-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </Container>
          )}
        </AnimatePresence>
      </header>

      <FloatingDock
        visible={isDockVisible}
        altAvatar={isShowingAltAvatar}
        onAvatarContextMenu={onAvatarContextMenu}
      />
    </>
  )
}

function UserInfo({ signInLabel }: { signInLabel: string }) {
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const pathname = usePathname()
  const { user } = useUser()
  const StrategyIcon = React.useMemo(() => {
    const strategy = user?.primaryEmailAddress?.verification.strategy
    if (!strategy) {
      return null
    }

    switch (strategy) {
      case 'from_oauth_github':
        return GitHubBrandIcon as (
          props: React.ComponentProps<'svg'>
        ) => JSX.Element
      case 'from_oauth_google':
        return GoogleBrandIcon
      default:
        return MailIcon
    }
  }, [user?.primaryEmailAddress?.verification.strategy])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence>
      <SignedIn key="user-info">
        <motion.div
          className="pointer-events-auto relative flex h-10 items-center"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
        >
          <UserButton
            afterSignOutUrl={url(pathname).href}
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 ring-2 ring-white/20',
              },
            }}
          />
          {StrategyIcon && (
            <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 w-4 select-none items-center justify-center rounded-full bg-white dark:bg-zinc-900">
              <StrategyIcon className="h-3 w-3" />
            </span>
          )}
        </motion.div>
      </SignedIn>
      <SignedOut key="sign-in">
        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
        >
          <Tooltip.Provider disableHoverableContent>
            <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <SignInButton mode="modal" redirectUrl={url(pathname).href}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    aria-label={signInLabel}
                    className="group h-10 rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 text-sm shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
                  >
                    <UserArrowLeftIcon className="h-5 w-5" />
                  </button>
                </Tooltip.Trigger>
              </SignInButton>

              <AnimatePresence>
                {tooltipOpen && (
                  <Tooltip.Portal forceMount>
                    <Tooltip.Content asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        {signInLabel}
                      </motion.div>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </AnimatePresence>
            </Tooltip.Root>
          </Tooltip.Provider>
        </motion.div>
      </SignedOut>
    </AnimatePresence>
  )
}

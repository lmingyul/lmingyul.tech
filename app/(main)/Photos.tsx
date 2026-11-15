'use client'

import { clsxm } from '@zolplay/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

export function Photos({ photos }: { photos: string[] }) {
  const [width, setWidth] = React.useState(0)
  const [isCompact, setIsCompact] = React.useState(false)
  const expandedWidth = React.useMemo(() => width * 1.38, [width])
  const isScrollableDesktop = photos.length > 6

  React.useEffect(() => {
    const handleResize = () => {
      // 640px is the breakpoint for md
      if (window.innerWidth < 640) {
        setIsCompact(true)
        setWidth(window.innerWidth / 2 - 64)
        return
      }

      setIsCompact(false)
      const visibleCount = Math.max(1, Math.min(photos.length, 6))
      setWidth(window.innerWidth / visibleCount - 24)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [photos.length])

  return (
    <motion.div
      className="mt-16 sm:mt-20"
      initial={{ opacity: 0, scale: 0.925, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: 0.5,
        type: 'spring',
      }}
    >
      <div
        className={clsxm(
          '-my-4 flex w-full snap-x snap-proximity scroll-pl-4 justify-start gap-4 overflow-x-auto px-4 py-4 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          isScrollableDesktop
            ? 'md:justify-start md:overflow-x-auto md:px-6'
            : 'md:justify-center md:overflow-x-hidden md:px-0'
        )}
      >
        {photos.map((image, idx) => (
          <motion.div
            key={image}
            className="relative h-40 flex-none shrink-0 snap-start overflow-hidden rounded-xl bg-zinc-100 ring-2 ring-lime-800/20 dark:bg-zinc-800 dark:ring-lime-300/10 md:h-72 md:rounded-3xl"
            animate={{
              width,
              opacity: isCompact ? 1 : 0.85,
              filter: isCompact ? 'grayscale(0)' : 'grayscale(0.5)',
              rotate: idx % 2 === 0 ? 2 : -1,
            }}
            whileHover={
              isCompact
                ? {}
                : {
                    width: expandedWidth,
                    opacity: 1,
                    filter: 'grayscale(0)',
                  }
            }
            layout
          >
            <Image
              src={image}
              alt={`旅途瞬间 ${idx + 1}`}
              width={500}
              height={500}
              sizes="(min-width: 640px) 18rem, 11rem"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              unoptimized
              priority={idx < 6}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

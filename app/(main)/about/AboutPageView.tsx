import Image from 'next/image'
import Balancer from 'react-wrap-balancer'

import { WritingHeatmap } from '~/app/(main)/about/WritingHeatmap'
import {
  BriefcaseIcon,
  GitHubIcon,
  Layers3Icon,
  MailIcon,
  PencilSwooshIcon,
  SparkleIcon,
} from '~/assets'
import portraitImage from '~/assets/Portrait.png'
import { SocialLink } from '~/components/links/SocialLink'
import { Container } from '~/components/ui/Container'
import { type Locale, localizePath } from '~/lib/i18n'
import { getWritingActivity } from '~/lib/writing-activity'

type CareerItem = {
  organization: string
  role: string
  period: string
  logo: string
  summary?: string
  highlights?: string[]
}

const CAREER_ITEMS_BY_LOCALE: Record<Locale, CareerItem[]> = {
  zh: [
    {
      organization: '招银网络科技有限公司（深圳）',
      role: '系统开发工程师',
      period: '2023.11 — 至今',
      logo: '/uploads/resume/cmbnt.png',
      summary:
        '目前负责招商银行手机 APP 搜索功能，平时工作主要负责搜索算法的研发，后台业务逻辑开发，以及搜索模型训练等工作。',
      highlights: [
        '大模型 LLM 提升召回后的文档排序相关性的工作',
        '大模型 LLM 作为多 Agents 负责完成单指令输入的工作',
      ],
    },
    {
      organization: '中兴通讯有限公司',
      role: '软件开发工程师',
      period: '2021.07 — 2023.06',
      logo: '/uploads/resume/zte.png',
      summary:
        '在中兴无线负责大数据平台的建设与开发，主要负责数据建模、数据 API 调用以及标签工厂等系统。',
    },
    {
      organization: '合肥工业大学',
      role: '硕士',
      period: '2018.09 — 2021.06',
      logo: '/uploads/resume/hfut.png',
    },
    {
      organization: '哈尔滨理工大学',
      role: '本科',
      period: '2014.09 — 2018.06',
      logo: '/uploads/resume/hrbust.png',
    },
  ],
  en: [
    {
      organization: 'CMB Network Technology (Shenzhen)',
      role: 'Systems Development Engineer',
      period: '2023.11 — Present',
      logo: '/uploads/resume/cmbnt.png',
      summary:
        'Core engineer on the China Merchants Bank mobile app search engine — spanning search ranking algorithms, backend services, and model training.',
      highlights: [
        'Post-retrieval document ranking & relevance optimization powered by LLMs (Rerank)',
        'Multi-agent collaboration workflows executing complex single-instruction intents',
      ],
    },
    {
      organization: 'ZTE Corporation',
      role: 'Software Engineer',
      period: '2021.07 — 2023.06',
      logo: '/uploads/resume/zte.png',
      summary:
        'Built wireless big-data platform infrastructure, focusing on data modeling, data service APIs, and tag-factory pipelines.',
    },
    {
      organization: 'Hefei University of Technology',
      role: 'M.Eng.',
      period: '2018.09 — 2021.06',
      logo: '/uploads/resume/hfut.png',
    },
    {
      organization: 'Harbin University of Science and Technology',
      role: 'B.Eng.',
      period: '2014.09 — 2018.06',
      logo: '/uploads/resume/hrbust.png',
    },
  ],
}

type GearItem = {
  name: string
  category: string
  model?: string
  purpose: string
  rating: number
  status: string
  since: string
  note: string
}

const GEAR_ITEMS_BY_LOCALE: Record<Locale, GearItem[]> = {
  zh: [
    {
      name: 'Studio Display',
      category: '硬件设备',
      purpose: '作为 Mac Studio 的主力显示器',
      rating: 10,
      status: '在用',
      since: '2023-11-24',
      note: '显示效果非常好，音响也很棒，有财力的话还想再入手一台',
    },
    {
      name: '罗技MX Master 4',
      category: '硬件设备',
      model: 'MX Master 3、MX Master 3s',
      purpose: '提高工作效率的无线鼠标',
      rating: 9.5,
      status: '在用',
      since: '2021-11-15',
      note: '左边和中间的滚轮都非常好用，3s 还更新成静音好评，公司一个，家里一个',
    },
    {
      name: 'Mac Studio',
      category: '硬件设备',
      model: 'M1 Max 64 GB 1TB',
      purpose: '在家日常使用',
      rating: 9,
      status: '在用',
      since: '2024-12-10',
      note: '性能很强，太爱了',
    },
    {
      name: 'iPhone 18 Pro Max',
      category: '硬件设备',
      model: '网页版',
      purpose: '必备',
      rating: 8.5,
      status: '在用',
      since: '2024-11-19',
      note: '同步速度有时较慢',
    },
    {
      name: 'MacBook Pro',
      category: '硬件设备',
      model: '16‘’ M4 Pro-24 G-512 G',
      purpose: '放在公司作为日常工作的辅助电脑',
      rating: 8,
      status: '在用',
      since: '2024-11-24',
      note: '稍微有点重，不过外出携带的场景不多，还可以，容量买小了，LLM 能跑起来的不多',
    },
    {
      name: 'AirPods 4',
      category: '硬件设备',
      purpose: '日常通勤听博客、看视频使用',
      rating: 8,
      status: '在用',
      since: '2024-12-24',
      note: '还好，之前用的是 Pro，入耳式会让耳朵不舒服，换了这个好很多，但是相应的降噪能力就下降了，还能接受',
    },
    {
      name: 'Apple Watch 12',
      category: '硬件设备',
      model: 'Series 7',
      purpose: '日常接收消息、看时间、监测运动&睡眠',
      rating: 7,
      status: '在用',
      since: '2021-11-25',
      note: '日常一充不太好，夏天带有点闷',
    },
    {
      name: 'ChatGPT Atlas',
      category: '桌面软件',
      purpose: '主力浏览器',
      rating: 7,
      status: '在用',
      since: '2025-10-23',
      note: '主要看中 Agent 和记忆功能',
    },
  ],
  en: [
    {
      name: 'Apple Studio Display',
      category: 'Hardware',
      purpose: 'Primary display for Mac Studio',
      rating: 10,
      status: 'Active',
      since: '2023-11-24',
      note: 'Razor-sharp 5K panel and surprisingly great speakers — would gladly buy a second one.',
    },
    {
      name: 'Logitech MX Master 4',
      category: 'Hardware',
      model: 'MX Master 3 / MX Master 3s',
      purpose: 'Daily productivity wireless mouse',
      rating: 9.5,
      status: 'Active',
      since: '2021-11-15',
      note: 'Both thumb and main scroll wheels feel natural; silent clicks on 3s are great. One at home, one at the office.',
    },
    {
      name: 'Mac Studio',
      category: 'Hardware',
      model: 'M1 Max · 64 GB · 1 TB',
      purpose: 'Home daily driver & local model workstation',
      rating: 9,
      status: 'Active',
      since: '2024-12-10',
      note: 'Quiet, fast, and 64 GB unified memory runs plenty of local models smoothly.',
    },
    {
      name: 'iPhone',
      category: 'Hardware',
      purpose: 'Daily mobile essential',
      rating: 8.5,
      status: 'Active',
      since: '2024-11-19',
      note: 'Reliable everyday carry; iCloud sync can occasionally lag.',
    },
    {
      name: 'MacBook Pro',
      category: 'Hardware',
      model: '16" M4 Pro · 24 GB · 512 GB',
      purpose: 'Office workstation laptop',
      rating: 8,
      status: 'Active',
      since: '2024-11-24',
      note: 'A bit heavy when traveling, and 24 GB RAM limits larger local LLMs, though portability needs are rare.',
    },
    {
      name: 'AirPods 4',
      category: 'Hardware',
      purpose: 'Commute podcasts & videos',
      rating: 8,
      status: 'Active',
      since: '2024-12-24',
      note: 'Much more comfortable on my ears than in-ear Pros; less ANC isolation, which is a fair trade.',
    },
    {
      name: 'Apple Watch',
      category: 'Hardware',
      model: 'Series 7',
      purpose: 'Notifications, time, workouts & sleep tracking',
      rating: 7,
      status: 'Active',
      since: '2021-11-25',
      note: 'Daily charging is a chore and summer humidity makes the band feel warm.',
    },
    {
      name: 'ChatGPT Atlas',
      category: 'Desktop App',
      purpose: 'Primary browser',
      rating: 7,
      status: 'Active',
      since: '2025-10-23',
      note: 'Picked primarily for its built-in Agent and Memory capabilities.',
    },
  ],
}

type TravelPhoto = {
  src: string
  date: string
  location: string
}

const TRAVEL_PHOTOS_BY_LOCALE: Record<Locale, TravelPhoto[]> = {
  zh: [
    {
      src: '/uploads/photos/travel-01-dali.jpg',
      date: '2023.10.3 18:50',
      location: '云南大理洱海边',
    },
    {
      src: '/uploads/photos/travel-02-singapore.jpg',
      date: '2024.9.29 15:45',
      location: '新加坡鱼尾狮附近',
    },
    {
      src: '/uploads/photos/travel-03-phuket.jpg',
      date: '2024.10.2 18:28',
      location: '泰国普吉岛卡伦海滩边',
    },
    {
      src: '/uploads/photos/travel-04-shenzhen.jpg',
      date: '2025.1.4 17:15',
      location: '深圳湾人才公园附近',
    },
    {
      src: '/uploads/photos/travel-05-qingyuan.jpg',
      date: '2025.4.5 14:17',
      location: '清远笔架山',
    },
    {
      src: '/uploads/photos/travel-06-shanghai.jpg',
      date: '2025.4.29 21:30',
      location: '上海黄浦江',
    },
    {
      src: '/uploads/photos/travel-07-hangzhou.jpg',
      date: '2025.5.2 18:10',
      location: '杭州湘湖',
    },
    {
      src: '/uploads/photos/travel-08-suzhou.jpg',
      date: '2025.5.4 18:42',
      location: '苏州金鸡湖',
    },
    {
      src: '/uploads/photos/travel-09-guilin.jpg',
      date: '2025.6.2 14:45',
      location: '桂林象鼻山',
    },
  ],
  en: [
    {
      src: '/uploads/photos/travel-01-dali.jpg',
      date: '2023.10.3 18:50',
      location: 'Erhai Lake, Dali, Yunnan',
    },
    {
      src: '/uploads/photos/travel-02-singapore.jpg',
      date: '2024.9.29 15:45',
      location: 'Merlion Park, Singapore',
    },
    {
      src: '/uploads/photos/travel-03-phuket.jpg',
      date: '2024.10.2 18:28',
      location: 'Karon Beach, Phuket, Thailand',
    },
    {
      src: '/uploads/photos/travel-04-shenzhen.jpg',
      date: '2025.1.4 17:15',
      location: 'Shenzhen Bay Talent Park',
    },
    {
      src: '/uploads/photos/travel-05-qingyuan.jpg',
      date: '2025.4.5 14:17',
      location: 'Bijia Mountain, Qingyuan',
    },
    {
      src: '/uploads/photos/travel-06-shanghai.jpg',
      date: '2025.4.29 21:30',
      location: 'Huangpu River, Shanghai',
    },
    {
      src: '/uploads/photos/travel-07-hangzhou.jpg',
      date: '2025.5.2 18:10',
      location: 'Xianghu Lake, Hangzhou',
    },
    {
      src: '/uploads/photos/travel-08-suzhou.jpg',
      date: '2025.5.4 18:42',
      location: 'Jinji Lake, Suzhou',
    },
    {
      src: '/uploads/photos/travel-09-guilin.jpg',
      date: '2025.6.2 14:45',
      location: 'Elephant Trunk Hill, Guilin',
    },
  ],
}

const MIGRATION_STEPS = ['Hexo', 'Hugo', 'Xlog', 'Notion', 'Next.js + Git']
const LANGUAGES_BY_LOCALE: Record<Locale, string[]> = {
  zh: ['中文', '英文', '粤语', '一点点壮族语（跟我妈学的）'],
  en: ['Mandarin Chinese', 'English', 'Cantonese', 'A little Zhuang (from Mom)'],
}

function SectionHeading({
  icon,
  title: heading,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-8 flex flex-col gap-1">
      <h2 className="flex items-center text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
        <span className="mr-2.5 text-lime-600 dark:text-lime-400">{icon}</span>
        <span>{heading}</span>
      </h2>
      {subtitle && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      )}
    </div>
  )
}

export async function AboutPageView({ locale = 'zh' }: { locale?: Locale }) {
  const isEn = locale === 'en'
  const activity = await getWritingActivity(locale)
  const careerItems = CAREER_ITEMS_BY_LOCALE[locale]
  const gearItems = GEAR_ITEMS_BY_LOCALE[locale]
  const travelPhotos = TRAVEL_PHOTOS_BY_LOCALE[locale]
  const languages = LANGUAGES_BY_LOCALE[locale]

  return (
    <Container className="mt-16 sm:mt-24">
      <section className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            {isEn ? 'Hi, I’m Liang (lmingyul)' : '我是 阿梁（lmingyul）'}
          </h1>
          <p className="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            <Balancer>
              {isEn
                ? 'Friends call me Ah Liang (lmingyul combines my partner’s name and mine). I’m an introverted backend engineer and LLM practitioner based in Shenzhen.'
                : '朋友都这样叫（lmingyul，博客的名字取自我和我对象名字的组合），目前是一名后端程序员，兼大模型炼丹师，偏 I 人，现在深圳。'}
            </Balancer>
          </p>

          <div className="mt-6 rounded-2xl border border-lime-500/25 bg-lime-50/70 px-5 py-4 text-sm text-zinc-700 dark:border-lime-400/20 dark:bg-lime-950/20 dark:text-zinc-300">
            <span className="font-semibold text-lime-700 dark:text-lime-400">
              {isEn ? 'Motto: ' : '座右铭：'}
            </span>
            Keep Learning, Keep Thinking, Keep Trying
          </div>

          <div className="mt-8 space-y-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Blog Migration Journey' : '博客迁徙历程'}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {MIGRATION_STEPS.map((step, index) => (
                  <span key={step} className="inline-flex items-center gap-2">
                    <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-200">
                      {step}
                    </span>
                    {index < MIGRATION_STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="text-lime-600 dark:text-lime-400"
                      >
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-2">
                {isEn
                  ? 'After hopping across several blogging platforms over the years — including convenient note-taking in Notion — I moved everything back to Next.js + Git Markdown so the writing stays permanently in my own hands.'
                  : '博客经历过很多次搬迁，维护起来各有各的问题，博客还是以文字为主，从之前在 Notion 省心记录，到现在迁回 Next.js + Git，把内容稳稳留在自己手里。'}
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Languages' : '语言'}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-100 bg-white/70 p-6 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl ring-2 ring-lime-600/20 dark:ring-lime-400/20">
                <Image
                  src={portraitImage}
                  alt={
                    isEn ? 'lmingyul MidJourney avatar' : 'lmingyul MidJourney 头像'
                  }
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                {isEn
                  ? 'My avatar was generated at home with MidJourney back during the 2023 Lunar New Year break — kept imperfections and all as a timestamp of how fast models evolve.'
                  : '头像是用 2023 年寒假过年在家用 MidJourney 生成的头像，虽然有瑕疵，但是留着也算是见证了模型的发展。'}
              </p>
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Contact' : '联系方式'}
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:taimingliang1117@gmail.com"
                    className="group flex items-center gap-3 text-zinc-600 transition hover:text-lime-600 dark:text-zinc-400 dark:hover:text-lime-400"
                  >
                    <MailIcon className="h-4 w-4 flex-none text-zinc-400 transition group-hover:text-lime-600 dark:group-hover:text-lime-400" />
                    <span>taimingliang1117@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:2575625672@qq.com"
                    className="group flex items-center gap-3 text-zinc-600 transition hover:text-lime-600 dark:text-zinc-400 dark:hover:text-lime-400"
                  >
                    <MailIcon className="h-4 w-4 flex-none text-zinc-400 transition group-hover:text-lime-600 dark:group-hover:text-lime-400" />
                    <span>2575625672@qq.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/lmingyul"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-zinc-600 transition hover:text-lime-600 dark:text-zinc-400 dark:hover:text-lime-400"
                  >
                    <GitHubIcon className="h-4 w-4 flex-none text-zinc-400 transition group-hover:text-lime-600 dark:group-hover:text-lime-400" />
                    <span>github.com/lmingyul</span>
                  </a>
                </li>
              </ul>

              <div className="mt-5 flex items-center gap-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                <SocialLink
                  href="https://x.com/TommySteve1117"
                  aria-label={isEn ? 'My X (Twitter)' : '我的推特'}
                  platform="twitter"
                />
                <SocialLink
                  href="https://space.bilibili.com/209721840"
                  aria-label={isEn ? 'My Bilibili' : '我的 Bilibili'}
                  platform="bilibili"
                />
                <SocialLink
                  href="https://github.com/lmingyul"
                  aria-label={isEn ? 'My GitHub' : '我的 GitHub'}
                  platform="github"
                />
                <SocialLink
                  href={localizePath('/feed.xml', locale)}
                  platform="rss"
                  aria-label={isEn ? 'RSS Feed' : 'RSS 订阅'}
                />
                <SocialLink
                  href="mailto:taimingliang1117@gmail.com"
                  aria-label={isEn ? 'My Email' : '我的邮箱'}
                  platform="mail"
                />
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-20">
        <SectionHeading
          icon={<PencilSwooshIcon className="h-5 w-5" />}
          title={isEn ? 'Writing Activity' : '写作足迹'}
          subtitle={
            isEn
              ? 'Each square is a day; darker means more posts'
              : '每一格是一天，颜色越深当天发布越多'
          }
        />
        <WritingHeatmap locale={locale} activity={activity} />
      </section>

      <section className="mt-20">
        <SectionHeading
          icon={<BriefcaseIcon className="h-5 w-5" />}
          title={isEn ? 'Work & Education' : '工作与教育经历'}
          subtitle={
            isEn
              ? 'Building across search ranking, LLM applications, and big-data systems'
              : '在搜索、大模型与大数据平台工程之间持续实践'
          }
        />
        <ol className="space-y-4">
          {careerItems.map((item) => (
            <li
              key={item.organization}
              className="rounded-2xl border border-zinc-100 bg-white/70 p-6 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                  <Image
                    src={item.logo}
                    alt={item.organization}
                    width={96}
                    height={96}
                    className="h-9 w-9 rounded-full bg-white object-contain p-0.5"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.organization}
                      </h3>
                      <p className="text-sm font-medium text-lime-700 dark:text-lime-400">
                        {item.role}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {item.period}
                    </span>
                  </div>

                  {item.summary && (
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {item.summary}
                    </p>
                  )}

                  {item.highlights && item.highlights.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {isEn ? 'Recent R&D Focus' : '最近在开发 & 研究'}
                      </p>
                      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <SectionHeading
          icon={<Layers3Icon className="h-5 w-5" />}
          title={isEn ? 'Gear & Daily Tools' : '我的软硬件工具'}
          subtitle={
            isEn
              ? 'Hardware and desktop software powering coding, local model runs, and daily life'
              : '平时写代码、折腾模型和日常生活的吃饭家伙'
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((gear) => (
            <article
              key={gear.name}
              className="flex flex-col justify-between rounded-2xl border border-zinc-100 bg-white/70 p-5 shadow-sm transition hover:border-lime-500/40 dark:border-zinc-700/40 dark:bg-zinc-900/60 dark:hover:border-lime-400/30"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {gear.name}
                    </h3>
                    {gear.model && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {gear.model}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-lime-500/10 px-2.5 py-0.5 text-xs font-semibold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                    {isEn ? `${gear.rating}/10` : `${gear.rating} 分`}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {gear.category}
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                    {gear.status}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {gear.purpose}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {gear.note}
                </p>
              </div>

              <p className="mt-4 border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                {isEn ? `Since: ${gear.since}` : `开始使用：${gear.since}`}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          icon={<SparkleIcon className="h-5 w-5" />}
          title={
            isEn
              ? 'Different Times, Different Places, Same Me'
              : '不同时间、不同地点、同一个我'
          }
          subtitle={
            isEn ? 'Places visited & moments captured' : '走过的地方与留下的瞬间'
          }
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {travelPhotos.map((photo) => (
            <figure
              key={photo.src}
              className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white/70 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={photo.src}
                  alt={`${photo.date} ${photo.location}`}
                  fill
                  sizes="(min-width: 1024px) 20rem, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <figcaption className="flex items-center justify-between gap-2 px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {photo.location}
                </span>
                <time className="shrink-0 text-zinc-400 dark:text-zinc-500">
                  {photo.date}
                </time>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Container>
  )
}

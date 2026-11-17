import { buildLlmsFullTxt } from '~/lib/llms-txt'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET() {
  const content = await buildLlmsFullTxt()

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}

export const MERMAID_DATA_ATTR = 'data-mermaid'

export type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function extractHastText(node: HastNode): string {
  if (node.type === 'text' && typeof node.value === 'string') {
    return node.value
  }
  if (!Array.isArray(node.children)) {
    return ''
  }
  return node.children.map(extractHastText).join('')
}

function hasMermaidClass(className: unknown): boolean {
  if (Array.isArray(className)) {
    return className.some(
      (item) => typeof item === 'string' && /^language-mermaid$/i.test(item)
    )
  }
  if (typeof className === 'string') {
    return className
      .split(/\s+/)
      .some((token) => /^language-mermaid$/i.test(token))
  }
  return false
}

/**
 * Intercepts fenced `mermaid` code blocks before `rehype-prism-plus` runs,
 * hoisting the raw diagram source onto the parent `<pre>` as `data-mermaid`
 * so `rehype-prism-plus` skips tokenization and React can mount `<MermaidDiagram />`.
 */
export function rehypeMermaidBlocks() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'pre') {
        const elementChildren = Array.isArray(node.children)
          ? node.children.filter((child) => child.type === 'element')
          : []

        const codeNode = elementChildren[0]
        if (
          elementChildren.length === 1 &&
          codeNode?.tagName === 'code' &&
          hasMermaidClass(codeNode.properties?.className)
        ) {
          const rawChart = extractHastText(codeNode).replace(/\n$/, '')
          node.properties = {
            ...(node.properties ?? {}),
            dataMermaid: rawChart,
          }
          node.children = []
          return
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child)
        }
      }
    }

    visit(tree)
  }
}

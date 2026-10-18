import { useEffect, useRef, useState } from 'react'
import { getPipelineStages } from '../api'

const connectionPairs = [
  ['user-input', 'requirement-analysis'],
  ['requirement-analysis', 'clarification-loop'],
  ['requirement-analysis', 'rag-preprocessing'],
  ['rag-preprocessing', 'rag-retrieval'],
  ['rag-retrieval', 'gemini-recommendation'],
  ['gemini-recommendation', 'critic-check'],
  ['critic-check', 'blueprint-generation'],
  ['blueprint-generation', 'export'],
]

const statusStyles = {
  Implemented: 'border-[#5C7A4B] bg-[#E9EFE2] text-[#5C7A4B]',
  'In progress': 'border-[#B5532F] bg-[#FBEFEA] text-[#B5532F]',
  Planned: 'border-[#7A7064] bg-[#F3EFE8] text-[#7A7064]',
}

export default function HowItWorksPage() {
  const [stages, setStages] = useState([])
  const [paths, setPaths] = useState([])
  const [loopPath, setLoopPath] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const stageRefs = useRef({})

  useEffect(() => {
    const loadStages = async () => {
      const stagesResult = await getPipelineStages()
      setStages(stagesResult)
    }

    loadStages()
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current || !stages.length) return

      const svgRect = containerRef.current.getBoundingClientRect()
      const nextPaths = connectionPairs
        .map(([fromId, toId]) => {
          const fromNode = stageRefs.current[fromId]
          const toNode = stageRefs.current[toId]
          if (!fromNode || !toNode) return null

          const startRect = fromNode.getBoundingClientRect()
          const endRect = toNode.getBoundingClientRect()
          const startX = startRect.right - svgRect.left
          const startY = startRect.top + startRect.height / 2 - svgRect.top
          const endX = endRect.left - svgRect.left
          const endY = endRect.top + endRect.height / 2 - svgRect.top
          const midX = (startX + endX) / 2

          return {
            id: `${fromId}-${toId}`,
            path: `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`,
          }
        })
        .filter(Boolean)

      setPaths(nextPaths)

      const clarificationNode = stageRefs.current['clarification-loop']
      const userInputNode = stageRefs.current['user-input']
      if (!clarificationNode || !userInputNode) {
        setLoopPath(null)
        return
      }

      const fromRect = clarificationNode.getBoundingClientRect()
      const toRect = userInputNode.getBoundingClientRect()
      const startX = fromRect.left - svgRect.left + fromRect.width * 0.5
      const startY = fromRect.top - svgRect.top + fromRect.height * 0.85
      const endX = toRect.right - svgRect.left - 12
      const endY = toRect.top - svgRect.top + toRect.height * 0.25

      setLoopPath({
        id: 'clarification-loop',
        path: `M ${startX} ${startY} C ${startX + 30} ${startY + 110}, ${endX - 60} ${endY - 40}, ${endX} ${endY}`,
      })
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [stages])

  return (
    <main className="w-full px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="reveal-panel mb-6 max-w-3xl">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#7A7064]">Methodology</p>
          <h1 className="text-4xl text-[#1F1B16] sm:text-5xl">How the BuildMyML workflow works</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#7A7064]">
            The workflow begins with a plain-language idea, adds requirement analysis and clarification when details are missing, pulls from a curated knowledge base, and ends with a recommendation blueprint.
          </p>
        </header>

        <section ref={sectionRef} className={`flow-section ${isVisible ? 'is-visible' : ''} rounded-[18px] border border-[#E4DCCB] bg-[#FFFCF5] p-4 sm:p-6 lg:p-8`}>
          <div className="mb-5 border-b border-[#E4DCCB] pb-4">
            <h2 className="text-xl font-semibold text-[#1F1B16]">Full project flow</h2>
          </div>

          <div ref={containerRef} className="relative overflow-hidden rounded-[16px] border border-[#E4DCCB] bg-[#F6F1E7] p-3 sm:p-5">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <marker id="arrowhead-terracotta" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="#B5532F" />
                </marker>
              </defs>

              {paths.map((connection, index) => (
                <path
                  key={connection.id}
                  d={connection.path}
                  fill="none"
                  stroke="#B5532F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="flow-arrow"
                  style={{ animationDelay: `${index * 90}ms` }}
                  markerEnd="url(#arrowhead-terracotta)"
                />
              ))}

              {loopPath && (
                <path
                  d={loopPath.path}
                  fill="none"
                  stroke="#B5532F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="7 7"
                  className="flow-arrow flow-arrow--loop"
                  style={{ animationDelay: `${paths.length * 90 + 120}ms` }}
                  markerEnd="url(#arrowhead-terracotta)"
                />
              )}
            </svg>

            <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stages.map((stage, index) => {
                const badgeClass = statusStyles[stage.status] || statusStyles.Planned
                const isClarification = stage.id === 'clarification-loop'

                return (
                  <div
                    key={stage.id}
                    ref={(node) => {
                      if (node) stageRefs.current[stage.id] = node
                    }}
                    className={`reveal-panel rounded-[16px] border p-4 ${
                      isClarification
                        ? 'border-dashed border-[#B5532F] bg-[#FFFCF5]'
                        : 'border-[#E4DCCB] bg-[#FFFCF5]'
                    }`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${badgeClass}`}>
                        {stage.status}
                      </span>
                    </div>
                    <h3 className="text-lg text-[#1F1B16]">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#7A7064]">{stage.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

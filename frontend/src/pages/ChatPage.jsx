import { useEffect, useMemo, useState } from 'react'
import { exportBlueprint, generateBlueprint, getConversation, getPipelineStages } from '../api'

const exampleIdeas = [
  {
    category: 'Fraud detection',
    text: 'I want to build a system that flags suspicious transactions early so small banks can warn customers before money is lost.',
  },
  {
    category: 'Public services',
    text: 'I want to build a tool that checks which government schemes a citizen is eligible for and explains the benefits they can claim.',
  },
  {
    category: 'Agriculture',
    text: 'I want to build a system that detects crop diseases from leaf photos and gives farmers simple treatment advice.',
  },
  {
    category: 'Document verification',
    text: 'I want to build a system that detects forged or altered documents such as certificates and ID cards.',
  },
]

const stageStatusStyles = {
  Planned: 'border-[#7A7064] bg-[#F3EFE8] text-[#7A7064]',
  'In progress': 'border-[#B5532F] bg-[#FBEFEA] text-[#B5532F]',
  Implemented: 'border-[#5C7A4B] bg-[#E9EFE2] text-[#5C7A4B]',
  Sample: 'border-[#B7B2A8] bg-[#F2EFEA] text-[#6F675F]',
  failed: 'border-[#A4422A] bg-[#FDEAE7] text-[#A4422A]',
}

const normalizeStageStatus = (status) => {
  if (status === 'running') return 'In progress'
  if (status === 'done') return 'Implemented'
  if (status === 'waiting') return 'Planned'
  if (status === 'sample') return 'Sample'
  if (status === 'Sample') return 'Sample'
  return status || 'Planned'
}

export default function ChatPage() {
  const [prompt, setPrompt] = useState('')
  const [conversation, setConversation] = useState({ messages: [], suggestions: [] })
  const [pipelineStages, setPipelineStages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [generationErrorTone, setGenerationErrorTone] = useState('neutral')
  const [isFixtureMode, setIsFixtureMode] = useState(false)
  const [generatedBlueprint, setGeneratedBlueprint] = useState(null)
  const [expandedStages, setExpandedStages] = useState({})
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [exportState, setExportState] = useState('idle')

  const stageOutputs = useMemo(() => generatedBlueprint?.stage_outputs || [], [generatedBlueprint])

  useEffect(() => {
    const load = async () => {
      const nextConversation = await getConversation()
      setConversation(nextConversation)
      const stageList = await getPipelineStages()
      setPipelineStages(
        stageList.map((stage) => ({
          ...stage,
          detail: stage.description,
          status: normalizeStageStatus(stage.status),
        })),
      )
    }

    load()
  }, [])

  const applyStageUpdate = (update) => {
    if (!update || !update.stageId) return

    setPipelineStages((currentStages) =>
      currentStages.map((stage) => {
        if (stage.id !== update.stageId) {
          return stage
        }

        return {
          ...stage,
          status: normalizeStageStatus(update.status || stage.status),
          detail: update.message || stage.description || 'Stage updated',
        }
      }),
    )

    if (update.status === 'failed') {
      setGenerationError(update.message || 'A stage failed while generating the blueprint.')
    }
  }

  const handleGenerate = async (retryPrompt = prompt) => {
    const trimmedPrompt = retryPrompt.trim()

    if (!trimmedPrompt) {
      return
    }

    setIsGenerating(true)
    setGenerationError('')
    setGenerationErrorTone('neutral')
    setIsFixtureMode(false)
    setGeneratedBlueprint(null)

    const stageList = await getPipelineStages()
    setPipelineStages(
      stageList.map((stage) => ({
        ...stage,
        detail: stage.description,
        status: normalizeStageStatus('running'),
      })),
    )

    setConversation((currentConversation) => ({
      ...currentConversation,
      messages: [
        ...currentConversation.messages,
        {
          id: `user-${Date.now()}`,
          author: 'user',
          text: trimmedPrompt,
        },
        {
          id: `assistant-${Date.now()}-status`,
          author: 'assistant',
          text: 'I am mapping your idea into requirements and drafting a recommendation blueprint.',
        },
      ],
    }))

    try {
      const blueprint = await generateBlueprint(trimmedPrompt, (update) => {
        if (!update) return

        if (update.type === 'blueprint' && update.blueprint) {
          setGeneratedBlueprint(update.blueprint)
          return
        }

        applyStageUpdate(update)
      })

      if (blueprint?.source === 'fixture') {
        setGenerationErrorTone('neutral')
        setGenerationError(blueprint.message || 'Showing sample data because the backend is not reachable.')
        setIsFixtureMode(true)
      } else if (blueprint?.status === 'failed') {
        setGenerationErrorTone('error')
        setGenerationError(`${blueprint.failed_stage || 'Stage'} failed: ${blueprint.message || 'The blueprint generation failed.'}`)
        setIsFixtureMode(false)
      } else {
        setGenerationError('')
        setGenerationErrorTone('neutral')
        setIsFixtureMode(false)
      }

      setGeneratedBlueprint(blueprint)
      if (blueprint?.stage_outputs?.length) {
        setExpandedStages(Object.fromEntries(blueprint.stage_outputs.map((stage) => [stage.name, false])))
      }
    } catch (error) {
      const message = error?.message || 'The blueprint generation failed.'
      setGenerationErrorTone('error')
      setGenerationError(message)
      setPipelineStages((currentStages) =>
        currentStages.map((stage) => (
          stage.status === 'In progress' ? { ...stage, status: 'failed', detail: 'Stage failed' } : stage
        )),
      )
      setIsFixtureMode(false)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="w-full px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="reveal-panel mb-8 border-b border-[#E4DCCB] pb-6">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#7A7064]">BuildMyML</p>
          <h1 className="max-w-[760px] text-4xl text-[#1F1B16] sm:text-5xl">Plan your next machine learning system</h1>
        </header>

        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="reveal-panel rounded-[18px] border border-[#E4DCCB] bg-[#FFFCF5] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7064]">Example ideas</h2>
            </div>

            <div className="space-y-2">
              {exampleIdeas.map((example) => (
                <button
                  key={example.text}
                  type="button"
                  onClick={() => setPrompt(example.text)}
                  className="w-full rounded-full border border-[#E4DCCB] bg-[#F6F1E7] px-3 py-3 text-left text-sm leading-6 text-[#1F1B16] transition-colors duration-200 hover:border-[#B5532F] hover:bg-[#FFFCF5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]"
                >
                  <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#7A7064]">{example.category}</span>
                  <span>{example.text}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="reveal-panel rounded-[18px] border border-[#E4DCCB] bg-[#FFFCF5] p-4 sm:p-6">
            <div className="mx-auto max-w-[860px]">
              <div className="mb-5 flex items-center justify-center text-center">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7A7064]">Project brief</p>
                  <h2 className="mt-2 text-2xl text-[#1F1B16]">Describe the idea you want to turn into an ML plan</h2>
                </div>
              </div>

              <label htmlFor="project-prompt" className="sr-only">
                Project description
              </label>
              <div className="rounded-[16px] border border-[#E4DCCB] bg-[#F6F1E7] p-3">
                <textarea
                  id="project-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={5}
                  placeholder="Describe the outcome you want to predict, the available data, and the business or research goal..."
                  className="w-full resize-none border-none bg-transparent text-base text-[#1F1B16] placeholder:text-[#7A7064] focus:outline-none"
                />
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate()}
                  className="inline-flex items-center justify-center rounded-full bg-[#B5532F] px-5 py-2.5 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]"
                >
                  {isGenerating ? 'Generating…' : 'Generate blueprint'}
                </button>
              </div>

              {pipelineStages.length > 0 && (
                <div className="mt-6 rounded-[16px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Generation stages</p>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#7A7064]">
                      {isFixtureMode
                        ? '0 of 8 complete'
                        : `${pipelineStages.filter((stage) => stage.status === 'Implemented').length} of 8 complete`}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {pipelineStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className={`rounded-[14px] border p-3 ${stageStatusStyles[stage.status || 'Planned']}`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{stage.status}</span>
                        </div>
                        <p className="text-sm font-medium text-[#1F1B16]">{stage.title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-[#4D453E]">{stage.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generationError && (
                <div
                  className={`mt-4 rounded-[14px] border p-3 text-sm ${
                    generationErrorTone === 'error'
                      ? 'border-[#A4422A] bg-[#FDEAE7] text-[#A4422A]'
                      : 'border-[#D7B98C] bg-[#F6EEDB] text-[#6F675F]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{generationError}</span>
                    {generationErrorTone === 'error' && (
                      <button
                        type="button"
                        onClick={() => handleGenerate(prompt)}
                        className="rounded-full border border-[#A4422A] bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#A4422A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4422A] focus-visible:ring-offset-2"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )}

              {generatedBlueprint && (
                <div className="mt-6 rounded-[18px] border border-[#E4DCCB] bg-[#FFFCF5] p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Blueprint draft</p>
                      <h3 className="mt-2 text-2xl text-[#1F1B16]">{generatedBlueprint.title || 'Recommendation blueprint'}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {generatedBlueprint.source === 'fixture' && (
                        <span className="rounded-full border border-[#D7B98C] bg-[#F6EEDB] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7A7064]">
                          Sample data
                        </span>
                      )}
                      <span className="rounded-full border border-[#C9DCBE] bg-[#E9EFE2] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#5C7A4B]">
                        Recommendation
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {['json', 'md', 'zip'].map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={async () => {
                          try {
                            setExportState('working')
                            await exportBlueprint(generatedBlueprint.id || 'fixture-blueprint', format)
                            setExportState('done')
                          } catch (error) {
                            setExportState('failed')
                            setGenerationError(error?.message || 'The export failed.')
                            setGenerationErrorTone('error')
                          }
                        }}
                        className="rounded-full border border-[#E4DCCB] bg-[#F6F1E7] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#1F1B16]"
                      >
                        {format.toUpperCase()} export
                      </button>
                    ))}
                    {exportState === 'working' && <span className="text-[10px] uppercase tracking-[0.12em] text-[#7A7064]">Preparing export…</span>}
                  </div>

                  <div className="space-y-5">
                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Problem statement</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.problemStatement || generatedBlueprint.problem_statement || 'No problem statement is available.'}</p>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">ML task</h4>
                      <p className="mt-3 text-sm font-medium text-[#1F1B16]">{generatedBlueprint.task || generatedBlueprint.ml_task || 'Other'}</p>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Datasets</h4>
                      <div className="mt-3 grid gap-3">
                        {(generatedBlueprint.datasets || []).map((dataset) => (
                          <button
                            key={`${dataset.name}-${dataset.source_url}`}
                            type="button"
                            onClick={() => setSelectedDataset(dataset)}
                            className="w-full rounded-[12px] border border-[#E4DCCB] bg-[#FFFCF5] p-3 text-left"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-[#1F1B16]">{dataset.name}</p>
                              <span className={`rounded-full border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] ${dataset.verified ? 'border-[#5C7A4B] bg-[#E9EFE2] text-[#5C7A4B]' : 'border-[#7A7064] bg-[#F3EFE8] text-[#7A7064]'}`}>
                                {dataset.verified ? 'Verified' : 'Unverified'}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#4D453E]">{dataset.reason}</p>
                          </button>
                        ))}
                        {(!generatedBlueprint.datasets || generatedBlueprint.datasets.length === 0) && (
                          <p className="text-sm text-[#4D453E]">No verified preview is available for this blueprint.</p>
                        )}
                      </div>

                      {selectedDataset && (
                        <div className="mt-4 rounded-[12px] border border-[#E4DCCB] bg-[#FFFCF5] p-4">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Dataset detail</p>
                          <h5 className="mt-2 text-lg text-[#1F1B16]">{selectedDataset.name}</h5>
                          <div className="mt-3 space-y-2 text-sm text-[#1F1B16]">
                            <p><span className="font-medium">Source:</span> <a href={selectedDataset.source_url} target="_blank" rel="noreferrer" className="text-[#B5532F] underline">{selectedDataset.source_url}</a></p>
                            <p><span className="font-medium">Reason:</span> {selectedDataset.reason}</p>
                            <p><span className="font-medium">Status:</span> {selectedDataset.verified ? 'Verified' : 'Unverified'}</p>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Stage-by-stage explanation</h4>
                      <div className="mt-3 space-y-3">
                        {stageOutputs.map((stage) => {
                          const isOpen = Boolean(expandedStages[stage.name])
                          return (
                            <div key={stage.name} className="rounded-[12px] border border-[#E4DCCB] bg-[#FFFCF5] p-3">
                              <button
                                type="button"
                                onClick={() => setExpandedStages((current) => ({ ...current, [stage.name]: !isOpen }))}
                                className="flex w-full items-center justify-between gap-3 text-left"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-[#1F1B16]">{stage.name.replace(/_/g, ' ')}</p>
                                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#7A7064]">{stage.status}</p>
                                </div>
                                <span className="text-sm text-[#7A7064]">{isOpen ? '−' : '+'}</span>
                              </button>
                              {isOpen && (
                                <div className="mt-3 border-t border-[#E4DCCB] pt-3 text-sm leading-6 text-[#1F1B16]">
                                  <p>{stage.explanation}</p>
                                  {stage.data && Object.keys(stage.data).length > 0 && (
                                    <pre className="mt-3 overflow-x-auto rounded-[8px] bg-[#F6F1E7] p-3 text-[11px] text-[#4D453E]">
                                      {JSON.stringify(stage.data, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Candidate algorithms</h4>
                      <div className="mt-3 space-y-3">
                        {(generatedBlueprint.candidateAlgorithms || []).map((algorithm) => (
                          <div key={algorithm.name} className="rounded-[12px] border border-[#E4DCCB] bg-[#FFFCF5] p-3">
                            <p className="text-sm font-semibold text-[#1F1B16]">{algorithm.name}</p>
                            <p className="mt-1 text-sm leading-6 text-[#4D453E]">{algorithm.reason}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Evaluation metrics</h4>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {(generatedBlueprint.evaluationMetrics || []).map((metric) => (
                          <li key={metric} className="rounded-full border border-[#E4DCCB] bg-[#FFFCF5] px-3 py-1.5 text-xs text-[#1F1B16]">
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Proposed training and evaluation pipeline</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.trainingPipeline || generatedBlueprint.training_pipeline || 'No training pipeline was produced.'}</p>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Deployment considerations</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.deploymentConsiderations || generatedBlueprint.deployment_considerations || 'No deployment details were produced.'}</p>
                    </section>
                  </div>

                  <div className="sticky bottom-2 mt-6 rounded-[12px] border border-[#D9C7B1] bg-[#F6F1E7] px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#4D453E]">
                    {generatedBlueprint.note || 'This blueprint is a recommendation and should be reviewed before implementation.'}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="reveal-panel rounded-[18px] border border-[#E4DCCB] bg-[#FFFCF5] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7064]">Project status</h2>
            </div>

            <div className="space-y-3">
              {[
                ['RAG preprocessing', 'Implemented'],
                ['RAG retrieval path', 'In progress'],
                ['Gemini-to-blueprint flow', 'In progress'],
                ['Critic review', 'Planned'],
                ['Export', 'Planned'],
              ].map(([label, status]) => (
                <div key={label} className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-[#1F1B16]">{label}</p>
                    <span
                      className={`rounded-full border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] ${
                        status === 'Implemented'
                          ? 'border-[#5C7A4B] bg-[#E9EFE2] text-[#5C7A4B]'
                          : status === 'In progress'
                            ? 'border-[#B5532F] bg-[#FBEFEA] text-[#B5532F]'
                            : 'border-[#7A7064] bg-[#F3EFE8] text-[#7A7064]'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[14px] border border-[#E4DCCB] bg-[#FFFCF5] p-4 text-sm leading-6 text-[#7A7064]">
              The project plan includes a curated knowledge base, requirement analysis, retrieval and recommendation, and a review step before blueprint generation.
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

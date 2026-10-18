import { useEffect, useState } from 'react'
import { generateBlueprint, getConversation, getPipelineStages } from '../api'

const exampleIdeas = [
  'I want to build a machine learning project that predicts customer churn for a telecom company.',
  'I want to build a machine learning project that forecasts product demand for a retail catalog.',
  'I want to build a clustering project that groups support tickets into recurring issue categories.',
]

const clarificationChoices = ['Customer churn', 'Demand forecast', 'Support ticket clustering']

const stageStatusStyles = {
  Planned: 'border-[#7A7064] bg-[#F3EFE8] text-[#7A7064]',
  'In progress': 'border-[#B5532F] bg-[#FBEFEA] text-[#B5532F]',
  Implemented: 'border-[#5C7A4B] bg-[#E9EFE2] text-[#5C7A4B]',
  failed: 'border-[#A4422A] bg-[#FDEAE7] text-[#A4422A]',
}

const normalizeStageStatus = (status) => {
  if (status === 'running') return 'In progress'
  if (status === 'done') return 'Implemented'
  if (status === 'waiting') return 'Planned'
  return status || 'Planned'
}

export default function ChatPage() {
  const [prompt, setPrompt] = useState('')
  const [conversation, setConversation] = useState({ messages: [], suggestions: [] })
  const [pipelineStages, setPipelineStages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [generatedBlueprint, setGeneratedBlueprint] = useState(null)

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
    setGeneratedBlueprint(null)

    const stageList = await getPipelineStages()
    setPipelineStages(
      stageList.map((stage) => ({
        ...stage,
        detail: stage.description,
        status: normalizeStageStatus('waiting'),
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
          text: 'I am mapping your idea into requirements, checking for missing details, and drafting a recommendation blueprint.',
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

      setGeneratedBlueprint(blueprint)
    } catch (error) {
      const message = error?.message || 'The blueprint generation failed.'
      setGenerationError(message)
      setPipelineStages((currentStages) =>
        currentStages.map((stage) => (
          stage.status === 'running' ? { ...stage, status: 'failed', detail: 'Stage failed' } : stage
        )),
      )
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
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="w-full rounded-full border border-[#E4DCCB] bg-[#F6F1E7] px-3 py-3 text-left text-sm leading-6 text-[#1F1B16] transition-colors duration-200 hover:border-[#B5532F] hover:bg-[#FFFCF5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]"
                >
                  {example}
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

              <div className="mt-6 rounded-[16px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Clarification Agent</p>
                </div>

                <div className="rounded-[14px] border border-[#E4DCCB] bg-[#FFFCF5] p-4">
                  <p className="text-base font-medium text-[#1F1B16]">What outcome do you want to predict?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {clarificationChoices.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setPrompt(`I want to build a machine learning project that ${choice.toLowerCase()} for a real-world system.`)}
                        className="rounded-full border border-[#E4DCCB] bg-[#F6F1E7] px-3 py-2 text-sm text-[#1F1B16] transition-colors duration-200 hover:border-[#B5532F] hover:bg-[#FFFCF5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] focus-visible:ring-offset-2"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {pipelineStages.length > 0 && (
                <div className="mt-6 rounded-[16px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Generation stages</p>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#7A7064]">
                      {pipelineStages.filter((stage) => stage.status === 'done').length} complete
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
                <div className="mt-4 rounded-[14px] border border-[#A4422A] bg-[#FDEAE7] p-3 text-sm text-[#A4422A]">
                  <div className="flex items-center justify-between gap-3">
                    <span>{generationError}</span>
                    <button
                      type="button"
                      onClick={() => handleGenerate(prompt)}
                      className="rounded-full border border-[#A4422A] bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#A4422A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4422A] focus-visible:ring-offset-2"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Conversation</p>

                <div className="space-y-3 rounded-[16px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                  {conversation.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[82%] rounded-[14px] px-4 py-3 text-sm leading-6 ${
                          message.author === 'user'
                            ? 'bg-[#1F1B16] text-[#FFFCF5]'
                            : 'border border-[#E4DCCB] bg-[#FFFCF5] text-[#1F1B16]'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {generatedBlueprint && (
                <div className="mt-6 rounded-[18px] border border-[#E4DCCB] bg-[#FFFCF5] p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Blueprint draft</p>
                      <h3 className="mt-2 text-2xl text-[#1F1B16]">{generatedBlueprint.title}</h3>
                    </div>
                    <span className="rounded-full border border-[#C9DCBE] bg-[#E9EFE2] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#5C7A4B]">
                      Recommendation
                    </span>
                  </div>

                  <div className="space-y-5">
                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Problem statement and objectives</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.problemStatement}</p>
                      <ul className="mt-3 space-y-2 text-sm text-[#1F1B16]">
                        {generatedBlueprint.objectives.map((objective) => (
                          <li key={objective} className="flex gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#B5532F]" aria-hidden="true" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">ML task</h4>
                      <p className="mt-3 text-sm font-medium text-[#1F1B16]">{generatedBlueprint.task}</p>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Dataset requirements and possible sources</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.datasetRequirements}</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {generatedBlueprint.possibleSources.map((source) => (
                          <li key={source} className="rounded-full border border-[#E4DCCB] bg-[#FFFCF5] px-3 py-1.5 text-xs text-[#1F1B16]">
                            {source}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Preprocessing recommendations</h4>
                      <ul className="mt-3 space-y-2 text-sm text-[#1F1B16]">
                        {generatedBlueprint.preprocessingRecommendations.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#5C7A4B]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Feature engineering strategy</h4>
                      <ul className="mt-3 space-y-2 text-sm text-[#1F1B16]">
                        {generatedBlueprint.featureEngineeringStrategy.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#B5532F]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Candidate algorithms with the reasons for each</h4>
                      <div className="mt-3 space-y-3">
                        {generatedBlueprint.candidateAlgorithms.map((algorithm) => (
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
                        {generatedBlueprint.evaluationMetrics.map((metric) => (
                          <li key={metric} className="rounded-full border border-[#E4DCCB] bg-[#FFFCF5] px-3 py-1.5 text-xs text-[#1F1B16]">
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Proposed training and evaluation pipeline</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.trainingPipeline}</p>
                    </section>

                    <section className="rounded-[14px] border border-[#E4DCCB] bg-[#F6F1E7] p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A7064]">Deployment considerations</h4>
                      <p className="mt-3 text-sm leading-7 text-[#1F1B16]">{generatedBlueprint.deploymentConsiderations}</p>
                    </section>
                  </div>

                  <div className="sticky bottom-2 mt-6 rounded-[12px] border border-[#D9C7B1] bg-[#F6F1E7] px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#4D453E]">
                    {generatedBlueprint.note}
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
              The project plan includes a six-document knowledge base, requirement analysis, clarification when details are missing, and a review step before blueprint generation.
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

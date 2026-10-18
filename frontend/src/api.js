const fallbackBaseUrl = 'http://localhost:8000'

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl

export const API_CONTRACT = {
  sessionStart: '/api/sessions',
  blueprintRequest: '/blueprints',
  blueprintFetch: '/api/blueprints/:blueprintId',
}

const fixtureConversation = {
  messages: [
    {
      id: 'msg-1',
      author: 'assistant',
      text: 'I can help turn a machine learning idea into a structured project plan. Tell me the goal, the likely task, and the data you expect to use.',
    },
    {
      id: 'msg-2',
      author: 'user',
      text: 'I want to build a machine learning project that predicts customer churn for a telecom company.',
    },
  ],
  suggestions: [
    'I want to build a machine learning project that predicts customer churn for a telecom company.',
    'I want to build a project that predicts demand for a retail inventory workflow.',
    'I want to build a clustering project that groups support tickets by recurring issue type.',
  ],
}

const fixtureStages = [
  {
    id: 'user-input',
    title: 'User input',
    description: 'A plain-language machine learning idea enters the workflow.',
    status: 'Implemented',
  },
  {
    id: 'requirement-analysis',
    title: 'Requirement analysis',
    description: 'Requirements are structured and the strongest project objective is defined.',
    status: 'Implemented',
  },
  {
    id: 'rag-preprocessing',
    title: 'RAG preprocessing',
    description: 'Curated documents are prepared for retrieval and search.',
    status: 'Implemented',
  },
  {
    id: 'rag-retrieval',
    title: 'RAG retrieval',
    description: 'Relevant context is retrieved from the curated knowledge base.',
    status: 'In progress',
  },
  {
    id: 'gemini-recommendation',
    title: 'Gemini recommendation',
    description: 'Approaches are recommended with explanations grounded in retrieved context.',
    status: 'In progress',
  },
  {
    id: 'critic-check',
    title: 'Critic check',
    description: 'A critique step checks consistency and completeness before planning.',
    status: 'Planned',
  },
  {
    id: 'blueprint-generation',
    title: 'Blueprint generation',
    description: 'The structured project blueprint is assembled for review.',
    status: 'In progress',
  },
  {
    id: 'export',
    title: 'Export',
    description: 'Export is planned and not implemented yet.',
    status: 'Planned',
  },
]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const DEFAULT_REQUEST_TIMEOUT_MS = 15000

const isNetworkFailure = (error) => {
  if (!error) return false
  if (error.name === 'AbortError') return true
  if (error.isNetworkFailure) return true
  if (error.status === 0 || error.status === 408) return true
  return /Failed to fetch|NetworkError|ERR_CONNECTION_REFUSED|timed out|fetch/i.test(error.message || '')
}

export const buildFixtureBlueprint = (prompt = '') => {
  const trimmedPrompt = (prompt || '').trim()
  const lowerPrompt = trimmedPrompt.toLowerCase()

  const isChurn = lowerPrompt.includes('churn')
  const isForecast = lowerPrompt.includes('forecast') || lowerPrompt.includes('demand')
  const isClustering = lowerPrompt.includes('cluster') || lowerPrompt.includes('group')

  const problemStatement = isChurn
    ? 'The project seeks to predict customer churn for a telecom company by identifying customers whose behavior and engagement patterns suggest a higher risk of attrition.'
    : isForecast
      ? 'The project seeks to forecast demand or risk drivers from historical operational and customer signals so that the team can plan capacity, offer timing, or intervention strategy.'
      : isClustering
        ? 'The project seeks to group similar customer or support records into meaningful clusters to reveal patterns, segment behavior, and guide targeted interventions.'
        : 'The project seeks to turn a business goal into a tractable machine learning plan by clarifying the desired outcome, the likely data sources, and the best modeling approach.'

  const task = isChurn ? 'Classification' : isForecast ? 'Regression' : isClustering ? 'Clustering' : 'Other'

  return {
    id: 'fixture-blueprint',
    title: 'Recommendation blueprint',
    prompt: trimmedPrompt || 'Machine learning initiative for a practical project plan.',
    summary: problemStatement,
    problemStatement,
    objectives: [
      'Clarify the business outcome and the decision the model should support.',
      'Map the task to a suitable ML pattern for the available data and constraints.',
      'Define a practical workflow for data quality, modeling, and review before deployment.',
    ],
    task,
    datasetRequirements: 'The dataset should cover the target outcome, relevant business context, and the variables that matter to the decision being supported.',
    possibleSources: ['internal operational data', 'customer records', 'historical logs', 'domain-specific sources'],
    preprocessingRecommendations: [
      'Review missing values, duplicates, and invalid records before modeling.',
      'Normalize or encode categorical fields in a way that matches the chosen model family.',
      'Check for leakage by separating any feature derived from the target or future information.',
    ],
    featureEngineeringStrategy: [
      'Create domain-informed features from the known conditions that drive the outcome.',
      'Aggregate signals into temporal or behavioral summaries when raw records are noisy or sparse.',
      'Review whether engineered features help explain the prediction without leaking the target.',
    ],
    candidateAlgorithms: [
      { name: 'Baseline model', reason: 'A simple starting point that anchors the project around a clear target and validation flow.' },
      { name: 'Gradient boosting or tree-based model', reason: 'Useful when feature interactions matter and the business outcome is driven by structured tabular signals.' },
      { name: 'Model comparison set', reason: 'Reviewing multiple model families keeps the recommendation grounded in the task and the available data.' },
    ],
    evaluationMetrics: ['Task-appropriate metric set', 'Error review', 'Calibration or ranking review'],
    trainingPipeline: 'The workflow should begin with a clear target definition, then move through data preparation, feature construction, baseline comparison, and validation on a held-out set.',
    deploymentConsiderations: 'Deployment should be planned after the recommendation is reviewed for data drift, operating constraints, and the monitoring process needed to maintain trust in the system.',
    note: 'This blueprint is a set of recommendations and does not guarantee a trained, accurate model.',
    source: 'fixture',
    status: 'fixture',
  }
}

async function requestJson(url, options = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

  console.info('[BuildMyML] Request start', { url, method: options.method || 'GET', timeoutMs })

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    })

    console.info('[BuildMyML] Request response', { url, status: response.status, ok: response.ok })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = data?.detail || data?.message || data?.error || `Request failed with HTTP ${response.status}.`
      const error = new Error(message)
      error.status = response.status
      throw error
    }

    return data
  } catch (error) {
    const networkFailure = isNetworkFailure(error)
    console.error('[BuildMyML] Request failed', {
      url,
      status: error?.status ?? (networkFailure ? 0 : 'unknown'),
      error: error?.message || 'Unknown error',
    })

    if (networkFailure && error?.name === 'AbortError') {
      const timedOutError = new Error(`Request timed out after ${timeoutMs}ms.`)
      timedOutError.status = 408
      timedOutError.isNetworkFailure = true
      throw timedOutError
    }

    if (networkFailure) {
      const networkError = new Error(error?.message || 'The backend is not reachable.')
      networkError.isNetworkFailure = true
      networkError.status = 0
      throw networkError
    }

    throw error
  } finally {
    clearTimeout(timeoutHandle)
  }
}

export const startSession = async (idea) => {
  try {
    return await requestJson(`${getBaseUrl()}${API_CONTRACT.sessionStart}`, {
      method: 'POST',
      body: JSON.stringify({ idea }),
    })
  } catch (error) {
    return {
      status: 'fixture',
      message: 'The backend is unavailable; using fixture session data instead.',
      session_id: 'fixture-session',
      idea,
      requirements: { task: 'other' },
      source: 'fixture',
    }
  }
}

export const requestBlueprint = async ({ session_id, idea, answers = {} }) => {
  const requestUrl = `${getBaseUrl()}${API_CONTRACT.blueprintRequest}`

  try {
    return await requestJson(requestUrl, {
      method: 'POST',
      body: JSON.stringify({ session_id, idea, answers }),
    }, 15000)
  } catch (error) {
    if (isNetworkFailure(error)) {
      return {
        status: 'fixture',
        message: 'Showing sample data because the backend is not reachable.',
        blueprint: buildFixtureBlueprint(idea),
        source: 'fixture',
        stage_statuses: {
          requirement_analysis: 'sample',
          rag_retrieval: 'sample',
          gemini_recommendation: 'sample',
          blueprint_generation: 'sample',
        },
        stage_outputs: [
          { name: 'requirement_analysis', status: 'sample', explanation: 'Sample data is shown because the backend is not reachable.', data: {} },
          { name: 'rag_retrieval', status: 'sample', explanation: 'Sample data is shown because the backend is not reachable.', data: {} },
          { name: 'gemini_recommendation', status: 'sample', explanation: 'Sample data is shown because the backend is not reachable.', data: {} },
          { name: 'blueprint_generation', status: 'sample', explanation: 'Sample data is shown because the backend is not reachable.', data: {} },
        ],
      }
    }

    return {
      status: 'failed',
      failed_stage: 'gemini_recommendation',
      error: error?.message || 'The blueprint generation failed.',
      message: error?.message || 'The blueprint generation failed.',
      stage_statuses: {
        requirement_analysis: 'done',
        rag_retrieval: 'done',
        gemini_recommendation: 'failed',
        blueprint_generation: 'failed',
      },
      stage_outputs: [
        { name: 'requirement_analysis', status: 'completed', explanation: 'The requirement stage ran successfully.', data: {} },
        { name: 'rag_retrieval', status: 'completed', explanation: 'The retrieval stage ran successfully.', data: {} },
        { name: 'gemini_recommendation', status: 'failed', explanation: error?.message || 'The blueprint generation failed.', data: { error: error?.message || 'The blueprint generation failed.' } },
        { name: 'blueprint_generation', status: 'failed', explanation: 'Blueprint assembly could not finish because the recommendation stage failed.', data: { error: error?.message || 'The blueprint generation failed.' } },
      ],
    }
  }
}

export const exportBlueprint = async (blueprintId, format = 'json') => {
  const url = `${getBaseUrl()}/blueprints/${blueprintId}/export?format=${encodeURIComponent(format)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}.`)
  }
  if (format === 'zip') {
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${blueprintId}.zip`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
    return { ok: true }
  }
  return response.text()
}

export const fetchBlueprint = async (blueprintId) => {
  try {
    return await requestJson(`${getBaseUrl()}${API_CONTRACT.blueprintFetch.replace(':blueprintId', blueprintId)}`)
  } catch (error) {
    return {
      status: 'fixture',
      blueprint_id: blueprintId,
      blueprint: buildFixtureBlueprint(),
      source: 'fixture',
    }
  }
}

const parseEventPayload = (rawText) => {
  if (!rawText || !rawText.trim()) return null
  const trimmedText = rawText.trim()
  if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
    try {
      return JSON.parse(trimmedText)
    } catch {
      return null
    }
  }

  const lines = trimmedText.split(/\r?\n/).filter(Boolean)
  let eventType = 'message'
  let dataText = ''
  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.replace(/^event:\s*/, '').trim()
      continue
    }
    if (line.startsWith('data:')) {
      dataText += `${dataText ? '\n' : ''}${line.replace(/^data:\s*/, '').trim()}`
    }
  }
  if (!dataText) return null

  try {
    return { type: eventType, ...(JSON.parse(dataText)) }
  } catch {
    return null
  }
}

const readStreamBlueprint = async (response, onStageUpdate = () => {}) => {
  if (!response.body) {
    return buildFixtureBlueprint()
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalBlueprint = null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split(/\r?\n\r?\n/)
    buffer = chunks.pop() ?? ''

    for (const chunk of chunks) {
      const payload = parseEventPayload(chunk)
      if (!payload) continue
      if (payload.stageId || payload.id || payload.status) {
        onStageUpdate({ stageId: payload.stageId || payload.id, status: payload.status, message: payload.message || payload.label || 'Stage updated' })
      }
      if (payload.type === 'blueprint' || payload.blueprint || payload.title) {
        finalBlueprint = payload.blueprint || payload
        onStageUpdate({ type: 'blueprint', blueprint: finalBlueprint })
      }
      if (payload.type === 'error' || payload.error) {
        const errorMessage = payload.message || payload.error || 'The blueprint generation failed.'
        onStageUpdate({ stageId: payload.stageId || payload.id, status: 'failed', message: errorMessage })
        throw new Error(errorMessage)
      }
    }
  }

  if (buffer.trim()) {
    const payload = parseEventPayload(buffer)
    if (payload && (payload.stageId || payload.id || payload.status)) {
      onStageUpdate({ stageId: payload.stageId || payload.id, status: payload.status, message: payload.message || payload.label || 'Stage updated' })
    }
    if (payload && (payload.type === 'blueprint' || payload.blueprint || payload.title)) {
      finalBlueprint = payload.blueprint || payload
      onStageUpdate({ type: 'blueprint', blueprint: finalBlueprint })
    }
  }

  return finalBlueprint || buildFixtureBlueprint()
}

const runPlaceholderBlueprintFlow = async (prompt = '', onStageUpdate = () => {}) => {
  const stages = await getPipelineStages()
  for (const [index, stage] of stages.entries()) {
    onStageUpdate({ stageId: stage.id, status: 'running', message: `Reviewing ${stage.title.toLowerCase()}.` })
    await wait(220 + index * 120)
    onStageUpdate({ stageId: stage.id, status: 'done', message: `${stage.title} completed.` })
  }

  const blueprint = buildFixtureBlueprint(prompt)
  onStageUpdate({ type: 'blueprint', blueprint })
  return blueprint
}

const mapStageStatus = (stageKey) => {
  const map = {
    requirement_analysis: 'requirement-analysis',
    rag_retrieval: 'rag-retrieval',
    gemini_recommendation: 'gemini-recommendation',
    blueprint_generation: 'blueprint-generation',
  }
  return map[stageKey] || stageKey
}

export const generateBlueprint = async (prompt, onStageUpdate = () => {}) => {
  const trimmedPrompt = (prompt ?? '').trim()
  if (!trimmedPrompt) {
    throw new Error('Describe the project before generating the blueprint.')
  }

  try {
    const blueprintResult = await requestBlueprint({
      session_id: 'live-session',
      idea: trimmedPrompt,
      answers: {},
    })

    if (blueprintResult.stage_statuses) {
      Object.entries(blueprintResult.stage_statuses).forEach(([stageKey, stageStatus]) => {
        const stageId = mapStageStatus(stageKey)
        const normalizedStatus = stageStatus === 'done' || stageStatus === 'completed' ? 'done' : stageStatus === 'failed' ? 'failed' : stageStatus === 'sample' ? 'sample' : stageStatus === 'skipped' ? 'Planned' : 'waiting'
        onStageUpdate({
          stageId,
          status: normalizedStatus,
          message: stageStatus === 'failed'
            ? (blueprintResult.error || blueprintResult.message || 'Stage failed.')
            : stageStatus === 'sample'
              ? 'Sample output shown while the backend is unreachable.'
              : stageStatus === 'skipped'
                ? 'This stage is planned and intentionally skipped.'
                : `${stageId.replace(/-/g, ' ')} completed.`,
        })
      })
    }

    if (blueprintResult.stage_outputs && blueprintResult.stage_outputs.length > 0) {
      blueprintResult.stage_outputs.forEach((stageOutput) => {
        const stageId = mapStageStatus(stageOutput.name)
        const normalizedStatus = stageOutput.status === 'completed' ? 'done' : stageOutput.status === 'failed' ? 'failed' : stageOutput.status === 'sample' ? 'sample' : stageOutput.status === 'skipped' ? 'Planned' : 'waiting'
        onStageUpdate({
          stageId,
          status: normalizedStatus,
          message: stageOutput.explanation || stageOutput.data?.error || 'Stage updated.',
        })
      })
    }

    if (blueprintResult.status === 'fixture') {
      const blueprint = blueprintResult.blueprint || buildFixtureBlueprint(trimmedPrompt)
      onStageUpdate({ type: 'blueprint', blueprint, source: 'fixture' })
      return {
        ...blueprint,
        status: 'fixture',
        source: 'fixture',
        message: blueprintResult.message || 'Showing sample data because the backend is not reachable.',
        stage_outputs: blueprintResult.stage_outputs || [],
      }
    }

    if (blueprintResult.status === 'failed') {
      const message = blueprintResult.error || blueprintResult.message || 'The blueprint generation failed.'
      onStageUpdate({
        stageId: mapStageStatus(blueprintResult.failed_stage || 'gemini_recommendation'),
        status: 'failed',
        message,
      })
      return {
        status: 'failed',
        message,
        failed_stage: blueprintResult.failed_stage,
        source: 'backend',
        stage_outputs: blueprintResult.stage_outputs || [],
      }
    }

    if (blueprintResult.blueprint) {
      onStageUpdate({ type: 'blueprint', blueprint: blueprintResult.blueprint, source: 'backend' })
      return {
        ...blueprintResult.blueprint,
        source: 'backend',
        status: 'ready',
        stage_statuses: blueprintResult.stage_statuses,
        stage_outputs: blueprintResult.stage_outputs || [],
      }
    }

    const fallback = buildFixtureBlueprint(trimmedPrompt)
    onStageUpdate({ type: 'blueprint', blueprint: fallback, source: 'fixture' })
    return { ...fallback, source: 'fixture', status: 'fixture', message: 'Showing sample data because the backend is not reachable.', stage_outputs: blueprintResult.stage_outputs || [] }
  } catch (error) {
    const fallback = buildFixtureBlueprint(trimmedPrompt)
    onStageUpdate({ type: 'blueprint', blueprint: fallback, source: 'fixture' })
    return {
      ...fallback,
      source: 'fixture',
      status: 'fixture',
      message: 'Showing sample data because the backend is not reachable.',
      stage_outputs: [],
    }
  }
}

export const getApiBaseUrl = () => getBaseUrl()
export const getConversation = async () => fixtureConversation
export const getBlueprints = async () => []
export const getPipelineStages = async () => fixtureStages

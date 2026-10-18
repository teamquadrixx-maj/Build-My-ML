const fallbackBaseUrl = 'http://localhost:8000'

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl

export const API_CONTRACT = {
  sessionStart: '/api/sessions',
  sessionClarify: '/api/sessions/:sessionId/clarify',
  blueprintRequest: '/api/blueprints',
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
    description: 'Requirements are structured and missing information is flagged.',
    status: 'Implemented',
  },
  {
    id: 'clarification-loop',
    title: 'Clarification loop',
    description: 'The Clarification Agent asks for missing details when the task is unclear.',
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

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'The request failed.')
  }
  return data
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
      clarification_questions: [],
      source: 'fixture',
    }
  }
}

export const answerClarification = async (sessionId, questionId, answer) => {
  try {
    return await requestJson(`${getBaseUrl()}${API_CONTRACT.sessionClarify.replace(':sessionId', sessionId)}`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, question_id: questionId, answer }),
    })
  } catch (error) {
    return {
      status: 'fixture',
      message: 'Clarification answers are not available because the backend is unreachable.',
      source: 'fixture',
    }
  }
}

export const requestBlueprint = async ({ session_id, idea, answers = {} }) => {
  try {
    return await requestJson(`${getBaseUrl()}${API_CONTRACT.blueprintRequest}`, {
      method: 'POST',
      body: JSON.stringify({ session_id, idea, answers }),
    })
  } catch (error) {
    return {
      status: 'fixture',
      message: 'The blueprint pipeline is unavailable; returning fixture data instead.',
      blueprint: buildFixtureBlueprint(idea),
      source: 'fixture',
    }
  }
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

export const generateBlueprint = async (prompt, onStageUpdate = () => {}) => {
  const trimmedPrompt = (prompt ?? '').trim()
  if (!trimmedPrompt) {
    throw new Error('Describe the project before generating the blueprint.')
  }

  try {
    const session = await startSession(trimmedPrompt)
    if (session.status === 'fixture') {
      const blueprint = buildFixtureBlueprint(trimmedPrompt)
      onStageUpdate({ type: 'blueprint', blueprint })
      return { ...blueprint, status: 'fixture', source: 'fixture' }
    }

    if (session.status === 'clarification_required' || (session.clarification_questions && session.clarification_questions.length > 0)) {
      onStageUpdate({ type: 'clarification', questions: session.clarification_questions })
      return {
        status: 'clarification_required',
        ...session,
        source: 'backend',
      }
    }

    const blueprintResult = await requestBlueprint({
      session_id: session.session_id,
      idea: trimmedPrompt,
      answers: {},
    })

    if (blueprintResult.status === 'error' || blueprintResult.status === 'partial') {
      const fallback = buildFixtureBlueprint(trimmedPrompt)
      onStageUpdate({ type: 'blueprint', blueprint: fallback })
      return { ...fallback, source: 'fixture', status: 'fixture', message: blueprintResult.message || 'The pipeline is unavailable; fixture data was returned.' }
    }

    if (blueprintResult.blueprint) {
      onStageUpdate({ type: 'blueprint', blueprint: blueprintResult.blueprint })
      return { ...blueprintResult.blueprint, source: 'backend', status: 'ready' }
    }

    const fallback = buildFixtureBlueprint(trimmedPrompt)
    onStageUpdate({ type: 'blueprint', blueprint: fallback })
    return { ...fallback, source: 'fixture', status: 'fixture' }
  } catch (error) {
    const fallback = buildFixtureBlueprint(trimmedPrompt)
    onStageUpdate({ type: 'blueprint', blueprint: fallback })
    return { ...fallback, source: 'fixture', status: 'fixture', message: error.message || 'The backend is unavailable.' }
  }
}

export const getApiBaseUrl = () => getBaseUrl()
export const getConversation = async () => fixtureConversation
export const getBlueprints = async () => []
export const getPipelineStages = async () => fixtureStages

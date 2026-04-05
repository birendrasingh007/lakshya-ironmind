import { useState } from 'react'

// Parse the Claude-generated plan into structured sections
function parsePlan(text) {
  const sections = []
  let current = null

  text.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      if (current) sections.push(current)
      current = { title: trimmed.replace(/^##\s*/, ''), items: [] }
    } else if (/^[-•*]\s+/.test(trimmed) && current) {
      current.items.push(trimmed.replace(/^[-•*]\s+/, ''))
    } else if (trimmed && current && !trimmed.startsWith('#')) {
      // Fold orphan paragraphs into the current section
      current.items.push(trimmed)
    }
  })
  if (current) sections.push(current)
  return sections
}

const SECTION_STYLES = [
  'bg-amber-50 border-amber-100',
  'bg-blue-50 border-blue-100',
  'bg-emerald-50 border-emerald-100',
  'bg-orange-50 border-orange-100',
  'bg-purple-50 border-purple-100',
  'bg-indigo-50 border-indigo-100',
]

export default function PlanReview({ plan, onPlanChange, onApprove, onRegenerate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const sections = parsePlan(plan)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-4 pb-28">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Plan for Today 🗓️</h2>
        <p className="text-sm text-slate-400 mt-0.5">{today}</p>
      </div>

      {isEditing ? (
        /* Edit mode */
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">Edit Plan</span>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Done ✓
            </button>
          </div>
          <textarea
            value={plan}
            onChange={(e) => onPlanChange(e.target.value)}
            rows={22}
            className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none font-mono leading-relaxed"
          />
        </div>
      ) : sections.length > 0 ? (
        /* Parsed card view */
        sections.map((section, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 border ${SECTION_STYLES[idx % SECTION_STYLES.length]}`}
          >
            <h3 className="font-semibold text-slate-800 mb-3 text-base">{section.title}</h3>
            {section.items.length > 0 ? (
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-snug">
                    <span className="text-slate-300 mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No items for this section.</p>
            )}
          </div>
        ))
      ) : (
        /* Fallback: raw text */
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {plan}
          </pre>
        </div>
      )}

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 shadow-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2.5">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {regenerating ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Regenerating…
              </span>
            ) : (
              '↻ Regenerate'
            )}
          </button>

          <button
            onClick={() => setIsEditing((v) => !v)}
            className="flex-1 py-3 border-2 border-indigo-200 text-indigo-600 font-medium rounded-xl hover:border-indigo-300 hover:bg-indigo-50 active:bg-indigo-100 transition-all text-sm"
          >
            {isEditing ? '👁 Preview' : '✏️ Edit'}
          </button>

          <button
            onClick={onApprove}
            className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 active:bg-emerald-700 transition-colors text-sm shadow-md shadow-emerald-200"
          >
            ✓ Approve
          </button>
        </div>
      </div>
    </div>
  )
}

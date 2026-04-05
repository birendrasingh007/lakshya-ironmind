// Pull the first 4 bullet items from the approved plan as highlights
function extractHighlights(text) {
  return text
    .split('\n')
    .filter((l) => /^[-•*]\s+/.test(l.trim()))
    .slice(0, 4)
    .map((l) => l.trim().replace(/^[-•*]\s+/, ''))
}

export default function Confirmation({ plan, onReset }) {
  const highlights = extractHighlights(plan)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-5 pt-4">
      {/* Success hero */}
      <div className="flex flex-col items-center py-10 text-center space-y-3">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-4xl">✅</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Plan Approved!</h2>
          <p className="text-slate-400 text-sm mt-1">{today}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
          <span className="text-sm font-medium text-emerald-700">Locked in and ready to go</span>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Plan Highlights
          </h3>
          <ul className="space-y-3">
            {highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-snug">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 text-xs">✓</span>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What's next */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="font-semibold text-indigo-800 mb-1.5">What's next?</h3>
        <p className="text-sm text-indigo-600 leading-relaxed">
          Smart nudges will check in with you throughout the day to keep you on track.
          Come back tonight to review your evening summary and habit log.
        </p>
      </div>

      {/* Nudge cards preview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { time: '12:00 PM', label: 'Midday check-in', icon: '☀️' },
          { time: '4:00 PM', label: 'Habit reminder', icon: '📋' },
          { time: '8:00 PM', label: 'Evening summary', icon: '🌙' },
        ].map((nudge) => (
          <div key={nudge.time} className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
            <div className="text-xl mb-1">{nudge.icon}</div>
            <div className="text-xs font-semibold text-slate-500">{nudge.time}</div>
            <div className="text-xs text-slate-400 leading-tight mt-0.5">{nudge.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 border-2 border-slate-200 text-slate-500 font-medium rounded-2xl hover:border-slate-300 hover:text-slate-700 transition-all text-sm"
      >
        ↩ Start a New Day
      </button>
    </div>
  )
}

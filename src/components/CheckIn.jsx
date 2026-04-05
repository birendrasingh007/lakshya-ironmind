import { useState } from 'react'

const ENERGY_CONFIG = [
  { level: 1, emoji: '😴', label: 'Very Low' },
  { level: 2, emoji: '😐', label: 'Low' },
  { level: 3, emoji: '🙂', label: 'Moderate' },
  { level: 4, emoji: '😊', label: 'High' },
  { level: 5, emoji: '⚡', label: 'Peak' },
]

const MOOD_OPTIONS = ['Calm', 'Focused', 'Motivated', 'Stressed', 'Tired', 'Anxious', 'Happy', 'Restless']

function sleepQuality(hours) {
  if (hours >= 8) return { label: 'Excellent', color: 'text-emerald-600' }
  if (hours >= 7) return { label: 'Good', color: 'text-emerald-500' }
  if (hours >= 6) return { label: 'Adequate', color: 'text-amber-500' }
  return { label: 'Short', color: 'text-red-500' }
}

export default function CheckIn({ onSubmit }) {
  const [energyLevel, setEnergyLevel] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  const [mood, setMood] = useState('')
  const [goals, setGoals] = useState('')

  const quality = sleepQuality(sleepHours)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!mood) return
    onSubmit({ energyLevel, sleepHours, mood, goals })
  }

  const adjustSleep = (delta) => {
    setSleepHours((h) => Math.min(12, Math.max(1, parseFloat((h + delta).toFixed(1)))))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="pt-2 pb-1">
        <h2 className="text-2xl font-bold text-slate-900">Good morning! 🌅</h2>
        <p className="text-slate-500 mt-1 text-sm">Let's build your personalized plan for today.</p>
      </div>

      {/* Energy */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-700 mb-4">How's your energy right now?</p>
        <div className="flex gap-2">
          {ENERGY_CONFIG.map(({ level, emoji, label }) => (
            <button
              key={level}
              type="button"
              onClick={() => setEnergyLevel(level)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all ${
                energyLevel === level
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <span
                className={`text-xs font-medium leading-tight text-center ${
                  energyLevel === level ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-700 mb-4">Hours of sleep last night?</p>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => adjustSleep(-0.5)}
            className="w-11 h-11 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors text-xl font-light select-none"
          >
            −
          </button>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 tabular-nums">{sleepHours}</div>
            <div className="text-slate-400 text-sm">hrs</div>
            <div className={`text-xs font-semibold mt-0.5 ${quality.color}`}>{quality.label}</div>
          </div>
          <button
            type="button"
            onClick={() => adjustSleep(0.5)}
            className="w-11 h-11 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors text-xl font-light select-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Mood */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-700 mb-3">How would you describe your mood?</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                mood === m
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-100 text-slate-600 hover:border-slate-200 bg-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-700 mb-2">
          Today's main focus{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </p>
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="e.g. Finish the project proposal, run 5K, meal prep for the week..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none text-sm transition-shadow"
        />
      </div>

      <button
        type="submit"
        disabled={!mood}
        className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-md shadow-indigo-100"
      >
        View My Fitness Data
        <span aria-hidden>→</span>
      </button>
    </form>
  )
}

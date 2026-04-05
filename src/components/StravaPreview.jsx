const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Peak']

export default function StravaPreview({ data, checkIn, onGenerate, onBack }) {
  const { lastActivity, weeklyStats, recentActivities } = data

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Your Fitness Snapshot 📊</h2>
        <p className="text-slate-500 text-sm mt-1">Here's the data we'll use to build your plan.</p>
      </div>

      {/* Check-in summary pill row */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-wrap gap-x-5 gap-y-2">
        <Pill label="Energy" value={ENERGY_LABELS[checkIn.energyLevel]} />
        <Pill label="Sleep" value={`${checkIn.sleepHours} hrs`} />
        <Pill label="Mood" value={checkIn.mood} />
        {checkIn.goals && (
          <div className="w-full flex items-start gap-2 text-sm">
            <span className="text-indigo-400 font-medium flex-shrink-0">Focus:</span>
            <span className="text-indigo-700">{checkIn.goals}</span>
          </div>
        )}
      </div>

      {/* Last activity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
            🏃
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Last Activity</div>
            <div className="font-semibold text-slate-800 truncate">{lastActivity.name}</div>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0">{lastActivity.date}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Distance', value: lastActivity.distance },
            { label: 'Duration', value: lastActivity.duration },
            { label: 'Avg Pace', value: lastActivity.pace },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-base font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Weekly Goal Progress</span>
          <span className="text-sm text-slate-500">
            {weeklyStats.totalDistance} / {weeklyStats.weeklyGoal}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${weeklyStats.goalProgress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Days', value: weeklyStats.activeDays, color: 'text-slate-800' },
            { label: 'Total Time', value: weeklyStats.totalTime, color: 'text-slate-800' },
            { label: 'Goal', value: `${weeklyStats.goalProgress}%`, color: 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activities mini list */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-700 mb-3">This Week's Activities</p>
        <div className="flex gap-2">
          {recentActivities.map((a, i) => (
            <div key={i} className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xs font-semibold text-slate-500 uppercase">{a.day}</div>
              <div className="text-sm mt-1">{a.type === 'Run' ? '🏃' : '🚴'}</div>
              <div className="text-xs font-medium text-slate-600 mt-1">{a.distance}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-violet-700 active:from-indigo-800 active:to-violet-800 transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-indigo-200"
      >
        ✨ Generate My Personalized Plan
      </button>
    </div>
  )
}

function Pill({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-indigo-400 font-medium">{label}:</span>
      <span className="text-indigo-800 font-semibold">{value}</span>
    </div>
  )
}

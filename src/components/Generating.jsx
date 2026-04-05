export default function Generating({ streamingText }) {
  if (streamingText) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-slate-500 font-medium">Generating your plan…</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {streamingText}
            <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-8">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-indigo-100 animate-ping opacity-50" />
        <div className="absolute w-16 h-16 rounded-full bg-indigo-200 animate-pulse" />
        <div className="relative w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-300">
          <span className="text-2xl">✨</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-800">Crafting your plan…</h2>
        <p className="text-sm text-slate-500">Analyzing fitness data and today's check-in</p>
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

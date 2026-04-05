import { useState } from 'react'
import CheckIn from './components/CheckIn'
import StravaPreview from './components/StravaPreview'
import Generating from './components/Generating'
import PlanReview from './components/PlanReview'
import Confirmation from './components/Confirmation'
import { generatePlan } from './api/claude'

const MOCK_STRAVA = {
  lastActivity: {
    type: 'Run',
    name: 'Morning Tempo Run',
    date: 'Yesterday',
    distance: '5.2 km',
    duration: '28:14',
    pace: '5:26 /km',
    heartRate: 158,
  },
  weeklyStats: {
    totalDistance: '18.4 km',
    totalTime: '1h 42m',
    activeDays: 3,
    weeklyGoal: '25 km',
    goalProgress: 74,
  },
  recentActivities: [
    { day: 'Mon', type: 'Run', distance: '5.2 km' },
    { day: 'Wed', type: 'Ride', distance: '7.1 km' },
    { day: 'Fri', type: 'Run', distance: '6.1 km' },
  ],
}

const STEPS = ['checkin', 'strava', 'generating', 'review', 'approved']

export default function App() {
  const [step, setStep] = useState('checkin')
  const [checkIn, setCheckIn] = useState(null)
  const [streamingText, setStreamingText] = useState('')
  const [finalPlan, setFinalPlan] = useState('')
  const [editedPlan, setEditedPlan] = useState('')
  const [error, setError] = useState(null)

  const runGenerate = async (checkInData) => {
    setStep('generating')
    setStreamingText('')
    setError(null)
    try {
      const plan = await generatePlan(checkInData, MOCK_STRAVA, (chunk) => {
        setStreamingText(chunk)
      })
      setFinalPlan(plan)
      setEditedPlan(plan)
      setStep('review')
    } catch (err) {
      setError(err.message)
      setStep(checkInData ? 'strava' : 'checkin')
    }
  }

  const handleCheckInSubmit = (data) => {
    setCheckIn(data)
    setStep('strava')
  }

  const handleGenerate = () => runGenerate(checkIn)

  const handleRegenerate = () => runGenerate(checkIn)

  const handleApprove = () => setStep('approved')

  const handleReset = () => {
    setStep('checkin')
    setCheckIn(null)
    setStreamingText('')
    setFinalPlan('')
    setEditedPlan('')
    setError(null)
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">LI</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-slate-900 leading-tight">lakshya-ironmind</h1>
            <p className="text-xs text-slate-400 leading-tight">Health &amp; Habit Co-Pilot</p>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`rounded-full transition-all duration-300 ${
                  i < stepIndex
                    ? 'w-2 h-2 bg-indigo-400'
                    : i === stepIndex
                    ? 'w-3 h-2 bg-indigo-600'
                    : 'w-2 h-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {step === 'checkin' && (
          <CheckIn onSubmit={handleCheckInSubmit} />
        )}
        {step === 'strava' && (
          <StravaPreview
            data={MOCK_STRAVA}
            checkIn={checkIn}
            onGenerate={handleGenerate}
            onBack={() => setStep('checkin')}
          />
        )}
        {step === 'generating' && (
          <Generating streamingText={streamingText} />
        )}
        {step === 'review' && (
          <PlanReview
            plan={editedPlan}
            onPlanChange={setEditedPlan}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
          />
        )}
        {step === 'approved' && (
          <Confirmation plan={editedPlan} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}

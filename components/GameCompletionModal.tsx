import React, { useState } from 'react'
import { Trophy, Star, Timer, Move, Target } from 'lucide-react'

export function GameCompletionModal({ moves, timeElapsed, score, onSubmitScore, onClose, user, isAuthenticated }) {
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated && !playerName.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmitScore(isAuthenticated ? user.name : playerName.trim())
    } catch (error) {
      console.error('Error submitting score:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickSubmit = async () => {
    if (!isAuthenticated) return
    
    setIsSubmitting(true)
    try {
      await onSubmitScore(user.name)
    } catch (error) {
      console.error('Error submitting score:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreGrade = (score) => {
    if (score >= 9000) return { grade: 'S', color: 'text-yellow-500', bg: 'bg-yellow-50' }
    if (score >= 8000) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-50' }
    if (score >= 6000) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-50' }
    if (score >= 4000) return { grade: 'C', color: 'text-purple-500', bg: 'bg-purple-50' }
    return { grade: 'D', color: 'text-gray-500', bg: 'bg-gray-50' }
  }

  const scoreGrade = getScoreGrade(score)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 transform animate-pulse">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Puzzle Completed!
          </h2>
          
          <div className="flex items-center justify-center space-x-1 mb-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Score Summary */}
        <div className="space-y-4 mb-6">
          <div className={`text-center p-4 rounded-xl ${scoreGrade.bg}`}>
            <div className={`text-4xl font-bold ${scoreGrade.color} mb-1`}>
              {score.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Final Score</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${scoreGrade.color} ${scoreGrade.bg} border-2 border-current mt-2`}>
              Grade: {scoreGrade.grade}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-800 font-medium">Time</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {formatTime(timeElapsed)}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Move className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-800 font-medium">Moves</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {moves}
              </div>
            </div>
          </div>
        </div>

        {/* Score Submission */}
        {isAuthenticated ? (
          /* Authenticated User - Quick Submit */
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium mb-2">
                Signed in as <span className="font-bold">{user.name}</span>
              </p>
              <p className="text-sm text-green-600">
                Your score will be automatically saved to the leaderboard
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Skip Leaderboard
              </button>
              
              <button
                onClick={handleQuickSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Submit Score</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Guest User - Name Entry Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name for the leaderboard:
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 <span className="font-medium">Sign in</span> to save your progress and compete on the global leaderboard!
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Skip Leaderboard
              </button>
              
              <button
                type="submit"
                disabled={!playerName.trim() || isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Submit Score</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Performance Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Solve corners and edges first</li>
            <li>• Plan multiple moves ahead</li>
            <li>• Speed improves with practice</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
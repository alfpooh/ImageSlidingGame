import React from 'react'
import { Trophy, Medal, Award, Timer, Move, Target } from 'lucide-react'

export function Leaderboard({ data }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>
    }
  }

  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
      case 2:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-2xl font-semibold text-gray-900">Global Leaderboard</h3>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No scores yet!</p>
          <p className="text-sm text-gray-500">Be the first to complete a puzzle.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((entry, index) => (
            <div
              key={entry.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getRankBg(index)}`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>

                {/* Player Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {entry.playerName}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-900">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Timer className="w-3 h-3" />
                      <span>{formatTime(entry.timeInSeconds)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Move className="w-3 h-3" />
                      <span>{entry.moves} moves</span>
                    </div>
                  </div>
                </div>

                {/* Puzzle Thumbnail */}
                {entry.imageUrl && (
                  <div className="flex-shrink-0 w-12 h-12">
                    <img
                      src={entry.imageUrl}
                      alt="Puzzle thumbnail"
                      className="w-full h-full object-cover rounded-lg border-2 border-white shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Score breakdown for top 3 */}
              {index < 3 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Base</div>
                      <div className="text-gray-600">10,000</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Moves</div>
                      <div className="text-red-600">-{entry.moves * 10}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Time</div>
                      <div className="text-red-600">-{entry.timeInSeconds * 5}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scoring Information */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">🏆 Scoring System</h4>
        <p className="text-sm text-gray-600 mb-2">
          Score = 10,000 - (Moves × 10 + Time × 5)
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Fewer moves = higher score</li>
          <li>• Faster completion = higher score</li>
          <li>• Minimum score is 0</li>
        </ul>
      </div>
    </div>
  )
}
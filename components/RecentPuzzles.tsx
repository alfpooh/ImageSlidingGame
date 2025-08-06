import React from 'react'
import { Clock, Play, Image as ImageIcon } from 'lucide-react'

export function RecentPuzzles({ puzzles, onPuzzleSelect }) {
  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Recent Puzzles</h3>
      </div>

      {puzzles.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No recent puzzles</p>
          <p className="text-sm text-gray-500">Completed puzzles will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {puzzles.map((puzzle) => (
            <div
              key={puzzle.id}
              className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onPuzzleSelect(puzzle.imageUrl)}
            >
              {/* Puzzle Image */}
              <div className="aspect-square relative">
                {puzzle.imageUrl ? (
                  <img
                    src={puzzle.imageUrl}
                    alt="Recent puzzle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-blue-600 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Puzzle Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {puzzle.playerName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(puzzle.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{puzzle.moves} moves</span>
                  <span className="font-medium text-blue-600">
                    {puzzle.score.toLocaleString()} pts
                  </span>
                </div>
              </div>

              {/* Best Score Badge */}
              {puzzle.score >= 8000 && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                  ⭐ High Score
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Play Again CTA */}
      {puzzles.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Try Again!</h4>
              <p className="text-sm text-gray-600">
                Click any puzzle above to play it again and improve your score.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
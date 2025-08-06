import React, { useState } from 'react'
import { Play, RotateCcw, ArrowRight, Info } from 'lucide-react'
import { Button } from './ui/button'

export function HowShuffleWorks({ onClose }) {
  const [step, setStep] = useState(0)
  const [demoState, setDemoState] = useState([
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, null]
  ])
  const [emptyPos, setEmptyPos] = useState({ row: 3, col: 3 })

  const explanations = [
    {
      title: "🎯 The Problem",
      content: "Random placement of puzzle pieces has a 50% chance of creating an unsolvable puzzle due to mathematical constraints.",
      highlight: "solved"
    },
    {
      title: "✅ The Solution",
      content: "Start with the solved puzzle and perform only valid moves. This guarantees solvability while creating randomness.",
      highlight: "process"
    },
    {
      title: "🔄 Random Walk Process",
      content: "For 1000 iterations: Find adjacent tiles → Pick random one → Swap with empty space → Repeat",
      highlight: "result"
    }
  ]

  const simulateMove = () => {
    const newState = demoState.map(row => [...row])
    
    // Find valid adjacent tiles
    const validMoves = []
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    
    for (const [dr, dc] of directions) {
      const newRow = emptyPos.row + dr
      const newCol = emptyPos.col + dc
      
      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
        validMoves.push([newRow, newCol])
      }
    }
    
    if (validMoves.length === 0) return
    
    // Random selection
    const [moveRow, moveCol] = validMoves[Math.floor(Math.random() * validMoves.length)]
    
    // Perform swap
    newState[emptyPos.row][emptyPos.col] = newState[moveRow][moveCol]
    newState[moveRow][moveCol] = null
    
    setDemoState(newState)
    setEmptyPos({ row: moveRow, col: moveCol })
  }

  const resetDemo = () => {
    setDemoState([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, null]
    ])
    setEmptyPos({ row: 3, col: 3 })
    setStep(0)
  }

  const getValidMoves = () => {
    const validMoves = []
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    
    for (const [dr, dc] of directions) {
      const newRow = emptyPos.row + dr
      const newCol = emptyPos.col + dc
      
      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
        validMoves.push([newRow, newCol])
      }
    }
    
    return validMoves
  }

  const validMoves = getValidMoves()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">🧩 How Puzzle Shuffling Works</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Understanding the "Random Walk" algorithm that creates solvable puzzles
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Navigation */}
          <div className="flex space-x-4 mb-6">
            {explanations.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${step === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                Step {index + 1}
              </button>
            ))}
          </div>

          {/* Current Explanation */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {explanations[step].title}
            </h3>
            <p className="text-blue-800">
              {explanations[step].content}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Interactive Demo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Interactive Demo</h4>
                <div className="flex space-x-2">
                  <Button onClick={simulateMove} size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Make Move
                  </Button>
                  <Button onClick={resetDemo} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Mini Puzzle */}
              <div className="bg-gray-300 rounded-lg p-3 w-64 h-64 grid grid-cols-4 gap-1">
                {demoState.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex)
                    const isEmpty = piece === null
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-full h-full flex items-center justify-center text-xs font-bold rounded
                          ${isEmpty 
                            ? 'bg-gray-300 border-2 border-dashed border-gray-500' 
                            : isValidMove
                              ? 'bg-green-200 border-2 border-green-400 text-green-800'
                              : 'bg-blue-200 text-blue-800'
                          }
                        `}
                      >
                        {isEmpty ? '🕳️' : piece + 1}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div>🟢 Green tiles can move into empty space</div>
                <div>📍 Empty space: Row {emptyPos.row + 1}, Col {emptyPos.col + 1}</div>
                <div>🎲 Algorithm picks randomly from {validMoves.length} valid moves</div>
              </div>
            </div>

            {/* Algorithm Explanation */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">The Algorithm Process</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="font-medium text-gray-900">Start Solved</div>
                    <div className="text-sm text-gray-600">Begin with pieces in perfect order (0-14)</div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="font-medium text-gray-900">Find Valid Moves</div>
                    <div className="text-sm text-gray-600">Identify tiles adjacent to empty space</div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="font-medium text-gray-900">Random Selection</div>
                    <div className="text-sm text-gray-600">Pick one valid move randomly</div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <div className="font-medium text-gray-900">Execute & Repeat</div>
                    <div className="text-sm text-gray-600">Swap pieces, then repeat 1000 times</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Why This Works</div>
                    <div className="text-sm text-green-700 mt-1">
                      Since we only use valid sliding moves, the puzzle stays within the "solvable space" 
                      of all possible configurations, guaranteeing it can be solved.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="bg-gray-900 rounded-lg p-4 text-white">
            <h4 className="font-medium text-gray-200 mb-3">📝 Simplified Code</h4>
            <pre className="text-sm overflow-x-auto text-gray-300">
              <code>{`// Perform 1000 random valid moves
for (let i = 0; i < 1000; i++) {
  // Find adjacent tiles to empty space
  const validMoves = getAdjacentTiles(emptyPosition)
  
  // Pick random valid move
  const randomMove = validMoves[Math.random() * validMoves.length]
  
  // Swap with empty space
  swap(emptyPosition, randomMove)
  emptyPosition = randomMove
}`}</code>
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Got It!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
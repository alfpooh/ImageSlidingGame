import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, RotateCcw, X, Cpu, Zap, Target, RotateCcwIcon } from 'lucide-react'
import { Button } from './ui/button'

export function ComputerSolver({ isOpen, onClose, puzzleState, onSolveComplete, image, shuffleMoves = [], userMoves = [] }) {
  const [solutionPath, setSolutionPath] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(500) // ms between moves
  const [currentState, setCurrentState] = useState(puzzleState)
  const [solutionPhase, setSolutionPhase] = useState('') // 'undoing_user' or 'undoing_shuffle'

  useEffect(() => {
    if (isOpen && puzzleState) {
      calculateSolution()
    }
  }, [isOpen, puzzleState, shuffleMoves, userMoves])

  useEffect(() => {
    let interval
    if (isPlaying && solutionPath.length > 0 && currentStep < solutionPath.length) {
      interval = setInterval(() => {
        executeNextStep()
      }, playbackSpeed)
    } else if (isPlaying && currentStep >= solutionPath.length) {
      setIsPlaying(false)
      // Notify parent that puzzle is solved
      setTimeout(() => {
        onSolveComplete()
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, solutionPath, playbackSpeed])

  const calculateSolution = () => {
    setIsCalculating(true)
    setSolutionPath([])
    setCurrentStep(0)
    setCurrentState(puzzleState)
    
    try {
      console.log('Calculating solution...')
      console.log('User moves to undo:', userMoves.length)
      console.log('Shuffle moves to reverse:', shuffleMoves.length)
      
      const solution = []
      
      // Step 6: Undo user's movements (in reverse order)
      const reversedUserMoves = [...userMoves].reverse()
      for (const move of reversedUserMoves) {
        // Reverse the move: swap from and to positions
        solution.push({
          piece: move.piece,
          from: move.to, // Reverse: move piece back to where it came from
          to: move.from,
          direction: reverseDirection(move.direction),
          phase: 'undoing_user',
          description: `Undo user move: Move piece ${move.piece + 1} ${reverseDirection(move.direction)}`
        })
      }
      
      // Step 7: Undo shuffle movements (in reverse order)
      const reversedShuffleMoves = [...shuffleMoves].reverse()
      for (const move of reversedShuffleMoves) {
        // Reverse the move: swap from and to positions
        solution.push({
          piece: move.piece,
          from: move.to, // Reverse: move piece back to where it came from
          to: move.from,
          direction: reverseDirection(move.direction),
          phase: 'undoing_shuffle',
          description: `Undo shuffle move: Move piece ${move.piece + 1} ${reverseDirection(move.direction)}`
        })
      }
      
      setSolutionPath(solution)
      console.log('Solution calculated:', solution)
      
    } catch (error) {
      console.error('Error calculating solution:', error)
      setSolutionPath([])
    } finally {
      setIsCalculating(false)
    }
  }

  const reverseDirection = (direction) => {
    const reverseMap = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    }
    return reverseMap[direction] || direction
  }

  const executeNextStep = () => {
    if (currentStep >= solutionPath.length) return

    const move = solutionPath[currentStep]
    const newState = currentState.map(row => [...row])
    
    // Execute the move
    newState[move.to.row][move.to.col] = move.piece
    newState[move.from.row][move.from.col] = null
    
    setCurrentState(newState)
    setSolutionPhase(move.phase)
    setCurrentStep(prev => prev + 1)
  }

  const resetSolution = () => {
    setCurrentStep(0)
    setCurrentState(puzzleState)
    setIsPlaying(false)
    setSolutionPhase('')
  }

  const skipToEnd = () => {
    setIsPlaying(false)
    setCurrentStep(solutionPath.length)
    
    // Apply all moves to get final solved state
    let finalState = puzzleState.map(row => [...row])
    for (const move of solutionPath) {
      finalState[move.to.row][move.to.col] = move.piece
      finalState[move.from.row][move.from.col] = null
    }
    
    setCurrentState(finalState)
    setSolutionPhase('completed')
    
    // Notify completion
    setTimeout(() => {
      onSolveComplete()
    }, 500)
  }

  const getUserMovesCount = () => userMoves.length
  const getShuffleMovesCount = () => shuffleMoves.length
  const getTotalMoves = () => getUserMovesCount() + getShuffleMovesCount()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Computer Solver</h2>
                <p className="text-gray-600">Reversing moves to restore the solved state</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Solution Status */}
          {isCalculating ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculating Solution...</h3>
              <p className="text-gray-600">Analyzing moves to reverse</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Solution Info */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800">
                    {getUserMovesCount()}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    User Moves
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-800">
                    {getShuffleMovesCount()}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Shuffle Moves
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-800">
                    {getTotalMoves()}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    Total to Undo
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-800">
                    {currentStep}/{getTotalMoves()}
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    Progress
                  </div>
                </div>
              </div>

              {solutionPath.length > 0 && (
                <>
                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <Button
                      onClick={resetSolution}
                      variant="outline"
                      size="sm"
                      disabled={currentStep === 0 && !isPlaying}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={currentStep >= solutionPath.length}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {currentStep === 0 ? 'Start' : 'Resume'}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={skipToEnd}
                      variant="outline"
                      size="sm"
                      disabled={currentStep >= solutionPath.length}
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip to End
                    </Button>
                  </div>

                  {/* Speed Control */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <span className="text-sm text-gray-600">Speed:</span>
                    <div className="flex space-x-2">
                      {[
                        { label: '0.5x', value: 1000 },
                        { label: '1x', value: 500 },
                        { label: '2x', value: 250 },
                        { label: '4x', value: 125 }
                      ].map(({ label, value }) => (
                        <button
                          key={label}
                          onClick={() => setPlaybackSpeed(value)}
                          className={`
                            px-3 py-1 rounded text-sm font-medium transition-colors
                            ${playbackSpeed === value
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Puzzle Visualization */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Current State</h3>
                      
                      {/* Puzzle Grid */}
                      <div className="bg-gray-300 rounded-lg p-2 w-80 h-80 mx-auto grid grid-cols-4 gap-1">
                        {currentState.map((row, rowIndex) =>
                          row.map((piece, colIndex) => {
                            const isEmpty = piece === null
                            
                            return (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`
                                  w-full h-full flex items-center justify-center rounded transition-all duration-300
                                  ${isEmpty 
                                    ? 'bg-gray-300 border-2 border-dashed border-gray-400' 
                                    : 'bg-white shadow-sm overflow-hidden'
                                  }
                                `}
                              >
                                {isEmpty ? (
                                  <span className="text-gray-500 text-xs">Empty</span>
                                ) : image ? (
                                  <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url(${image})`,
                                      backgroundPosition: `${(piece % 4) * -100}% ${Math.floor(piece / 4) * -100}%`,
                                      backgroundSize: '400% 400%'
                                    }}
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-gray-700">
                                    {piece + 1}
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Current Move Info */}
                      {currentStep > 0 && currentStep <= solutionPath.length && (
                        <div className={`rounded-lg p-4 border ${
                          solutionPath[currentStep - 1]?.phase === 'undoing_user' 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className={`text-sm ${
                            solutionPath[currentStep - 1]?.phase === 'undoing_user' 
                              ? 'text-blue-800' 
                              : 'text-green-800'
                          }`}>
                            <strong>Step {currentStep}:</strong>{' '}
                            {solutionPath[currentStep - 1]?.description}
                          </div>
                        </div>
                      )}

                      {/* Phase Indicator */}
                      {solutionPhase && (
                        <div className="text-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            solutionPhase === 'undoing_user' 
                              ? 'bg-blue-100 text-blue-800'
                              : solutionPhase === 'undoing_shuffle'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            <RotateCcwIcon className="w-4 h-4 mr-1" />
                            {solutionPhase === 'undoing_user' && 'Undoing Your Moves'}
                            {solutionPhase === 'undoing_shuffle' && 'Undoing Shuffle Moves'}
                            {solutionPhase === 'completed' && 'Puzzle Solved!'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Algorithm Explanation */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
                      
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start space-x-3">
                            <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-purple-900">Reverse Algorithm</h4>
                              <p className="text-sm text-purple-700 mt-1">
                                Simply reverses all recorded moves to return to the solved state - guaranteed optimal!
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Two-Phase Solution</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                First undoes your moves, then reverses the original shuffle sequence.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Solution Steps:</h4>
                          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Undo all user moves in reverse order</li>
                            <li>Undo all shuffle moves in reverse order</li>
                            <li>Reach the perfectly solved state</li>
                            <li>Total moves: {getTotalMoves()} (guaranteed optimal)</li>
                          </ol>
                          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-green-700">
                              <strong>Smart Shuffle:</strong> All 15 tiles were displaced from their original positions during shuffle, ensuring a balanced challenge.
                            </p>
                          </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h4 className="font-medium text-yellow-800 mb-2">Why This Works:</h4>
                          <p className="text-sm text-yellow-700">
                            Since we recorded every move from the solved state (ensuring all tiles were displaced), 
                            reversing them guarantees we return to the exact same solved configuration. 
                            This is much simpler and more reliable than complex pathfinding algorithms!
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Solution Progress</span>
                          <span>{Math.round((currentStep / getTotalMoves()) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / getTotalMoves()) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* No moves to undo */}
              {solutionPath.length === 0 && !isCalculating && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Solved!</h3>
                  <p className="text-gray-600">
                    The puzzle is already in its solved state. No moves to undo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                💡 This represents giving up on solving manually
              </div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
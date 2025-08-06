import React, { useState, useEffect } from 'react'
import { Play, RotateCcw, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

export function ShuffleAlgorithmExplainer() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [puzzleState, setPuzzleState] = useState([])
  const [emptyPos, setEmptyPos] = useState({ row: 3, col: 3 })
  const [moveHistory, setMoveHistory] = useState([])

  // Initialize solved state
  useEffect(() => {
    const solvedState = []
    let pieceIndex = 0
    
    for (let row = 0; row < 4; row++) {
      const rowPieces = []
      for (let col = 0; col < 4; col++) {
        if (row === 3 && col === 3) {
          rowPieces.push(null) // Empty space
        } else {
          rowPieces.push(pieceIndex++)
        }
      }
      solvedState.push(rowPieces)
    }
    
    setPuzzleState(solvedState)
    setEmptyPos({ row: 3, col: 3 })
    setMoveHistory([])
  }, [])

  const steps = [
    {
      title: "Step 1: Start with Perfect Order",
      description: "The algorithm begins with the puzzle in its completely solved state - pieces 0-14 in perfect order with empty space at bottom-right.",
      detail: "This is crucial! We never randomly place pieces because that could create an unsolvable puzzle."
    },
    {
      title: "Step 2: Identify Valid Moves",
      description: "For each step, we find all tiles adjacent to the empty space (up, down, left, right).",
      detail: "Only these adjacent tiles can legally move into the empty space."
    },
    {
      title: "Step 3: Random Valid Move Selection",
      description: "From the valid adjacent tiles, we randomly select one to swap with the empty space.",
      detail: "This ensures every move follows sliding puzzle rules."
    },
    {
      title: "Step 4: Execute Move & Update",
      description: "Swap the selected tile with the empty space and update the empty position.",
      detail: "Track the move and continue the process."
    },
    {
      title: "Step 5: Repeat 1000 Times",
      description: "Perform this random walk 1000 times to create sufficient randomness.",
      detail: "1000 moves ensures the puzzle is thoroughly mixed while remaining solvable."
    },
    {
      title: "Step 6: Solvable Result",
      description: "The final state is guaranteed to be solvable since we only used valid moves.",
      detail: "This eliminates the 50% chance of creating an unsolvable puzzle with random placement."
    }
  ]

  const simulateSingleMove = () => {
    const newState = puzzleState.map(row => [...row])
    
    // Find valid moves
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
    
    // Pick random valid move
    const [moveRow, moveCol] = validMoves[Math.floor(Math.random() * validMoves.length)]
    
    // Execute swap
    const movedPiece = newState[moveRow][moveCol]
    newState[emptyPos.row][emptyPos.col] = movedPiece
    newState[moveRow][moveCol] = null
    
    setPuzzleState(newState)
    setEmptyPos({ row: moveRow, col: moveCol })
    setMoveHistory(prev => [...prev, { piece: movedPiece, from: [moveRow, moveCol], to: [emptyPos.row, emptyPos.col] }])
  }

  const simulateMultipleMoves = async () => {
    setIsAnimating(true)
    for (let i = 0; i < 20; i++) {
      simulateSingleMove()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setIsAnimating(false)
  }

  const resetPuzzle = () => {
    const solvedState = []
    let pieceIndex = 0
    
    for (let row = 0; row < 4; row++) {
      const rowPieces = []
      for (let col = 0; col < 4; col++) {
        if (row === 3 && col === 3) {
          rowPieces.push(null)
        } else {
          rowPieces.push(pieceIndex++)
        }
      }
      solvedState.push(rowPieces)
    }
    
    setPuzzleState(solvedState)
    setEmptyPos({ row: 3, col: 3 })
    setMoveHistory([])
    setCurrentStep(0)
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🧩 Sliding Puzzle Shuffle Algorithm
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Understanding how we generate solvable random puzzles using the "Random Walk" method
        </p>
      </div>

      {/* Algorithm Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 Key Principle</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">❌ Why Not Random Placement?</h3>
            <p className="text-sm text-blue-700">
              Randomly placing tiles has a 50% chance of creating an <strong>unsolvable puzzle</strong>. 
              This happens because sliding puzzles follow mathematical constraints.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">✅ Random Walk Solution</h3>
            <p className="text-sm text-blue-700">
              By starting from the solved state and performing only <strong>valid moves</strong>, 
              we guarantee the puzzle remains solvable while achieving randomness.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Puzzle Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Puzzle State</h3>
            <div className="flex space-x-2">
              <Button onClick={simulateSingleMove} size="sm" disabled={isAnimating}>
                <Play className="w-4 h-4 mr-1" />
                Single Move
              </Button>
              <Button onClick={simulateMultipleMoves} size="sm" disabled={isAnimating}>
                <Play className="w-4 h-4 mr-1" />
                20 Moves
              </Button>
              <Button onClick={resetPuzzle} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Puzzle Grid */}
          <div className="bg-gray-300 rounded-lg p-2 w-80 h-80 grid grid-cols-4 gap-1">
            {puzzleState.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex)
                const isEmpty = piece === null
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-full h-full flex items-center justify-center text-sm font-semibold rounded
                      ${isEmpty 
                        ? 'bg-gray-300 border-2 border-dashed border-gray-400' 
                        : isValidMove
                          ? 'bg-gradient-to-br from-green-200 to-green-300 text-green-800 border-2 border-green-400'
                          : 'bg-gradient-to-br from-blue-200 to-purple-300 text-gray-700'
                      }
                      ${isAnimating ? 'transition-all duration-100' : ''}
                    `}
                  >
                    {isEmpty ? '🕳️' : piece + 1}
                  </div>
                )
              })
            )}
          </div>

          {/* Current State Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Empty Position:</span>
              <span className="font-medium">Row {emptyPos.row + 1}, Col {emptyPos.col + 1}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Valid Moves:</span>
              <span className="font-medium">{validMoves.length} tiles can move</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Moves Made:</span>
              <span className="font-medium">{moveHistory.length}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-200">
            <strong>🟢 Green tiles</strong> can move into the empty space. 
            The algorithm randomly selects one of these valid moves.
          </div>
        </div>

        {/* Step-by-Step Explanation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Algorithm Steps</h3>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border transition-all cursor-pointer
                  ${currentStep === index
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setCurrentStep(index)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${currentStep === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {currentStep === index && (
                      <p className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                        💡 {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Implementation */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">📝 Actual Implementation</h3>
        <pre className="text-sm overflow-x-auto">
          <code>{`const shufflePuzzle = (initialState) => {
  const newState = initialState.map(row => [...row])
  let emptyRow = 3, emptyCol = 3
  
  // Perform 1000 random valid moves to ensure solvability
  for (let i = 0; i < 1000; i++) {
    const validMoves = []
    
    // Check all adjacent positions (up, down, left, right)
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    for (const [dr, dc] of directions) {
      const newRow = emptyRow + dr
      const newCol = emptyCol + dc
      
      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
        validMoves.push([newRow, newCol])
      }
    }
    
    // Pick random valid move
    const [moveRow, moveCol] = validMoves[Math.floor(Math.random() * validMoves.length)]
    
    // Swap pieces
    newState[emptyRow][emptyCol] = newState[moveRow][moveCol]
    newState[moveRow][moveCol] = null
    emptyRow = moveRow
    emptyCol = moveCol
  }
  
  return newState
}`}</code>
        </pre>
      </div>

      {/* Mathematical Explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-xl font-semibold text-purple-900 mb-4">🔢 Mathematical Foundation</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Puzzle Solvability Theory</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Sliding puzzles have mathematical constraints</li>
              <li>• Not all arrangements are reachable from solved state</li>
              <li>• Random placement = 50% unsolvable puzzles</li>
              <li>• Valid moves preserve solvability invariants</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Why 1000 Moves?</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Sufficient for thorough mixing</li>
              <li>• Creates challenging but fair puzzles</li>
              <li>• Balances randomness with performance</li>
              <li>• Tested optimal value for 4x4 grids</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
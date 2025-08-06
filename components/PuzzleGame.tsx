import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Clock, Target, Home, Volume2, VolumeX } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface PuzzleGameProps {
  imageUrl: string
  onBack: () => void
  onComplete: (score: number, moves: number, timeInSeconds: number) => void
}

interface PuzzleState {
  tiles: (number | null)[]
  emptyIndex: number
}

interface Position {
  row: number
  col: number
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ imageUrl, onBack, onComplete }) => {
  const [puzzleState, setPuzzleState] = useState<PuzzleState>({ tiles: [], emptyIndex: 15 })
  const [isLoading, setIsLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [showWinModal, setShowWinModal] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize puzzle on mount
  useEffect(() => {
    initializePuzzle()
  }, [imageUrl])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (gameStarted && !gameCompleted && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameStarted, gameCompleted, startTime])

  const initializePuzzle = async () => {
    setIsLoading(true)
    
    // Create initial solved state
    const solvedTiles = Array.from({ length: 15 }, (_, i) => i + 1)
    solvedTiles.push(null) // Empty space at position 15
    
    // Shuffle the puzzle ensuring it's solvable
    const shuffledState = shufflePuzzle(solvedTiles)
    
    setPuzzleState(shuffledState)
    setIsLoading(false)
  }

  const shufflePuzzle = (tiles: (number | null)[]): PuzzleState => {
    const newTiles = [...tiles]
    let emptyIndex = 15
    
    // Perform random valid moves to shuffle
    for (let i = 0; i < 1000; i++) {
      const neighbors = getNeighbors(emptyIndex)
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
      
      // Swap empty space with random neighbor
      newTiles[emptyIndex] = newTiles[randomNeighbor]
      newTiles[randomNeighbor] = null
      emptyIndex = randomNeighbor
    }
    
    return { tiles: newTiles, emptyIndex }
  }

  const getNeighbors = (index: number): number[] => {
    const row = Math.floor(index / 4)
    const col = index % 4
    const neighbors: number[] = []
    
    // Up
    if (row > 0) neighbors.push(index - 4)
    // Down
    if (row < 3) neighbors.push(index + 4)
    // Left
    if (col > 0) neighbors.push(index - 1)
    // Right
    if (col < 3) neighbors.push(index + 1)
    
    return neighbors
  }

  const canMoveTile = (index: number): boolean => {
    return getNeighbors(puzzleState.emptyIndex).includes(index)
  }

  const moveTile = (index: number) => {
    if (!canMoveTile(index) || gameCompleted) return
    
    if (!gameStarted) {
      setGameStarted(true)
      setStartTime(Date.now())
    }
    
    playMoveSound()
    
    const newTiles = [...puzzleState.tiles]
    newTiles[puzzleState.emptyIndex] = newTiles[index]
    newTiles[index] = null
    
    const newState = { tiles: newTiles, emptyIndex: index }
    setPuzzleState(newState)
    setMoves(prev => prev + 1)
    
    // Check if puzzle is solved
    if (isPuzzleSolved(newTiles)) {
      handlePuzzleComplete()
    }
  }

  const isPuzzleSolved = (tiles: (number | null)[]): boolean => {
    for (let i = 0; i < 15; i++) {
      if (tiles[i] !== i + 1) return false
    }
    return tiles[15] === null
  }

  const handlePuzzleComplete = () => {
    setGameCompleted(true)
    const endTime = Date.now()
    const timeInSeconds = startTime ? Math.floor((endTime - startTime) / 1000) : 0
    setCurrentTime(timeInSeconds)
    
    playWinSound()
    setShowWinModal(true)
  }

  const calculateScore = (moves: number, timeInSeconds: number): number => {
    const baseScore = 10000
    const movesPenalty = moves * 10
    const timePenalty = timeInSeconds * 5
    return Math.max(0, baseScore - movesPenalty - timePenalty)
  }

  const submitScore = async () => {
    if (!playerName.trim()) return
    
    const timeInSeconds = currentTime
    const score = calculateScore(moves, timeInSeconds)
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1dc81b3/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          score,
          moves,
          timeInSeconds,
          imageUrl
        })
      })
      
      if (response.ok) {
        onComplete(score, moves, timeInSeconds)
        setShowWinModal(false)
        onBack()
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  const playMoveSound = () => {
    if (!soundEnabled) return
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const context = audioContextRef.current
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      oscillator.frequency.setValueAtTime(800, context.currentTime)
      gainNode.gain.setValueAtTime(0.1, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)
      
      oscillator.start()
      oscillator.stop(context.currentTime + 0.1)
    } catch (error) {
      console.error('Error playing move sound:', error)
    }
  }

  const playWinSound = () => {
    if (!soundEnabled) return
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const context = audioContextRef.current
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(context.destination)
        
        oscillator.frequency.setValueAtTime(freq, context.currentTime + index * 0.2)
        gainNode.gain.setValueAtTime(0.2, context.currentTime + index * 0.2)
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.2 + 0.3)
        
        oscillator.start(context.currentTime + index * 0.2)
        oscillator.stop(context.currentTime + index * 0.2 + 0.3)
      })
    } catch (error) {
      console.error('Error playing win sound:', error)
    }
  }

  const resetPuzzle = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setMoves(0)
    setStartTime(null)
    setCurrentTime(0)
    initializePuzzle()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPuzzleTileStyle = (index: number, tileNumber: number | null) => {
    if (tileNumber === null) return { visibility: 'hidden' as const }
    
    const row = Math.floor((tileNumber - 1) / 4)
    const col = (tileNumber - 1) % 4
    
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: `-${col * 100}px -${row * 100}px`,
      backgroundSize: '400px 400px'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Puzzle Game</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={resetPuzzle}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <div className="flex justify-center">
                <div className="relative">
                  {/* Original image reference (hidden) */}
                  <ImageWithFallback
                    ref={imageRef}
                    src={imageUrl}
                    alt="Puzzle reference"
                    className="hidden"
                    onLoad={() => setIsLoading(false)}
                  />
                  
                  {/* Puzzle grid */}
                  <div className="grid grid-cols-4 gap-1 p-4 bg-black/30 rounded-lg">
                    {puzzleState.tiles.map((tileNumber, index) => (
                      <div
                        key={index}
                        className={`w-24 h-24 md:w-32 md:h-32 lg:w-24 lg:h-24 xl:w-32 xl:h-32 rounded border-2 transition-all duration-200 ${
                          tileNumber === null 
                            ? 'border-transparent bg-transparent' 
                            : canMoveTile(index)
                              ? 'border-white/50 bg-white/10 cursor-pointer hover:border-white hover:scale-105'
                              : 'border-white/30 cursor-default'
                        }`}
                        style={getPuzzleTileStyle(index, tileNumber)}
                        onClick={() => moveTile(index)}
                      >
                        {tileNumber !== null && (
                          <div className="w-full h-full flex items-end justify-end p-1">
                            <span className="text-xs font-bold text-white bg-black/50 rounded px-1">
                              {tileNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <div className="text-white">Loading puzzle...</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Game Stats */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Game Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Moves</span>
                  </div>
                  <span className="text-xl font-bold text-white">{moves}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Time</span>
                  </div>
                  <span className="text-xl font-bold text-white">{formatTime(currentTime)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Score</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-400">
                    {calculateScore(moves, currentTime)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Original Image Preview */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Original Image</h3>
              <div className="aspect-square rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={imageUrl}
                  alt="Original image"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-8 bg-white/20 backdrop-blur-lg border-white/30 max-w-md w-full">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Puzzle Solved!</h2>
              <p className="text-white/80 mb-6">Congratulations on completing the puzzle!</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{moves}</div>
                  <div className="text-sm text-white/60">Moves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatTime(currentTime)}</div>
                  <div className="text-sm text-white/60">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{calculateScore(moves, currentTime)}</div>
                  <div className="text-sm text-white/60">Score</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  maxLength={20}
                />
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                    onClick={() => {
                      setShowWinModal(false)
                      onBack()
                    }}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                    onClick={submitScore}
                    disabled={!playerName.trim()}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Submit Score
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
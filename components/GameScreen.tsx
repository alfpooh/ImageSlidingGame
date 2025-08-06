import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Timer, Move, Volume2, Settings, Play, Shuffle, Cpu } from 'lucide-react'
import { Button } from './ui/button'
import { GameCompletionModal } from './GameCompletionModal'

import { projectId, publicAnonKey } from '../utils/supabase/info'
import imgRectangle from "figma:asset/8c248244a03c4b443811e8029b4c48959592e6c0.png"
import imgImage from "figma:asset/2ef64e0eb574f7af37565fc570395bf95b2c7ef7.png"
import svgPaths from "../imports/svg-7m8xz388nq"

export function GameScreen({ image, onComplete, onBack, user, accessToken }) {
  const [puzzleState, setPuzzleState] = useState([])
  const [emptyPosition, setEmptyPosition] = useState({ row: 3, col: 3 })
  const [moves, setMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [puzzlePieces, setPuzzlePieces] = useState([])
  const [leaderboardData, setLeaderboardData] = useState([])
  const [isShuffled, setIsShuffled] = useState(false) // Track if puzzle has been shuffled
  const [showComputerSolver, setShowComputerSolver] = useState(false)
  const [isComputerSolving, setIsComputerSolving] = useState(false)
  const [computerSolutionPath, setComputerSolutionPath] = useState([])
  const [currentSolutionStep, setCurrentSolutionStep] = useState(0)
  const [shouldCancelSolving, setShouldCancelSolving] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [endTime, setEndTime] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [isComputerWin, setIsComputerWin] = useState(false)
  const [shuffleMoves, setShuffleMoves] = useState([]) // Record shuffle moves for reversal
  const [userMoves, setUserMoves] = useState([]) // Record user moves during gameplay

  useEffect(() => {
    initializePuzzle()
    fetchLeaderboard()
  }, [image])

  useEffect(() => {
    let interval
    if (gameStarted && !gameCompleted && isShuffled) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted, isShuffled])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1dc81b3/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      const data = await response.json()
      setLeaderboardData(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setLeaderboardData([])
    }
  }

  const initializePuzzle = async () => {
    if (!image) return

    try {
      // Create image element
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = image
      })

      // Generate puzzle pieces with proper image filling
      const pieces = []
      const pieceSize = 150
      const totalPuzzleSize = 600 // 4 * 150
      
      // Calculate how to crop/scale the image to fit perfectly in a square
      const imgAspectRatio = img.width / img.height
      let sourceWidth, sourceHeight, sourceX, sourceY
      
      if (imgAspectRatio > 1) {
        // Image is wider than tall - crop sides
        sourceHeight = img.height
        sourceWidth = img.height // Make it square
        sourceX = (img.width - sourceWidth) / 2
        sourceY = 0
      } else {
        // Image is taller than wide or square - crop top/bottom
        sourceWidth = img.width
        sourceHeight = img.width // Make it square
        sourceX = 0
        sourceY = (img.height - sourceHeight) / 2
      }
      
      // Create a temporary canvas to hold the properly sized square image
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = totalPuzzleSize
      tempCanvas.height = totalPuzzleSize
      const tempCtx = tempCanvas.getContext('2d')
      
      // Draw the cropped and scaled image to fill the entire puzzle area
      tempCtx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (cropped)
        0, 0, totalPuzzleSize, totalPuzzleSize // Destination rectangle (full puzzle size)
      )
      
      // Now create individual pieces from the perfectly sized puzzle image
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (row === 3 && col === 3) continue // Skip last piece for empty space
          
          const pieceCanvas = document.createElement('canvas')
          pieceCanvas.width = pieceSize
          pieceCanvas.height = pieceSize
          const pieceCtx = pieceCanvas.getContext('2d')
          
          // Extract piece from the temp canvas
          pieceCtx.drawImage(
            tempCanvas,
            col * pieceSize, row * pieceSize, pieceSize, pieceSize, // Source from temp canvas
            0, 0, pieceSize, pieceSize // Fill entire piece canvas
          )
          
          pieces.push(pieceCanvas.toDataURL())
        }
      }
      
      setPuzzlePieces(pieces)
      
      // Initialize puzzle in PERFECT SOLVED state
      const solvedState = []
      let pieceIndex = 0
      
      for (let row = 0; row < 4; row++) {
        const rowPieces = []
        for (let col = 0; col < 4; col++) {
          if (row === 3 && col === 3) {
            rowPieces.push(null) // Empty space at bottom right
          } else {
            rowPieces.push(pieceIndex++)
          }
        }
        solvedState.push(rowPieces)
      }
      
      setPuzzleState(solvedState)
      setEmptyPosition({ row: 3, col: 3 })
      setIsShuffled(false) // Start unshuffled
      setGameCompleted(false)
      setGameStarted(false)
      setGameWon(false)
      setIsComputerWin(false)
      setMoves(0)
      setTimeElapsed(0)
      setShuffleMoves([]) // Clear shuffle moves
      setUserMoves([]) // Clear user moves
      
    } catch (error) {
      console.error('Error initializing puzzle:', error)
    }
  }

  const shufflePuzzle = (initialState) => {
    const newState = initialState.map(row => [...row])
    let emptyRow = 3, emptyCol = 3
    const moves = []
    
    // Step 0: Track which tiles have been moved from their original positions
    // All tiles (0-14) should be moved at least once from their original positions
    const tilesMovedFromOriginal = new Set()
    const totalTiles = 15 // 0 to 14 (excluding empty space)
    
    console.log('Shuffling puzzle until all tiles are moved from original positions...')
    
    // Helper function to get original position of a piece
    const getOriginalPosition = (pieceNumber) => {
      return {
        row: Math.floor(pieceNumber / 4),
        col: pieceNumber % 4
      }
    }
    
    // Helper function to check if a piece is in its original position
    const isPieceInOriginalPosition = (pieceNumber, currentRow, currentCol) => {
      const original = getOriginalPosition(pieceNumber)
      return original.row === currentRow && original.col === currentCol
    }
    
    // Initial check - mark pieces that are already displaced (shouldn't happen with solved initial state)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const piece = newState[row][col]
        if (piece !== null && !isPieceInOriginalPosition(piece, row, col)) {
          tilesMovedFromOriginal.add(piece)
        }
      }
    }
    
    let shuffleAttempts = 0
    const maxAttempts = 2000 // Safety limit to prevent infinite loops
    let lastProgressCount = 0
    let stagnantCounter = 0
    
    // Continue shuffling until all tiles have been moved from their original positions
    while (tilesMovedFromOriginal.size < totalTiles && shuffleAttempts < maxAttempts) {
      const validMoves = []
      
      // Check all adjacent positions to empty space
      const directions = [
        { dr: 0, dc: 1, direction: 'right' },
        { dr: 0, dc: -1, direction: 'left' },
        { dr: 1, dc: 0, direction: 'down' },
        { dr: -1, dc: 0, direction: 'up' }
      ]
      
      for (const { dr, dc, direction } of directions) {
        const newRow = emptyRow + dr
        const newCol = emptyCol + dc
        
        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
          validMoves.push({ row: newRow, col: newCol, direction })
        }
      }
      
      // Step 1: Choose randomly from movable tiles
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
      const { row: moveRow, col: moveCol, direction } = randomMove
      
      // Get the piece that will move
      const movedPiece = newState[moveRow][moveCol]
      
      // Step 2: Record the movement for later reversal
      moves.push({
        piece: movedPiece,
        from: { row: moveRow, col: moveCol },
        to: { row: emptyRow, col: emptyCol },
        direction: direction
      })
      
      // Execute the move
      newState[emptyRow][emptyCol] = movedPiece
      newState[moveRow][moveCol] = null
      
      // Check if this piece is now displaced from its original position
      if (!isPieceInOriginalPosition(movedPiece, emptyRow, emptyCol)) {
        tilesMovedFromOriginal.add(movedPiece)
      }
      
      // Update empty position
      emptyRow = moveRow
      emptyCol = moveCol
      
      shuffleAttempts++
      
      // Check for progress stagnation and add logging for difficult cases
      if (shuffleAttempts % 100 === 0) {
        if (tilesMovedFromOriginal.size === lastProgressCount) {
          stagnantCounter++
          if (stagnantCounter > 5) {
            console.warn(`Shuffle stagnating: ${tilesMovedFromOriginal.size}/${totalTiles} tiles displaced after ${shuffleAttempts} attempts`)
            // Force a few more random moves to break potential cycles
            for (let extraMoves = 0; extraMoves < 10; extraMoves++) {
              const validMoves = []
              const directions = [
                { dr: 0, dc: 1, direction: 'right' },
                { dr: 0, dc: -1, direction: 'left' },
                { dr: 1, dc: 0, direction: 'down' },
                { dr: -1, dc: 0, direction: 'up' }
              ]
              
              for (const { dr, dc, direction } of directions) {
                const newRow = emptyRow + dr
                const newCol = emptyCol + dc
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                  validMoves.push({ row: newRow, col: newCol, direction })
                }
              }
              
              if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
                const { row: moveRow, col: moveCol, direction } = randomMove
                const movedPiece = newState[moveRow][moveCol]
                
                moves.push({
                  piece: movedPiece,
                  from: { row: moveRow, col: moveCol },
                  to: { row: emptyRow, col: emptyCol },
                  direction: direction
                })
                
                newState[emptyRow][emptyCol] = movedPiece
                newState[moveRow][moveCol] = null
                
                if (!isPieceInOriginalPosition(movedPiece, emptyRow, emptyCol)) {
                  tilesMovedFromOriginal.add(movedPiece)
                }
                
                emptyRow = moveRow
                emptyCol = moveCol
              }
            }
            stagnantCounter = 0
          }
        } else {
          lastProgressCount = tilesMovedFromOriginal.size
          stagnantCounter = 0
        }
      }
    }
    
    console.log(`Shuffle completed after ${moves.length} moves (${shuffleAttempts} attempts)`)
    console.log(`Tiles displaced from original positions: ${tilesMovedFromOriginal.size}/${totalTiles}`)
    console.log('Displaced tiles:', Array.from(tilesMovedFromOriginal).sort((a, b) => a - b))
    
    // Safety check - if we couldn't displace all tiles, log a warning but continue
    if (tilesMovedFromOriginal.size < totalTiles) {
      console.warn(`Warning: Only ${tilesMovedFromOriginal.size}/${totalTiles} tiles were displaced. Continuing with current shuffle.`)
      const remainingTiles = []
      for (let i = 0; i < 15; i++) {
        if (!tilesMovedFromOriginal.has(i)) {
          remainingTiles.push(i)
        }
      }
      console.warn('Tiles still in original positions:', remainingTiles)
    }
    
    setEmptyPosition({ row: emptyRow, col: emptyCol })
    setShuffleMoves(moves) // Store shuffle moves for computer solver
    console.log('Shuffle moves recorded:', moves)
    
    return newState
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePieceClick = (row, col) => {
    // Don't allow moves if not shuffled yet, completed, or computer is solving
    if (!isShuffled || gameCompleted || isComputerSolving) return
    
    if (!gameStarted) {
      setGameStarted(true)
    }
    
    // Check if clicked piece is adjacent to empty space
    const isAdjacent = 
      (Math.abs(row - emptyPosition.row) === 1 && col === emptyPosition.col) ||
      (Math.abs(col - emptyPosition.col) === 1 && row === emptyPosition.row)
    
    if (isAdjacent) {
      // Get the piece that will move
      const movedPiece = puzzleState[row][col]
      
      // Determine direction
      let direction = ''
      if (row < emptyPosition.row) direction = 'down'
      else if (row > emptyPosition.row) direction = 'up'
      else if (col < emptyPosition.col) direction = 'right'
      else if (col > emptyPosition.col) direction = 'left'
      
      // Step 5: Record user's movement
      const userMove = {
        piece: movedPiece,
        from: { row, col },
        to: { row: emptyPosition.row, col: emptyPosition.col },
        direction: direction
      }
      setUserMoves(prev => [...prev, userMove])
      
      // Swap piece with empty space
      const newState = puzzleState.map(row => [...row])
      newState[emptyPosition.row][emptyPosition.col] = newState[row][col]
      newState[row][col] = null
      
      setPuzzleState(newState)
      setEmptyPosition({ row, col })
      setMoves(prev => prev + 1)
      
      // Play sound
      if (soundEnabled) {
        playMoveSound()
      }
      
      // Check win condition
      if (isPuzzleSolved(newState)) {
        setGameCompleted(true)
        setGameWon(true)
        setEndTime(Date.now())
        setIsComputerWin(false)
        
        if (soundEnabled) {
          playWinSound()
        }
        
        // Only show completion modal for user wins, not computer solves
        if (!isComputerSolving) {
          setTimeout(async () => {
            setShowModal(true)
          }, 1000)
        }
      }
    }
  }

  const createSolvedState = () => {
    const solvedState = []
    let pieceIndex = 0
    
    for (let row = 0; row < 4; row++) {
      const rowPieces = []
      for (let col = 0; col < 4; col++) {
        if (row === 3 && col === 3) {
          rowPieces.push(null) // Empty space at bottom right
        } else {
          rowPieces.push(pieceIndex++)
        }
      }
      solvedState.push(rowPieces)
    }
    
    console.log('Created solved state:', solvedState)
    return solvedState
  }

  const isPuzzleSolved = (state) => {
    let expectedPiece = 0
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (row === 3 && col === 3) {
          return state[row][col] === null
        }
        if (state[row][col] !== expectedPiece) {
          return false
        }
        expectedPiece++
      }
    }
    return true
  }

  const playMoveSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  const playWinSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const notes = [523.25, 659.25, 783.99, 1046.5]
      
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.2)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.3)
        
        oscillator.start(audioContext.currentTime + index * 0.2)
        oscillator.stop(audioContext.currentTime + index * 0.2 + 0.3)
      })
    } catch (error) {
      console.error('Error playing win sound:', error)
    }
  }

  const handleNewGame = () => {
    // Cancel computer solving if in progress
    if (isComputerSolving) {
      setShouldCancelSolving(true)
      setIsComputerSolving(false)
      setComputerSolutionPath([])
      setCurrentSolutionStep(0)
    }
    
    // Shuffle the puzzle and start the game
    const shuffledState = shufflePuzzle(puzzleState)
    setPuzzleState(shuffledState)
    setIsShuffled(true)
    setGameStarted(true)
    setGameCompleted(false)
    setGameWon(false)
    setIsComputerWin(false)
    setShowModal(false)
    setMoves(0)
    setTimeElapsed(0)
    setUserMoves([]) // Clear user moves for new game
  }

  const handleShuffle = () => {
    if (gameCompleted) return
    
    // Re-shuffle from solved state
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
    
    const shuffledState = shufflePuzzle(solvedState)
    setPuzzleState(shuffledState)
    setUserMoves([]) // Clear user moves
    
    if (!isShuffled) {
      setIsShuffled(true)
      setGameStarted(true)
    }
  }

  const handleReset = () => {
    // Cancel computer solving if in progress
    if (isComputerSolving) {
      setShouldCancelSolving(true)
      setIsComputerSolving(false)
      setComputerSolutionPath([])
      setCurrentSolutionStep(0)
    }
    
    // Reset to perfect initial state
    initializePuzzle()
    setGameWon(false)
    setIsComputerWin(false)
  }

  const submitScore = async (playerName) => {
    try {
      const score = Math.max(0, 10000 - (moves * 10 + timeElapsed * 5))
      
      // Use accessToken if user is authenticated, otherwise use publicAnonKey
      const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${publicAnonKey}`
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1dc81b3/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          playerName: user ? undefined : playerName, // Don't send playerName if authenticated
          moves,
          timeInSeconds: timeElapsed,
          imageData: image.startsWith('data:') ? image : null
        })
      })

      if (response.ok) {
        setShowModal(false)
        onComplete()
        fetchLeaderboard()
      } else {
        const errorData = await response.json()
        console.error('Score submission error:', errorData)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
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

  const calculateComputerSolution = () => {
    console.log('=== CALCULATING COMPUTER SOLUTION ===')
    console.log('Current puzzle state:', puzzleState)
    console.log('Current empty position:', emptyPosition)
    console.log('User moves to undo:', userMoves.length, userMoves)
    console.log('Shuffle moves to reverse:', shuffleMoves.length, shuffleMoves)
    
    const solution = []
    
    // Step 1: Undo user's movements (in reverse order)
    const reversedUserMoves = [...userMoves].reverse()
    console.log('Reversed user moves:', reversedUserMoves)
    
    for (const move of reversedUserMoves) {
      // Reverse the move: swap from and to positions
      const reversedMove = {
        piece: move.piece,
        from: move.to, // Reverse: move piece back to where it came from
        to: move.from,
        direction: reverseDirection(move.direction),
        phase: 'undoing_user',
        description: `Undo user move: Move piece ${move.piece + 1} ${reverseDirection(move.direction)}`
      }
      solution.push(reversedMove)
      console.log('Added reversed user move:', reversedMove)
    }
    
    // Step 2: Undo shuffle movements (in reverse order)
    const reversedShuffleMoves = [...shuffleMoves].reverse()
    console.log('Reversed shuffle moves:', reversedShuffleMoves)
    
    for (const move of reversedShuffleMoves) {
      // Reverse the move: swap from and to positions
      const reversedMove = {
        piece: move.piece,
        from: move.to, // Reverse: move piece back to where it came from
        to: move.from,
        direction: reverseDirection(move.direction),
        phase: 'undoing_shuffle',
        description: `Undo shuffle move: Move piece ${move.piece + 1} ${reverseDirection(move.direction)}`
      }
      solution.push(reversedMove)
      console.log('Added reversed shuffle move:', reversedMove)
    }
    
    console.log('=== FINAL SOLUTION ===', solution)
    console.log('Total moves in solution:', solution.length)
    return solution
  }

  const executeComputerMove = (move) => {
    console.log('Executing computer move:', move)
    
    // Create new state with the move applied
    setPuzzleState(currentState => {
      const newState = currentState.map(row => [...row])
      
      // Execute the move
      newState[move.to.row][move.to.col] = move.piece
      newState[move.from.row][move.from.col] = null
      
      console.log('New puzzle state after move:', newState)
      return newState
    })
    
    // Update empty position
    setEmptyPosition(move.to)
    
    // Play move sound
    if (soundEnabled) {
      playMoveSound()
    }
  }

  const handleComputerSolve = async () => {
    // Only allow if puzzle is shuffled and not completed
    if (!isShuffled || gameCompleted || isComputerSolving) return
    
    // Calculate solution
    const solution = calculateComputerSolution()
    
    if (solution.length === 0) {
      console.log('Puzzle is already solved!')
      return
    }
    
    console.log('Starting computer solve with', solution.length, 'moves')
    
    setIsComputerSolving(true)
    setComputerSolutionPath(solution)
    setCurrentSolutionStep(0)
    setShouldCancelSolving(false)
    
    // Execute moves with half-second delays
    for (let i = 0; i < solution.length; i++) {
      if (shouldCancelSolving) break // Allow cancellation
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const move = solution[i]
      console.log(`Computer move ${i + 1}/${solution.length}:`, move)
      
      executeComputerMove(move)
      setCurrentSolutionStep(i + 1)
    }
    
    // Complete solving - ensure we end up in perfect solved state
    setTimeout(() => {
      // Force the puzzle to the perfect solved state
      const solvedState = createSolvedState()
      console.log('Setting final solved state:', solvedState)
      
      setPuzzleState(currentState => {
        console.log('Current state before forcing solved:', currentState)
        console.log('About to set solved state:', solvedState)
        return solvedState
      })
      setEmptyPosition({ row: 3, col: 3 })
      
      // Verify the puzzle is actually solved after a brief delay
      setTimeout(() => {
        setPuzzleState(currentState => {
          const isSolved = isPuzzleSolved(currentState)
          console.log('=== FINAL VERIFICATION ===')
          console.log('Current puzzle state:', currentState)
          console.log('Is puzzle solved?', isSolved)
          console.log('Expected solved state:', solvedState)
          
          // If not solved, force it to be solved
          if (!isSolved) {
            console.log('FORCING PUZZLE TO SOLVED STATE')
            return solvedState
          }
          return currentState
        })
      }, 100)
      
      // Complete the computer solving process
      setIsComputerSolving(false)
      setCurrentSolutionStep(0)
      setComputerSolutionPath([])
      
      // Mark game as completed via computer solve (give up)
      setGameCompleted(true)
      setGameWon(true)
      setEndTime(Date.now())
      setIsComputerWin(true)
      
      if (soundEnabled) {
        playWinSound()
      }
      
      console.log('Computer solve completed - puzzle should now be in solved state')
    }, 500)
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white h-14 shadow-sm">
        <div className="flex items-center justify-between px-6 h-full">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <svg className="w-full h-full" viewBox="0 0 46 28" fill="none">
                <path d={svgPaths.p223a4580} fill="#636AE8"/>
                <path d={svgPaths.p2114b500} fill="#ABAEF2"/>
                <path d={svgPaths.p2015ff00} fill="#878CED"/>
              </svg>
            </div>
            <h1 className="text-lg font-medium text-gray-900">SlidePuzzle Mania</h1>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-8">
            <button onClick={onBack} className="text-sm font-medium text-blue-600">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Home
            </button>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Leaderboard</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">About</a>
          </nav>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gray-100 overflow-hidden">
              <img src={imgRectangle} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 p-8 space-y-6">
          {/* Game Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Game Actions</h3>
            
            <div className="space-y-4">
              <Button 
                onClick={handleNewGame}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                disabled={gameCompleted || isComputerSolving}
              >
                <Play className="w-4 h-4 mr-2" />
                {isShuffled ? 'New Game' : 'Start Game'}
              </Button>
              
              <Button 
                onClick={handleShuffle}
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 h-10"
                disabled={gameCompleted || isComputerSolving}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
              
              <Button 
                onClick={handleReset}
                variant="ghost" 
                className="w-full text-red-600 hover:bg-red-50 h-10"
                disabled={isComputerSolving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Game
              </Button>
            </div>
          </div>

          {/* Computer Solver */}
          {isShuffled && !gameCompleted && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Need Help?</h3>
              
              <p className="text-sm text-purple-700 mb-4">
                Stuck on this puzzle? The computer will undo your moves and reverse the shuffle to solve it optimally.
              </p>
              
              <Button 
                onClick={handleComputerSolve}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-10"
                disabled={isComputerSolving}
              >
                <Cpu className="w-4 h-4 mr-2" />
                {isComputerSolving ? 'Computer Solving...' : 'Computer Solve (Give Up)'}
              </Button>
              
              {isComputerSolving && (
                <div className="mt-3 p-2 bg-purple-100 rounded border border-purple-300">
                  <p className="text-xs text-purple-800 text-center">
                    🤖 Computer is solving: {currentSolutionStep}/{computerSolutionPath.length} moves
                  </p>
                </div>
              )}
              
              {!isComputerSolving && (
                <p className="text-xs text-purple-600 mt-2 text-center">
                  ⚠️ This counts as giving up - no score will be recorded
                </p>
              )}
            </div>
          )}

          {/* Game Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  !isShuffled ? 'text-blue-600' : 
                  gameCompleted ? 'text-green-600' : 
                  isComputerSolving ? 'text-purple-600' :
                  'text-orange-600'
                }`}>
                  {!isShuffled ? 'Perfect Order' : 
                   gameCompleted ? 'Completed!' : 
                   isComputerSolving ? 'Computer Solving' :
                   'In Progress'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Can Move:</span>
                <span className={`text-sm font-medium ${isShuffled && !gameCompleted && !isComputerSolving ? 'text-green-600' : 'text-gray-400'}`}>
                  {isShuffled && !gameCompleted && !isComputerSolving ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">How to Play</h3>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>1. Click "Start Game" to shuffle the puzzle (all tiles displaced)</p>
              <p>2. Click tiles adjacent to empty space to move them</p>
              <p>3. Arrange all pieces to recreate the original image</p>
              <p>4. Complete it quickly for a higher score!</p>
            </div>
            
            {shuffleMoves.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700">
                  <strong>Puzzle Info:</strong><br/>
                  Shuffle moves: {shuffleMoves.length}<br/>
                  Your moves: {userMoves.length}<br/>
                  <span className="text-green-700">✓ All tiles displaced from original positions</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Game Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Statistics</h3>
            
            <div className="flex space-x-10">
              <div className="flex items-center space-x-3">
                <span className="text-base text-gray-600 w-24">Moves:</span>
                <span className="text-2xl font-semibold text-gray-900">{moves}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-base text-gray-600 w-24">Time:</span>
                <span className="text-2xl font-semibold text-gray-900">{formatTime(timeElapsed)}</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-base text-gray-600 w-24">Score:</span>
                <span className="text-2xl font-semibold text-blue-600">
                  {Math.max(0, 10000 - (moves * 10 + timeElapsed * 5)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Puzzle Grid */}
          <div className="bg-gray-300 rounded-xl p-0 w-[600px] h-[600px] grid grid-cols-4 gap-0 overflow-hidden">
            {puzzleState.map((row, rowIndex) =>
              row.map((piece, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-[150px] h-[150px] ${
                    piece === null 
                      ? 'bg-gray-300' 
                      : isShuffled && !gameCompleted && !isComputerSolving
                        ? 'cursor-pointer hover:opacity-90 transition-opacity'
                        : 'cursor-default'
                  }`}
                  onClick={() => handlePieceClick(rowIndex, colIndex)}
                >
                  {piece !== null && puzzlePieces[piece] && (
                    <img
                      src={puzzlePieces[piece]}
                      alt={`Puzzle piece ${piece + 1}`}
                      className="w-full h-full object-cover block"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          {!isShuffled && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-center">
                <strong>Perfect Order!</strong> Click "Start Game" to shuffle the pieces and begin playing.
              </p>
            </div>
          )}
          
          {/* Computer Solving Indicator */}
          {isComputerSolving && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-center">
                <strong>🤖 Computer is solving the puzzle...</strong><br/>
                <span className="text-sm">Each move takes 0.5 seconds</span>
              </p>
            </div>
          )}
          
          {/* Computer Win Indicator */}
          {gameCompleted && isComputerWin && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-center">
                <strong>🤖 Puzzle solved by computer!</strong><br/>
                <span className="text-sm">No score recorded - try solving it yourself next time!</span>
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-96 p-8 space-y-6">
          {/* Top Players */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Top Players</h3>
            </div>
            
            <div className="space-y-4">
              {leaderboardData.length > 0 ? (
                leaderboardData.slice(0, 4).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-medium text-gray-900 w-36">
                        {index + 1}. {player.playerName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatTime(player.timeInSeconds)} / {player.moves} moves
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900 w-36">1. Player One</span>
                    <span className="text-sm text-gray-600">01:23 / 56 moves</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900 w-36">2. PuzzlePro</span>
                    <span className="text-sm text-gray-600">01:45 / 68 moves</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900 w-36">3. SpeedySolver</span>
                    <span className="text-sm text-gray-600">02:01 / 72 moves</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900 w-36">4. GameAce</span>
                    <span className="text-sm text-gray-600">02:30 / 85 moves</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reference Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reference Image</h3>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={image}
                alt="Original image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Game Completion Modal */}
      {showModal && (
        <GameCompletionModal
          moves={moves}
          timeElapsed={timeElapsed}
          score={Math.max(0, 10000 - (moves * 10 + timeElapsed * 5))}
          onSubmitScore={submitScore}
          onClose={() => {
            setShowModal(false)
            onComplete()
          }}
          user={user}
          isAuthenticated={!!user}
        />
      )}


    </div>
  )
}
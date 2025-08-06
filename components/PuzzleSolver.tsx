// This file is deprecated - the puzzle solver logic has been moved to ComputerSolver.tsx
// to avoid circular dependencies and improve reliability.

export class PuzzleSolver {
  static solvePuzzle(puzzleState) {
    console.warn('PuzzleSolver.tsx is deprecated. Use the solver in ComputerSolver.tsx instead.')
    return { solved: false, path: [], totalMoves: 0 }
  }
}
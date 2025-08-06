import React, { useState, useEffect, useRef } from 'react'
import { GameScreen } from './components/GameScreen'
import { ImageUpload } from './components/ImageUpload'
import { AuthModal } from './components/AuthModal'
import { useAuth } from './hooks/useAuth'
import { Volume2, Settings, Play, Shuffle, RotateCcw, Trophy, Twitter, Github, Linkedin, Upload, Camera, X, AlertTriangle, LogIn, LogOut, User } from 'lucide-react'
import { Button } from './components/ui/button'
import { projectId, publicAnonKey } from './utils/supabase/info'
import imgRectangle from "figma:asset/8c248244a03c4b443811e8029b4c48959592e6c0.png"
import imgImage from "figma:asset/2ef64e0eb574f7af37565fc570395bf95b2c7ef7.png"
import svgPaths from "./imports/svg-7m8xz388nq"
import Container from "./imports/Container"

export default function App() {
  const { user, accessToken, loading, signIn, signOut, isAuthenticated } = useAuth()
  const [currentScreen, setCurrentScreen] = useState('preparation') // Start with preparation screen
  const [selectedImage, setSelectedImage] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [showCameraError, setShowCameraError] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    fetchLeaderboard()
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const authData = urlParams.get('auth')
    if (authData) {
      try {
        const { accessToken: token, user: userData, expiresAt } = JSON.parse(atob(authData))
        localStorage.setItem('slidepuzzle_auth', JSON.stringify({ accessToken: token, user: userData, expiresAt }))
        signIn(userData, token)
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (error) {
        console.error('Error handling OAuth callback:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Cleanup camera stream when component unmounts or camera closes
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleImageSelect = (imageUrl) => {
    setSelectedImage(imageUrl)
    setCurrentScreen('game')
  }

  const handleGameComplete = () => {
    fetchLeaderboard()
    // Stay on game screen after completion
  }

  const handleBackToPreparation = () => {
    setCurrentScreen('preparation')
    setSelectedImage(null)
  }

  const handleLeaderboardClick = () => {
    setShowLeaderboard(true)
  }

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false)
  }

  const getCameraErrorMessage = (error) => {
    switch (error.name) {
      case 'NotAllowedError':
        return {
          title: 'Camera Permission Denied',
          message: 'Please allow camera access in your browser settings and try again.',
          instructions: [
            'Click the camera icon in your browser\'s address bar',
            'Select "Allow" for camera access',
            'Refresh the page and try again'
          ]
        }
      case 'NotFoundError':
        return {
          title: 'No Camera Found',
          message: 'No camera was detected on your device.',
          instructions: [
            'Make sure your camera is connected and working',
            'Try refreshing the page',
            'Use the "Upload Image" option instead'
          ]
        }
      case 'NotReadableError':
        return {
          title: 'Camera Busy',
          message: 'Your camera is being used by another application.',
          instructions: [
            'Close other apps that might be using your camera',
            'Try refreshing the page',
            'Restart your browser if the issue persists'
          ]
        }
      case 'NotSupportedError':
        return {
          title: 'Camera Not Supported',
          message: 'Your browser or device doesn\'t support camera access.',
          instructions: [
            'Try using a different browser (Chrome, Firefox, Safari)',
            'Make sure you\'re using HTTPS',
            'Use the "Upload Image" option instead'
          ]
        }
      default:
        return {
          title: 'Camera Access Error',
          message: 'Unable to access your camera.',
          instructions: [
            'Make sure your browser supports camera access',
            'Check that you\'re using a secure connection (HTTPS)',
            'Try refreshing the page'
          ]
        }
    }
  }

  const handleTakePhoto = async () => {
    try {
      setCameraError('')
      setShowCameraError(false)
      
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Camera access requires a secure connection (HTTPS)')
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser')
      }
      
      // Request camera permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      })
      
      setCameraStream(stream)
      setShowCamera(true)
      
      // Set up video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      const errorInfo = getCameraErrorMessage(error)
      setCameraError(errorInfo)
      setShowCameraError(true)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.8)

    // Stop camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }

    setShowCamera(false)
    
    // Use captured photo for the game
    handleImageSelect(imageDataURL)
  }

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCameraError('')
  }

  const closeCameraError = () => {
    setShowCameraError(false)
    setCameraError('')
  }

  const handleAuthSuccess = (userData, token) => {
    signIn(userData, token)
    setShowAuthModal(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Sample images for quick start
  const sampleImages = [
    'https://images.pexels.com/photos/321396/pexels-photo-321396.jpeg',
    'https://images.pexels.com/photos/321395/pexels-photo-321395.jpeg',
    'https://images.pexels.com/photos/373290/pexels-photo-373290.jpeg'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg className="w-full h-full animate-spin" viewBox="0 0 46 28" fill="none">
              <path d={svgPaths.p223a4580} fill="#636AE8"/>
              <path d={svgPaths.p2114b500} fill="#ABAEF2"/>
              <path d={svgPaths.p2015ff00} fill="#878CED"/>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentScreen === 'game' && selectedImage) {
    return (
      <GameScreen 
        image={selectedImage} 
        onComplete={handleGameComplete}
        onBack={handleBackToPreparation}
        user={user}
        accessToken={accessToken}
      />
    )
  }

  // Leaderboard Modal
  if (showLeaderboard) {
    return (
      <>
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={handleCloseLeaderboard}
        />
        
        {/* Modal content */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="w-full max-w-md pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Container />
          </div>
        </div>
      </>
    )
  }

  // Camera Error Modal
  if (showCameraError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          {/* Close button */}
          <button
            onClick={closeCameraError}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Error icon and title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{cameraError.title}</h3>
            </div>
          </div>

          {/* Error message */}
          <p className="text-gray-600 mb-6">{cameraError.message}</p>

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">How to fix this:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              {cameraError.instructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleTakePhoto}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
            <Button
              onClick={() => {
                closeCameraError()
                document.getElementById('file-input')?.click()
              }}
              variant="outline"
              className="flex-1"
            >
              Upload Instead
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Camera Interface Modal
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="relative w-full h-full max-w-4xl max-h-4xl flex flex-col items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeCamera}
            className="absolute top-6 right-6 z-10 p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Camera preview */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto max-w-3xl max-h-[70vh] object-cover"
            />
            
            {/* Capture overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Grid overlay for better composition */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white border-opacity-20" />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center space-x-6">
            <Button
              onClick={closeCamera}
              variant="outline"
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
            >
              Cancel
            </Button>
            
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            
            <div className="w-24"></div> {/* Spacer for symmetry */}
          </div>

          {/* Instructions */}
          <p className="mt-4 text-white text-center text-sm opacity-80">
            Position your subject and tap the capture button
          </p>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  // Preparation Screen
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
            <a href="#" className="text-sm font-medium text-blue-600">Home</a>
            <button 
              onClick={handleLeaderboardClick}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Leaderboard
            </button>
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
            
            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user?.provider === 'github' ? (
                    <Github className="w-4 h-4 text-gray-600" />
                  ) : user?.provider === 'google' ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 p-8 space-y-6">
          {/* Create Puzzle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Your Puzzle</h3>
            
            <div className="space-y-4">
              <Button 
                onClick={() => document.getElementById('file-input')?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>

            {/* Hidden file input for upload */}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    handleImageSelect(event.target.result)
                  }
                  reader.readAsDataURL(file)
                }
              }}
              className="hidden"
            />
          </div>

          {/* Quick Start */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Start</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleImageSelect(sampleImages[0])}
                className="w-full p-3 text-left bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-colors"
              >
                <div className="font-medium text-green-900">Nature</div>
                <div className="text-sm text-green-600">Serene mountain lake landscape</div>
              </button>
              
              <button 
                onClick={() => handleImageSelect(sampleImages[1])}
                className="w-full p-3 text-left bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="font-medium text-blue-900">City</div>
                <div className="text-sm text-blue-600">Urban architecture and skyline</div>
              </button>
              
              <button 
                onClick={() => handleImageSelect(sampleImages[2])}
                className="w-full p-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-colors"
              >
                <div className="font-medium text-purple-900">Seoul</div>
                <div className="text-sm text-purple-600">Vibrant Korean cityscape</div>
              </button>
            </div>
          </div>


        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">


          {/* Sample Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview: How Your Puzzle Will Look</h3>
            
            <div className="grid grid-cols-4 gap-1 bg-gray-300 p-4 rounded-lg w-[400px] h-[400px] mx-auto">
              {Array.from({ length: 15 }, (_, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center text-sm font-semibold text-gray-700 rounded-sm"
                >
                  {i + 1}
                </div>
              ))}
              <div className="bg-gray-300 border-2 border-dashed border-gray-400 rounded-sm flex items-center justify-center text-xs text-gray-500">
                Empty
              </div>
            </div>
          </div>
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

          {/* Challenge Yourself */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
              <img src={imgImage} alt="Challenge" className="w-full h-full object-cover" />
            </div>
            
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Ready to Start?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your image or choose a sample to begin your puzzle challenge!
            </p>
            
            <Button 
              onClick={() => handleImageSelect(sampleImages[0])}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Quick Start
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
            <h4 className="font-semibold text-indigo-900 mb-3">💡 Pro Tips</h4>
            <ul className="text-sm text-indigo-800 space-y-2">
              <li>• Choose images with clear details and good contrast</li>
              <li>• Square images work best for puzzles</li>
              <li>• Start with corners and edges</li>
              <li>• Plan multiple moves ahead</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white h-28 border-t flex items-center justify-between px-16">
        <p className="text-xs text-gray-600">© 2053 Forethink All rights reserved.</p>
        
        <div className="flex items-center space-x-4">
          <Twitter className="w-4 h-4 text-gray-600" />
          <Github className="w-4 h-4 text-gray-600" />
          <Linkedin className="w-4 h-4 text-gray-600" />
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
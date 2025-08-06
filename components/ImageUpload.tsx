import React, { useState, useRef } from 'react'
import { Upload, Camera, Image as ImageIcon, Play } from 'lucide-react'
import { Button } from './ui/button'

export function ImageUpload({ onImageSelect }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedFile(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const startGame = () => {
    if (selectedFile) {
      onImageSelect(selectedFile)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <img 
              src={selectedFile} 
              alt="Selected puzzle" 
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <div className="space-y-3">
              <Button 
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Puzzle Game
              </Button>
              <Button 
                onClick={() => setSelectedFile(null)}
                variant="outline"
                className="ml-2"
              >
                Choose Different Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your image here
              </h4>
              <p className="text-gray-600 mb-4">
                Support for JPG, PNG, and WebP images up to 5MB
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={openFileDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              
              <Button
                onClick={openCamera}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {!selectedFile && (
        <>
          {/* Quick Start Options */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Or try these sample puzzles:</p>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => onImageSelect('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop')}
                className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg hover:scale-105 transition-transform flex items-center justify-center text-white"
              >
                <span className="text-sm font-medium">Nature</span>
              </button>
              <button 
                onClick={() => onImageSelect('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=600&fit=crop')}
                className="aspect-square bg-gradient-to-br from-green-400 to-blue-500 rounded-lg hover:scale-105 transition-transform flex items-center justify-center text-white"
              >
                <span className="text-sm font-medium">Tech</span>
              </button>
              <button 
                onClick={() => onImageSelect('https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&h=600&fit=crop')}
                className="aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg hover:scale-105 transition-transform flex items-center justify-center text-white"
              >
                <span className="text-sm font-medium">Abstract</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Choose images with clear details and good contrast</li>
              <li>• Square images work best for the 4x4 puzzle grid</li>
              <li>• Avoid images that are too dark or have similar colors</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
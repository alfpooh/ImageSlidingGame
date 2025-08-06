import React, { useState, useEffect } from 'react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      const authData = localStorage.getItem('slidepuzzle_auth')
      if (!authData) {
        setLoading(false)
        return
      }

      const { accessToken: token, user: userData, expiresAt } = JSON.parse(authData)
      
      // Check if token is expired
      if (Date.now() > expiresAt) {
        localStorage.removeItem('slidepuzzle_auth')
        setLoading(false)
        return
      }

      // Verify token is still valid with server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1dc81b3/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAccessToken(token)
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('slidepuzzle_auth')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      localStorage.removeItem('slidepuzzle_auth')
    } finally {
      setLoading(false)
    }
  }

  const signIn = (userData, token) => {
    setUser(userData)
    setAccessToken(token)
  }

  const signOut = async () => {
    try {
      if (accessToken) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1dc81b3/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      }
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      localStorage.removeItem('slidepuzzle_auth')
      setUser(null)
      setAccessToken(null)
    }
  }

  return {
    user,
    accessToken,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }
}
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'
import auth from './auth.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialize storage bucket for puzzle images
async function initializeBucket() {
  const bucketName = 'make-f1dc81b3-puzzle-images'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
    if (error) {
      console.log('Error creating bucket:', error)
    } else {
      console.log('Created puzzle images bucket')
    }
  }
}

// Initialize bucket on startup
initializeBucket()

// Mount auth routes
app.route('/make-server-f1dc81b3/auth', auth)

// Submit score to leaderboard
app.post('/make-server-f1dc81b3/leaderboard', async (c) => {
  try {
    // Check if user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    let user = null
    
    if (accessToken) {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser(accessToken)
        if (!error && authUser) {
          user = authUser
        }
      } catch (authError) {
        console.log('Auth verification error:', authError)
      }
    }
    
    const { playerName, moves, timeInSeconds, imageData } = await c.req.json()
    
    if (!moves || !timeInSeconds) {
      return new Response('Missing required fields', { status: 400 })
    }
    
    // Use authenticated user name or provided name
    const finalPlayerName = user ? user.user_metadata?.name || user.email : (playerName || 'Anonymous')

    // Calculate score: 10000 - (moves * 10 + time * 5), minimum 0
    const score = Math.max(0, 10000 - (moves * 10 + timeInSeconds * 5))
    
    // Store image if provided
    let imageUrl = null
    if (imageData) {
      try {
        // Convert base64 to blob
        const base64Data = imageData.split(',')[1]
        const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        
        const timestamp = Date.now()
        const filename = `puzzle_${timestamp}.png`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('make-f1dc81b3-puzzle-images')
          .upload(filename, imageBuffer, {
            contentType: 'image/png'
          })
        
        if (uploadError) {
          console.log('Image upload error:', uploadError)
        } else {
          // Get signed URL for the uploaded image
          const { data: signedData } = await supabase.storage
            .from('make-f1dc81b3-puzzle-images')
            .createSignedUrl(filename, 3600 * 24 * 7) // 7 days
          
          imageUrl = signedData?.signedUrl
        }
      } catch (imageError) {
        console.log('Error processing image:', imageError)
      }
    }

    // Store score in leaderboard
    const leaderboardEntry = {
      id: `score_${Date.now()}_${Math.random()}`,
      userId: user?.id || null,
      playerName: finalPlayerName,
      moves,
      timeInSeconds,
      score,
      imageUrl,
      authenticated: !!user,
      createdAt: new Date().toISOString()
    }

    await kv.set(`leaderboard:${leaderboardEntry.id}`, leaderboardEntry)
    
    return new Response(JSON.stringify({ 
      success: true, 
      score,
      leaderboardEntry 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.log('Error submitting score:', error)
    return new Response(`Error submitting score: ${error}`, { status: 500 })
  }
})

// Get leaderboard
app.get('/make-server-f1dc81b3/leaderboard', async (c) => {
  try {
    const leaderboardEntries = await kv.getByPrefix('leaderboard:')
    
    // Sort by score descending, then by time ascending
    const sortedEntries = leaderboardEntries
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return a.timeInSeconds - b.timeInSeconds
      })
      .slice(0, 10) // Top 10
    
    return new Response(JSON.stringify(sortedEntries), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.log('Error getting leaderboard:', error)
    return new Response(`Error getting leaderboard: ${error}`, { status: 500 })
  }
})

// Get recent puzzles
app.get('/make-server-f1dc81b3/recent-puzzles', async (c) => {
  try {
    const recentEntries = await kv.getByPrefix('leaderboard:')
    
    // Get unique puzzles by image, sorted by creation time
    const uniquePuzzles = recentEntries
      .filter(entry => entry.imageUrl)
      .reduce((unique, entry) => {
        const exists = unique.find(p => p.imageUrl === entry.imageUrl)
        if (!exists) {
          unique.push(entry)
        }
        return unique
      }, [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
    
    return new Response(JSON.stringify(uniquePuzzles), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.log('Error getting recent puzzles:', error)
    return new Response(`Error getting recent puzzles: ${error}`, { status: 500 })
  }
})

Deno.serve(app.fetch)
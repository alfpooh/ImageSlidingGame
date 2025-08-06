import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const auth = new Hono()

auth.use('*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// User registration
auth.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        created_at: new Date().toISOString()
      },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    })

    if (error) {
      console.error('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ 
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        provider: 'email'
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// User sign in
auth.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Create client with anon key for sign in
    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await anonSupabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Signin error:', error)
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    return c.json({
      access_token: data.session.access_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'User',
        provider: 'email'
      }
    })
  } catch (error) {
    console.error('Signin error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Google OAuth sign in
auth.post('/google', async (c) => {
  try {
    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await anonSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${c.req.url.split('/auth/google')[0]}/auth/callback`
      }
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return c.json({ error: 'Failed to initiate Google sign in' }, 400)
    }

    return c.json({ url: data.url })
  } catch (error) {
    console.error('Google OAuth error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GitHub OAuth sign in
auth.post('/github', async (c) => {
  try {
    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-github
    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await anonSupabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${c.req.url.split('/auth/github')[0]}/auth/callback`
      }
    })

    if (error) {
      console.error('GitHub OAuth error:', error)
      return c.json({ error: 'Failed to initiate GitHub sign in' }, 400)
    }

    return c.json({ url: data.url })
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// OAuth callback handler
auth.get('/callback', async (c) => {
  try {
    const code = c.req.query('code')
    
    if (!code) {
      return c.json({ error: 'Authorization code not found' }, 400)
    }

    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await anonSupabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth callback error:', error)
      return c.json({ error: 'Failed to complete authentication' }, 400)
    }

    // Extract user name from different OAuth providers
    let userName = data.user.email
    
    // Try to get name from user_metadata (Google) or user_metadata.full_name (GitHub)
    if (data.user.user_metadata?.name) {
      userName = data.user.user_metadata.name
    } else if (data.user.user_metadata?.full_name) {
      userName = data.user.user_metadata.full_name
    } else if (data.user.user_metadata?.user_name) {
      userName = data.user.user_metadata.user_name
    }

    // Store auth data and redirect to success page
    const authData = {
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userName,
        provider: data.user.app_metadata?.provider || 'unknown'
      },
      expiresAt: Date.now() + (data.session.expires_in * 1000)
    }

    // Redirect with auth data as URL params (client will handle storage)
    const redirectUrl = new URL('/', c.req.url)
    redirectUrl.searchParams.set('auth', btoa(JSON.stringify(authData)))
    
    return c.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Verify token
auth.get('/verify', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Extract user name from different OAuth providers
    let userName = 'User'
    
    if (user.user_metadata?.name) {
      userName = user.user_metadata.name
    } else if (user.user_metadata?.full_name) {
      userName = user.user_metadata.full_name
    } else if (user.user_metadata?.user_name) {
      userName = user.user_metadata.user_name
    } else if (user.email) {
      userName = user.email.split('@')[0]
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: userName,
        provider: user.app_metadata?.provider || 'email'
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Sign out
auth.post('/signout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (accessToken) {
      await supabase.auth.admin.signOut(accessToken)
    }

    return c.json({ message: 'Signed out successfully' })
  } catch (error) {
    console.error('Signout error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default auth
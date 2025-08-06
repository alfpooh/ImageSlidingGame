# 🚀 Deployment Guide

This guide will help you deploy your Sliding Puzzle Master game to various platforms and connect it to your GitHub repository.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Supabase project set up
- ✅ Edge functions deployed
- ✅ OAuth providers configured (optional)
- ✅ Environment variables ready

## 🔗 Connect to GitHub Repository

### Step 1: Initialize Git Repository
```bash
# If you haven't already initialized git
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Sliding Puzzle Master game"
```

### Step 2: Connect to Your GitHub Repository
```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/alfpooh/ImageSlidingGame.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Verify Connection
- Visit your GitHub repository: https://github.com/alfpooh/ImageSlidingGame
- Ensure all files are uploaded correctly
- Check that the README displays properly

## 🌐 Platform Deployments

### Option 1: Vercel (Recommended)

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alfpooh/ImageSlidingGame)

#### Manual Setup
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "ImageSlidingGame"

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Visit your live site!

### Option 2: Netlify

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add your Supabase credentials

4. **Deploy**
   - Click "Deploy site"
   - Custom domain setup available

### Option 3: GitHub Pages (Static Only)

⚠️ **Note**: GitHub Pages only supports static sites. Your Supabase backend will still work, but you need to configure CORS properly.

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: `gh-pages`

2. **Add Deploy Action**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
             
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Add Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add your environment variables as secrets

## 🔧 Post-Deployment Configuration

### Update OAuth Redirect URLs
After deployment, update your OAuth settings:

1. **Supabase Auth Settings**
   - Add your deployment URL to allowed origins
   - Update OAuth redirect URLs

2. **GitHub OAuth App**
   - Authorization callback URL: `https://your-domain.com`
   - Update in GitHub Developer settings

3. **Google OAuth**
   - Add your domain to authorized origins
   - Update in Google Cloud Console

### Test Your Deployment
- ✅ Game loads correctly
- ✅ Image upload works
- ✅ Camera capture functions
- ✅ Authentication flows work
- ✅ Leaderboard updates
- ✅ Computer solver functions

## 🔄 Continuous Deployment

Once connected to GitHub, you can enable automatic deployments:

### Vercel
- Automatic deployments on every push to `main`
- Preview deployments for pull requests
- Rollback capabilities

### Netlify
- Deploy previews for every pull request
- Branch deployments
- Form handling (if needed)

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_`
   - Check spelling and values
   - Restart deployment after changes

3. **CORS Errors**
   - Check Supabase Auth settings
   - Verify allowed origins include your domain
   - Test with curl or Postman

4. **OAuth Not Working**
   - Verify callback URLs match exactly
   - Check OAuth app configuration
   - Ensure HTTPS is used (required for OAuth)

## 📊 Monitoring

### Analytics Setup
Consider adding:
- Google Analytics
- Vercel Analytics
- Supabase Analytics
- Error tracking (Sentry)

### Performance Monitoring
- Lighthouse CI in GitHub Actions
- Core Web Vitals tracking
- Supabase performance monitoring

## 🚀 Next Steps

After successful deployment:
1. **Custom Domain**: Set up your own domain
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **CDN**: Optimize global performance
4. **Monitoring**: Set up uptime monitoring
5. **Backup**: Regular database backups

---

**🎉 Congratulations! Your Sliding Puzzle Master is now live!**

Share your game with friends and start climbing the leaderboard! 🏆
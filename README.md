# 🧩 Sliding Puzzle Master

A modern, interactive 4x4 sliding puzzle game built with React, featuring image upload, camera capture, real-time leaderboards, and social authentication.

> 🇰🇷 For Korean documentation, see [READMEinKR.md](READMEinKR.md).

## ✨ Features

### 🎮 Core Game Features
- **4x4 Sliding Puzzle**: Classic sliding puzzle mechanics with smooth animations
- **Custom Images**: Upload your own photos or use camera capture
- **Quick Start**: Pre-loaded sample images for instant gameplay
- **Smart Shuffling**: Guaranteed solvable puzzle generation
- **Computer Solver**: Watch the AI solve any puzzle automatically
- **Sound Effects**: Audio feedback for moves and completion

### 🏆 Competition & Social
- **Real-time Leaderboard**: Global rankings with live updates
- **Score System**: Based on completion time and move count
- **User Authentication**: Email, Google, and GitHub sign-in
- **Player Profiles**: Track your progress and achievements

### 📱 Modern UX
- **Responsive Design**: Works on desktop and mobile devices
- **Camera Integration**: Take photos directly in the browser
- **Drag & Drop**: Easy image upload interface
- **Educational Mode**: Learn how shuffling algorithms work
- **Game Statistics**: Detailed move tracking and timing

## 🚀 Live Demo

[Play Sliding Puzzle Master](your-deployment-url-here)

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Deployment**: Ready for Vercel/Netlify
- **Authentication**: Supabase Auth with OAuth providers
- **State Management**: React Hooks
- **Image Processing**: Canvas API

## 📦 Project Structure

```
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── GameScreen.tsx   # Main game interface
│   ├── AuthModal.tsx    # Authentication modal
│   └── ...
├── supabase/            # Backend functions
│   └── functions/
│       └── server/      # Edge functions for API
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── styles/              # Global CSS and Tailwind config
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- GitHub OAuth app (optional)
- Google OAuth app (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/alfpooh/ImageSlidingGame.git
cd ImageSlidingGame
npm install
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `/utils/supabase/info.tsx` with your credentials:

```typescript
export const projectId = 'your-project-id'
export const publicAnonKey = 'your-anon-key'
```

### 3. Database Setup
The app uses a simple key-value store table that's automatically created. No manual database setup required!

### 4. Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy
```

### 5. OAuth Setup (Optional)

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth app with:
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Add credentials to Supabase Auth settings

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase Auth settings

### 6. Environment Variables
Create a `.env.local` file:
```bash
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 7. Run Development Server
```bash
npm start
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables

## 🎮 How to Play

1. **Choose an Image**: Upload your own or select a quick start option
2. **Start Solving**: Click tiles adjacent to the empty space to move them
3. **Complete the Puzzle**: Arrange pieces to recreate the original image
4. **Compete**: Your best times appear on the global leaderboard

### Pro Tips
- Start with corners and edges
- Plan multiple moves ahead
- Use the computer solver to learn optimal strategies
- Choose images with clear details for easier solving

## 🔨 Game Mechanics

### Shuffling Algorithm
- Uses Fisher-Yates shuffle with solvability validation
- Ensures every generated puzzle has a solution
- Maintains fair difficulty across all games

### Scoring System
- **Time Factor**: Faster completion = higher score
- **Move Efficiency**: Fewer moves = bonus points
- **Leaderboard**: Best time + move count combination

### Computer Solver
- Reverses the exact shuffle and user moves
- Demonstrates optimal solving strategy
- Educational tool for understanding puzzle mechanics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pexels**: Sample images for quick start
- **Shadcn/ui**: Beautiful UI components
- **Lucide**: Clean and consistent icons
- **Supabase**: Backend infrastructure
- **React Community**: Amazing ecosystem

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/alfpooh/ImageSlidingGame/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/alfpooh/ImageSlidingGame/discussions)
- 📧 **Contact**: [Your Email](mailto:your-email@example.com)

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Core sliding puzzle mechanics
- ✅ Image upload and camera capture
- ✅ Real-time leaderboard
- ✅ Multi-provider authentication
- ✅ Computer solver with visualization
- ✅ Educational components
- ✅ Responsive design

---

**Built with ❤️ using React and Supabase**
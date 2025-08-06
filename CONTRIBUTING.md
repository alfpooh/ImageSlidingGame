# 🤝 Contributing to Sliding Puzzle Master

Thank you for your interest in contributing to Sliding Puzzle Master! This guide will help you get started with contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic knowledge of React and TypeScript
- Supabase account (for backend testing)

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ImageSlidingGame.git
   cd ImageSlidingGame
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your Supabase credentials
   # VITE_SUPABASE_URL=your-supabase-url
   # VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### Types of Contributions We Welcome

- 🐛 **Bug Fixes**: Fix issues with game mechanics, UI, or performance
- ✨ **New Features**: Add new puzzle types, game modes, or UI improvements
- 📚 **Documentation**: Improve README, add tutorials, or write guides
- 🎨 **UI/UX**: Enhance visual design, accessibility, or user experience
- 🔧 **Performance**: Optimize loading times, animations, or algorithms
- 🧪 **Testing**: Add unit tests, integration tests, or end-to-end tests

### 🔄 Development Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Changes**
   - Follow our coding standards (see below)
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit Changes**
   ```bash
   # Use conventional commit format
   git commit -m "feat: add drag and drop for puzzle pieces"
   git commit -m "fix: resolve camera permissions on iOS"
   git commit -m "docs: update setup instructions"
   ```

4. **Push and Create PR**
   ```bash
   git push origin your-branch-name
   ```
   - Go to GitHub and create a Pull Request
   - Use the PR template
   - Link any related issues

## 📝 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing code style and formatting
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Use proper prop types and interfaces
- Follow React best practices

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design
- Test on multiple screen sizes

### File Organization
```
components/
  ├── ui/           # Reusable UI components
  ├── game/         # Game-specific components
  └── layout/       # Layout components

hooks/              # Custom React hooks
utils/              # Utility functions
types/              # TypeScript type definitions
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for utility functions
- Add component tests for React components
- Include integration tests for game mechanics
- Test edge cases and error conditions

### Test Structure
```javascript
describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Test implementation
  })
  
  it('should handle error cases', () => {
    // Error testing
  })
})
```

## 🎯 Project Areas

### 🎮 Game Mechanics
- Puzzle solving algorithms
- Shuffle generation
- Move validation
- Win condition detection

### 🎨 User Interface
- Component design
- Animation improvements
- Responsive layouts
- Accessibility features

### 🔧 Performance
- Loading optimization
- Image processing
- Memory management
- Bundle size reduction

### 🔐 Backend
- Authentication flows
- Leaderboard logic
- Data validation
- API optimization

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what was expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: Browser, device, screen size
4. **Screenshots**: If applicable, add screenshots
5. **Console Logs**: Include any error messages

### Bug Report Template
```markdown
**Bug Description**
Brief description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should have happened

**Screenshots**
Add screenshots if applicable

**Environment**
- Browser: [e.g., Chrome 91]
- Device: [e.g., iPhone 12, Desktop]
- Screen size: [e.g., 1920x1080]
```

## 💡 Feature Requests

We love new ideas! When suggesting features:

1. **Describe the Problem**: What user need does this solve?
2. **Proposed Solution**: How would you implement this?
3. **Alternatives**: Are there other ways to solve this?
4. **Additional Context**: Mockups, examples, or references

## 🎯 Priority Areas

Current focus areas where contributions are especially welcome:

### High Priority
- [ ] Mobile responsiveness improvements
- [ ] Accessibility enhancements (ARIA labels, keyboard navigation)
- [ ] Performance optimization for large images
- [ ] Unit test coverage increase

### Medium Priority
- [ ] Additional puzzle sizes (3x3, 5x5)
- [ ] Different puzzle types (hexagonal, triangular)
- [ ] Multiplayer functionality
- [ ] Tutorial/onboarding flow

### Low Priority
- [ ] Social sharing features
- [ ] Custom puzzle templates
- [ ] Achievement system
- [ ] Internationalization (i18n)

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Changes are tested on multiple devices
- [ ] Commit messages follow conventional format

### PR Template
When creating a PR, please:
- Use a clear, descriptive title
- Reference any related issues
- Describe what changes were made
- Include screenshots for UI changes
- Add testing instructions

## 🎉 Recognition

Contributors will be:
- Added to the Contributors section in README
- Mentioned in release notes for significant contributions
- Invited to join the core contributor team for ongoing involvement

## 📞 Getting Help

Need help getting started?

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Check existing issues or create a new one
- 📧 **Email**: Contact the maintainer directly
- 💭 **Ideas**: Share thoughts in GitHub Discussions

## 📜 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards other community members

## 🙏 Thank You!

Every contribution, no matter how small, helps make this project better. We appreciate:
- Code contributions
- Bug reports
- Feature suggestions
- Documentation improvements
- Spreading the word about the project

**Happy coding! 🎮✨**
# 🤝 Contributing to MindTrack

Thank you for your interest in contributing to MindTrack! This document provides guidelines for contributing to the project.

## 📋 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or identity.

### Expected Behavior
- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Supabase account
- OpenAI API key
- Familiarity with Next.js, TypeScript, and React

### Setup Development Environment

1. **Fork the Repository**
   ```powershell
   # Fork via GitHub UI, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mindtrack.git
   cd mindtrack
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and OpenAI credentials
   - See SETUP.md for detailed instructions

4. **Run Development Server**
   ```powershell
   npm run dev
   ```

5. **Create a Branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```

## 🎯 How to Contribute

### Reporting Bugs

**Before Submitting:**
- Check existing issues to avoid duplicates
- Test on the latest version
- Gather reproduction steps

**Bug Report Template:**
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node Version: [e.g., 18.17.0]
- Next.js Version: [from package.json]

**Screenshots:**
If applicable
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Problem:**
What problem does this solve?

**Proposed Solution:**
How should it work?

**Alternatives:**
Other approaches considered

**Additional Context:**
Mockups, examples, etc.
```

### Pull Requests

1. **Choose an Issue**
   - Look for issues labeled `good first issue` or `help wanted`
   - Comment on the issue to claim it
   - Wait for maintainer confirmation

2. **Write Code**
   - Follow the coding standards (see below)
   - Write tests if applicable
   - Update documentation

3. **Commit Changes**
   ```powershell
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **Push to Your Fork**
   ```powershell
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub and create PR
   - Fill in the PR template
   - Link related issues
   - Request review

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use type inference where possible

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Use Server Components where appropriate
- Keep components small and focused

### File Naming
- Components: `PascalCase.tsx` (e.g., `DashboardLayout.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `lowercase.tsx` or `page.tsx` (Next.js convention)

### Code Style
```typescript
// ✅ Good
interface UserProps {
  name: string
  email: string
}

export function UserProfile({ name, email }: UserProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-600">{email}</p>
    </div>
  )
}

// ❌ Bad
export function UserProfile(props: any) {
  return <div><h2>{props.name}</h2><p>{props.email}</p></div>
}
```

### Styling
- Use TailwindCSS utility classes
- Follow mobile-first approach
- Support dark mode with `dark:` prefix
- Keep consistent spacing and sizing

### Git Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug in component
docs: update README
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

Examples:
```powershell
git commit -m "feat: add voice journaling support"
git commit -m "fix: resolve theme switching bug"
git commit -m "docs: update API documentation"
```

## 🧪 Testing

### Manual Testing
- Test your changes thoroughly
- Check responsive design
- Test dark/light themes
- Verify across browsers

### Automated Testing (Future)
```powershell
# Run tests
npm test

# Run linting
npm run lint

# Type check
npm run type-check
```

## 📚 Documentation

### When to Update Docs
- Adding new features
- Changing existing behavior
- Updating setup process
- Modifying API endpoints

### Documentation Files
- **README.md** - Main documentation
- **SETUP.md** - Setup instructions
- **API.md** - API reference
- **DEPLOYMENT.md** - Deployment guide

## 🎨 Design Guidelines

### Colors
- Primary: Purple (#8B5CF6)
- Secondary: Pink (#EC4899)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font: Inter (from next/font/google)
- Headers: Bold, clear hierarchy
- Body: Regular, readable size (16px base)

### Components
- Consistent padding and margins
- Rounded corners (rounded-lg, rounded-xl)
- Shadows for depth (shadow-lg)
- Smooth transitions (transition-colors)

## 🔍 Code Review Process

### For Reviewers
- Be constructive and respectful
- Focus on code quality and functionality
- Test changes locally
- Provide specific feedback
- Approve when ready

### For Contributors
- Respond to feedback promptly
- Make requested changes
- Ask questions if unclear
- Keep discussions focused

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `feature` - New feature request
- `enhancement` - Improve existing feature
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Urgent issue
- `priority: low` - Nice to have

## 🎯 Priority Areas

### High Priority
1. Bug fixes
2. Security improvements
3. Performance optimizations
4. Accessibility enhancements

### Medium Priority
1. New features
2. UI improvements
3. Documentation updates
4. Code refactoring

### Low Priority
1. Nice-to-have features
2. Visual polish
3. Code style improvements

## 📞 Getting Help

### Questions?
- Check documentation first
- Search existing issues
- Ask in GitHub Discussions
- Tag maintainers in issues

### Stuck?
- Describe what you've tried
- Share error messages
- Provide context
- Be patient and respectful

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given credit in commits

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🌟 Thank You!

Your contributions help make MindTrack better for everyone. We appreciate your time and effort!

**Questions?** Open an issue or reach out to the maintainers.

Happy coding! 🚀

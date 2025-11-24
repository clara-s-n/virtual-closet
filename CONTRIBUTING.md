# Contributing to Virtual Closet

Thank you for your interest in contributing to Virtual Closet! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/virtual-closet.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with clear messages
7. Push to your fork
8. Create a Pull Request

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for AI service development)

### Running Locally

```bash
# Start all services
./start.sh

# Or manually
docker compose up -d
```

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### AI Service Development

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

## Code Style

### TypeScript/JavaScript
- Use ESM imports
- Use TypeScript strict mode
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

### Python
- Follow PEP 8 style guide
- Use type hints
- Add docstrings for functions

## Testing

Before submitting a PR:
1. Test your changes locally
2. Ensure all existing functionality still works
3. Add tests for new features (if applicable)

## Pull Request Guidelines

1. **Title**: Use clear, descriptive titles
   - ✅ "Add user profile editing feature"
   - ❌ "Updates"

2. **Description**: Include:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Screenshots (for UI changes)

3. **Size**: Keep PRs focused and reasonably sized
   - Aim for < 500 lines of changes when possible
   - Split large features into multiple PRs

4. **Testing**: Describe how you tested your changes

## Commit Messages

Use clear, descriptive commit messages:
- ✅ "Add garment filtering by color"
- ✅ "Fix authentication redirect loop"
- ❌ "Fixed bug"
- ❌ "WIP"

## Areas for Contribution

### High Priority
- AI model integration for virtual try-on
- Unit and integration tests
- Performance optimization
- Mobile responsiveness improvements

### Features
- User profile management
- Social features (sharing outfits)
- Advanced filtering and search
- Outfit recommendations
- Calendar integration for outfit planning

### Documentation
- API documentation improvements
- User guides
- Architecture diagrams
- Video tutorials

## Questions?

- Open an issue for bugs or feature requests
- Tag questions with `question` label
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Virtual Closet! 🎉

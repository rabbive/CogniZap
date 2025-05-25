# CogniZap 🧠⚡

**AI-Powered Learning Platform with Real-Time Intelligence**

CogniZap is a cutting-edge educational platform that leverages the Perplexity Sonar API to generate intelligent flashcards, quizzes, and learning materials from trending topics, current events, and real-time data. Built with SvelteKit 5, TypeScript, and a professional shadcn/ui design system.

![CogniZap Hero](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=CogniZap+Professional+UI)

## ✨ Key Features

### 🎯 Core Learning Features
- **Smart Flashcard Generation**: AI-powered flashcards from any topic
- **Interactive Quizzes**: Dynamic quiz generation with multiple difficulty levels
- **File Upload Support**: Extract content from PDF and PowerPoint files
- **Real-Time Content**: Generate materials from trending topics and current events

### 🚀 Advanced AI Capabilities
- **Trending Topics Integration**: Live trending topic analysis and content generation
- **Research Assistant**: Multi-perspective analysis with academic and industry insights
- **Live Data Learning**: Real-time market data, weather, sports, and economic insights
- **Global Events Tracker**: Worldwide events with educational context
- **Science Breakthrough Monitor**: Latest research findings and discoveries
- **Learning Competitions**: Competitive learning with real-time leaderboards
- **Viral Content Analysis**: Educational value assessment of trending content

### 🎨 Professional UI/UX
- **Modern Design System**: Built with shadcn/ui components and Tailwind CSS
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Professional Header**: Navigation, search, notifications, and user controls
- **Interactive Sidebar**: Quick stats, feature navigation, and recent activity
- **Glass Morphism Effects**: Modern visual aesthetics with backdrop blur
- **Smooth Animations**: Fade-in, slide-in, and hover effects

## 🛠️ Technology Stack

### Frontend
- **SvelteKit 5**: Modern web framework with runes mode
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Professional component library
- **Lucide Icons**: Beautiful icon system

### Backend & APIs
- **Perplexity Sonar API**: Real-time web search and content generation
- **SvelteKit Server Routes**: API endpoints and server-side logic
- **File Processing**: PDF and PowerPoint text extraction

### Development Tools
- **Vite**: Fast build tool and development server
- **ESLint & Prettier**: Code formatting and linting
- **PostCSS**: CSS processing and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Perplexity API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cognizap.git
   cd cognizap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Add your Perplexity API key to .env
   PERPLEXITY_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 API Documentation

### Core Generation API

#### POST `/api/generate`
Generate flashcards or quizzes from topics or uploaded content.

**Request Body:**
```typescript
{
  topic: string;
  difficulty: 'beginner' | 'medium' | 'advanced' | 'expert';
  cardCount: number;
  includeCurrentEvents: boolean;
  enableFactChecking: boolean;
  includeSources: boolean;
  targetAudience: 'general' | 'students' | 'professionals' | 'researchers';
  contentFreshness: 'any' | 'recent' | 'latest' | 'today';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: Flashcard[] | Quiz;
  sources?: Source[];
  factCheckResults?: FactCheckResult[];
  metadata: GenerationMetadata;
}
```

### Advanced Features APIs

#### GET `/api/trending`
Fetch real-time trending topics with educational relevance.

#### POST `/api/research-assistant`
Multi-perspective analysis with academic and industry insights.

#### POST `/api/live-data-learning`
Real-time data integration for stocks, weather, sports, and economics.

#### POST `/api/global-events`
Global event tracking with educational context.

#### POST `/api/science-tracker`
Latest scientific research and breakthrough monitoring.

#### POST `/api/learning-competitions`
Competitive learning features with leaderboards.

#### POST `/api/viral-analysis`
Viral content analysis for educational value.

## 🎨 UI Components

### Core Components
- **Button**: Multiple variants (default, outline, ghost, destructive)
- **Card**: Flexible container with header, content, and footer
- **Input**: Form input with labels, descriptions, and error states
- **Badge**: Status indicators with multiple variants
- **Loading**: Spinner component with different sizes and variants
- **Toast**: Notification system with auto-dismiss

### Layout Components
- **ProfessionalHeader**: Navigation, search, notifications, theme toggle
- **ProfessionalSidebar**: Quick stats, feature navigation, recent activity
- **TrendingTopics**: Real-time trending topics display
- **EnhancedFlashcard**: Flashcards with source citations and fact-checking

### Usage Example
```svelte
<script>
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
</script>

<Card class="p-6">
  <div class="space-y-4">
    <Badge variant="success">Active</Badge>
    <h2 class="text-xl font-semibold">Professional UI</h2>
    <p class="text-muted-foreground">Built with shadcn/ui components</p>
    <Button variant="default" size="lg">Get Started</Button>
  </div>
</Card>
```

## 🔧 Configuration

### Theme Configuration
The app supports automatic theme detection and manual switching:

```typescript
// Theme initialization in +layout.svelte
onMount(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
});
```

### Tailwind Configuration
Custom design system with CSS variables:

```javascript
// tailwind.config.js
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
        }
        // ... more colors
      }
    }
  }
}
```

## 🧪 Testing

### API Testing
```bash
# Test core generation API
node test-api.js

# Test enhanced features
node test-enhanced-features.js

# Test advanced features
node test-advanced-features.js

# Test file upload
node test-upload.js
```

### Component Testing
```bash
# Run type checking
npm run check

# Run linting
npm run lint

# Format code
npm run format
```

## 📈 Performance Features

### Optimization Techniques
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Responsive images with lazy loading
- **CSS Optimization**: Purged unused styles and minification
- **Bundle Analysis**: Optimized bundle sizes

### Caching Strategy
- **API Response Caching**: Intelligent caching for trending topics
- **Static Asset Caching**: Long-term caching for static resources
- **Service Worker**: Offline functionality (coming soon)

## 🔒 Security Features

### Data Protection
- **Input Sanitization**: XSS protection for user inputs
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Secure API key management

## 🌐 Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
```bash
PERPLEXITY_API_KEY=your_api_key_here
NODE_ENV=production
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Run tests: `npm run check && npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- Use TypeScript for type safety
- Follow Svelte 5 runes mode patterns
- Use shadcn/ui components for consistency
- Write descriptive commit messages
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Perplexity AI** for the powerful Sonar API
- **Svelte Team** for the amazing framework
- **shadcn** for the beautiful UI components
- **Tailwind CSS** for the utility-first approach
- **Lucide** for the icon system

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/yourusername/cognizap/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/cognizap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cognizap/discussions)
- **Email**: support@cognizap.com

---

**Built with ❤️ using SvelteKit, TypeScript, and the Perplexity Sonar API**

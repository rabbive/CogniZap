# CogniZap 🧠⚡

An AI-powered educational platform that generates flashcards and quizzes using real-time information from the Perplexity Sonar API. CogniZap transforms current events, trending topics, and live data into engaging learning experiences.

## 🌟 Features

### Core Features
- **Smart Content Generation**: Create flashcards and quizzes from any topic
- **File Upload Support**: Extract content from PDFs and PowerPoint presentations
- **Real-Time Integration**: Leverage Perplexity Sonar API for current information
- **Fact-Checking**: Verify content accuracy with source citations
- **Trending Topics**: Stay updated with current events and viral content

### 🚀 Advanced Features

#### 1. Smart Research Assistant
Multi-perspective analysis with real-time synthesis and debate points.

**Endpoint**: `/api/research-assistant`

**Features**:
- Academic, industry, news, and social perspectives
- Real-time synthesis of multiple viewpoints
- Debate point analysis with evidence
- Bias detection and credibility assessment
- Cross-source verification

**Example Usage**:
```javascript
const response = await fetch('/api/research-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Artificial Intelligence in Healthcare',
    perspectives: ['academic', 'industry', 'news'],
    timeframe: 'week',
    depth: 'detailed',
    includeDebate: true
  })
});
```

#### 2. Live Market & Data Learning
Real-time educational content from stocks, crypto, weather, sports, and economic data.

**Endpoint**: `/api/live-data-learning`

**Features**:
- Real-time market data integration
- Educational explanations of data trends
- Predictive analysis and forecasting
- Cross-market comparisons
- Auto-updating content with freshness tracking

**Example Usage**:
```javascript
const response = await fetch('/api/live-data-learning', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dataType: 'stocks',
    symbols: ['AAPL', 'GOOGL', 'TSLA'],
    analysisType: 'trends',
    contentType: 'flashcards',
    count: 5,
    difficulty: 'medium'
  })
});
```

#### 3. Skill Demand Intelligence
Job market analysis with real-time skill demand and salary insights.

**Endpoint**: `/api/skill-demand`

**Features**:
- Current job market analysis
- Emerging vs. declining skills tracking
- Salary impact assessments
- Learning path recommendations
- Industry-specific insights

**Example Usage**:
```javascript
const response = await fetch('/api/skill-demand', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    industry: 'Technology',
    role: 'Software Engineer',
    location: 'United States',
    timeframe: 'current',
    analysisType: 'skills',
    contentType: 'quiz',
    count: 5,
    difficulty: 'medium'
  })
});
```

#### 4. Global Event Learning
Comprehensive geopolitical analysis and current events education.

**Endpoint**: `/api/global-events`

**Features**:
- Real-time global event tracking
- Geopolitical context and analysis
- Historical parallels and lessons
- Multi-regional perspectives
- Impact assessment and predictions

**Example Usage**:
```javascript
const response = await fetch('/api/global-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'political',
    region: 'Global',
    timeframe: 'week',
    significance: 'major',
    contentType: 'flashcards',
    count: 5,
    difficulty: 'medium',
    includeAnalysis: true
  })
});
```

#### 5. Scientific Breakthrough Tracker
Latest research discoveries and scientific developments monitoring.

**Endpoint**: `/api/science-tracker`

**Features**:
- Real-time research publication tracking
- Peer review status and reproducibility assessment
- Future implications analysis
- Researcher and institution profiles
- Funding trends and research momentum

**Example Usage**:
```javascript
const response = await fetch('/api/science-tracker', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    field: 'ai',
    timeframe: 'week',
    significance: 'breakthrough',
    contentType: 'quiz',
    count: 5,
    difficulty: 'hard',
    includeImplications: true
  })
});
```

#### 6. Real-Time Learning Competitions
Competitive learning experiences with live updates and gamification.

**Endpoint**: `/api/learning-competitions`

**Features**:
- Multiple competition types (daily challenges, trending quizzes, breaking news)
- Real-time leaderboards and updates
- Adaptive difficulty and time pressure
- Reward systems and achievements
- Social learning elements

**Example Usage**:
```javascript
const response = await fetch('/api/learning-competitions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitionType: 'trending-quiz',
    topic: 'Technology',
    difficulty: 'mixed',
    duration: 15,
    participantCount: 10,
    realTimeData: true
  })
});
```

#### 7. Viral Content Analysis
Educational insights from trending social media content and viral phenomena.

**Endpoint**: `/api/viral-analysis`

**Features**:
- Cross-platform viral content tracking
- Educational value assessment
- Fact-checking and misinformation detection
- Virality factor analysis
- Trend prediction and pattern recognition

**Example Usage**:
```javascript
const response = await fetch('/api/viral-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'all',
    contentType: 'educational',
    timeframe: 'week',
    viralityThreshold: 'viral',
    analysisDepth: 'detailed',
    generateContent: 'both',
    count: 5,
    difficulty: 'medium'
  })
});
```

## 🛠️ Technology Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **AI Integration**: Perplexity Sonar API
- **File Processing**: PDF.js, PPTX Parser
- **State Management**: Svelte Stores
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
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

3. **Set up environment variables**
```bash
cp .env.example .env
```

Add your Perplexity API key to `.env`:
```env
PERPLEXITY_API_KEY=your_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 🧪 Testing

### Run Basic Tests
```bash
npm run test:api
```

### Run Enhanced Features Tests
```bash
npm run test:enhanced
```

### Run Advanced Features Tests
```bash
node test-advanced-features.js
```

### Test Individual APIs
```bash
# Test research assistant
curl -X POST http://localhost:5173/api/research-assistant \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI Ethics","perspectives":["academic","industry"],"timeframe":"week","depth":"detailed"}'

# Test live data learning
curl -X POST http://localhost:5173/api/live-data-learning \
  -H "Content-Type: application/json" \
  -d '{"dataType":"crypto","analysisType":"trends","contentType":"flashcards","count":3,"difficulty":"medium"}'
```

## 📚 API Documentation

### Core APIs

#### Generate Content
- **POST** `/api/generate`
- Generate flashcards or quizzes from topics or uploaded files
- Supports fact-checking, current events, and source citations

#### Trending Topics
- **POST** `/api/trending`
- Get current trending topics with real-time data
- Supports category filtering and relevance scoring

#### News-Based Learning
- **POST** `/api/news-learning`
- Generate educational content from current news events
- Includes source verification and bias detection

### Advanced APIs

All advanced APIs support:
- Real-time data integration
- Source citation and fact-checking
- Configurable difficulty levels
- Multiple content formats
- Comprehensive analytics

See individual API sections above for detailed usage examples.

## 🎯 Use Cases

### Educational Institutions
- **Current Events Curriculum**: Keep course content updated with real-time information
- **Research Projects**: Multi-perspective analysis for comprehensive understanding
- **Competitive Learning**: Gamified experiences to boost engagement

### Professional Development
- **Skill Assessment**: Track market demand for specific skills
- **Career Planning**: Data-driven insights for career decisions
- **Industry Updates**: Stay current with field developments

### Content Creators
- **Trend Analysis**: Understand viral content patterns
- **Educational Content**: Transform trending topics into learning materials
- **Fact-Checking**: Verify information accuracy with multiple sources

### Researchers & Analysts
- **Market Intelligence**: Real-time data analysis and insights
- **Global Events Monitoring**: Comprehensive geopolitical analysis
- **Scientific Tracking**: Latest research and breakthrough monitoring

## 🔧 Configuration

### Environment Variables
```env
# Required
PERPLEXITY_API_KEY=your_perplexity_api_key

# Optional
NODE_ENV=development
PUBLIC_APP_NAME=CogniZap
PUBLIC_APP_VERSION=2.0.0
```

### API Rate Limits
- Perplexity Sonar API: Respects rate limits with exponential backoff
- File uploads: Max 10MB per file
- Concurrent requests: Limited to prevent API abuse

### Content Freshness
- Trending topics: Updated every 5 minutes
- Market data: Updated every 5-30 minutes depending on data type
- News content: Updated every 15 minutes
- Scientific content: Updated daily

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Svelte 5 runes mode syntax
- Implement proper error handling
- Add comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Perplexity AI](https://perplexity.ai) for the Sonar API
- [SvelteKit](https://kit.svelte.dev) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [DaisyUI](https://daisyui.com) for UI components

## 📞 Support

- 📧 Email: support@cognizap.com
- 💬 Discord: [Join our community](https://discord.gg/cognizap)
- 📖 Documentation: [docs.cognizap.com](https://docs.cognizap.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/cognizap/issues)

---

**CogniZap** - Transforming real-time information into engaging learning experiences! 🧠⚡

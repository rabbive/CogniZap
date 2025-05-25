# ⚡ CogniZap - Enhanced AI Learning Platform

An advanced AI-powered web application that transforms any topic into interactive flashcards and quizzes using the Perplexity Sonar API. Built with cutting-edge features for real-time learning, fact-checking, and trending content discovery.

## 🚀 Enhanced Features

### 🔥 **Real-Time & Current Events**
- **📊 Trending Topics Discovery**: Live trending topics across technology, science, business, and more
- **📰 News-Based Learning**: Generate educational content from current events and breaking news
- **⏰ Content Freshness Control**: Choose between latest (this week), recent (this month), or any timeframe
- **🔄 Auto-Refresh**: Real-time updates for trending topics and content validation

### ✅ **Smart Fact-Checking & Verification**
- **🔍 Automated Fact-Checking**: Cross-reference information against multiple reliable sources
- **📊 Confidence Scoring**: AI-powered confidence ratings for all generated content (0-100%)
- **📚 Source Citations**: Automatic inclusion of reliable source links with reliability scores
- **⚠️ Dispute Detection**: Flag potentially disputed or uncertain information

### 🎯 **Adaptive & Personalized Learning**
- **👥 Target Audience Customization**: Content tailored for students, professionals, or researchers
- **📈 Trending Score Integration**: Prioritize content based on current relevance and popularity
- **🔗 Related Topics Discovery**: Explore interconnected subjects and trending connections
- **📱 Enhanced UI/UX**: Modern, responsive design with interactive trending topics sidebar

### 🌍 **Multi-Modal Content Sources**
- **📄 Enhanced File Processing**: Advanced PDF and PowerPoint text extraction
- **🌐 Web-Based Research**: Real-time web search integration for up-to-date information
- **📊 Live Data Integration**: Support for real-time data from various APIs (stocks, weather, sports)
- **🔄 Content Validation**: Automatic verification against current information

## 🛠️ Tech Stack

- **Framework**: SvelteKit 5 with TypeScript and Runes
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Enhanced Svelte stores with real-time updates
- **AI API**: Perplexity Sonar API (sonar-pro model)
- **File Processing**: PDF.js, pptx-parser with enhanced extraction
- **Deployment**: Vercel-ready with optimized builds

## 📦 Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd CogniZap
npm install
```

2. **Set up environment variables**:
Create a `.env` file in the root directory:
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

Get your API key from [Perplexity AI Docs](https://docs.perplexity.ai/docs/initial-setup)

3. **Start the development server**:
```bash
npm run dev
```

Visit `http://localhost:5173` to see the enhanced application.

## 🎯 Usage Guide

### 🔥 **Trending Topics**
1. Check the trending topics sidebar for current hot topics
2. Click any trending topic to auto-populate the main form
3. Topics are automatically updated every 5 minutes
4. Filter by category (technology, science, business, etc.)

### ⚡ **Enhanced Generation**
1. Enter a topic or select from trending topics
2. Toggle "Advanced Options" to access enhanced features:
   - **📈 Current Events**: Include trending information
   - **✅ Fact Checking**: Verify information accuracy
   - **📚 Source Citations**: Include reliable source links
   - **👥 Target Audience**: Customize for your level
   - **⏰ Content Freshness**: Control information recency

### 📰 **News-Based Learning**
1. Click "Use Today's News" in the sidebar
2. Select category and content type
3. Generate educational content from current events
4. View source articles and reliability scores

### 📊 **Enhanced Results**
- View confidence scores for each flashcard/quiz question
- Check fact-verification status (✅ verified, ⚠️ disputed, 🔄 pending)
- Access source citations with reliability ratings
- Explore related trending topics
- See content freshness timestamps

## 🏗️ Enhanced Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/                     # Base UI components
│   │   ├── TrendingTopics.svelte   # Real-time trending topics widget
│   │   ├── EnhancedFlashcard.svelte # Enhanced flashcard with sources
│   │   └── NewsLearning.svelte     # News-based content component
│   ├── stores/
│   │   ├── enhancedStore.ts        # Enhanced features state management
│   │   ├── flashcardStore.ts       # Flashcard state
│   │   └── quizStore.ts           # Quiz state
│   └── types.ts                   # Enhanced TypeScript interfaces
├── routes/
│   ├── api/
│   │   ├── generate/+server.ts    # Enhanced AI content generation
│   │   ├── trending/+server.ts    # Trending topics API
│   │   ├── news-learning/+server.ts # News-based learning API
│   │   └── upload/+server.ts      # Enhanced file upload
│   ├── results/+page.svelte       # Enhanced results display
│   ├── +layout.svelte             # App layout with enhanced features
│   └── +page.svelte               # Main form with trending sidebar
└── app.css                        # Enhanced global styles
```

## 🔧 Enhanced API Routes

### POST `/api/generate` (Enhanced)
Generates flashcards or quiz content with advanced features.

**Enhanced Request**:
```json
{
  "topic": "Machine Learning trends in 2024",
  "type": "flashcards",
  "count": 10,
  "difficulty": "medium",
  "includeCurrentEvents": true,
  "factCheck": true,
  "includeSources": true,
  "targetAudience": "professional",
  "contentFreshness": "latest"
}
```

**Enhanced Response**:
```json
{
  "success": true,
  "data": [...],
  "sources": [...],
  "trendingnessScore": 85,
  "factCheckResults": [...],
  "relatedTopics": [...],
  "lastUpdated": "2024-01-15T10:00:00Z",
  "contentFreshness": "latest"
}
```

### GET `/api/trending`
Fetches current trending topics with sources and relevance scores.

**Parameters**:
- `category`: technology, science, business, etc.
- `limit`: number of topics to return

### GET `/api/news-learning`
Generates educational content from current news.

**Parameters**:
- `category`: news category
- `type`: flashcards or quiz
- `count`: number of items
- `timeframe`: today, this_week, etc.

## 🧪 Testing Enhanced Features

Run the comprehensive test suite:

```bash
# Test all enhanced features
node test-enhanced-features.js

# Test basic functionality
node test-api.js

# Test file upload
node test-upload.js
```

## 🚀 Deployment

The project is configured for Vercel deployment with enhanced features:

1. **Deploy to Vercel**:
```bash
npm run build
```

2. **Set environment variables** in Vercel dashboard:
   - `PERPLEXITY_API_KEY`

3. **Deploy**: Push to your Git repository connected to Vercel

## 🎨 Enhanced Svelte 5 Features

- **Modern Runes Syntax**: `$state`, `$derived`, `$props()` for reactive programming
- **Enhanced Event Handling**: `onclick`, `onkeydown` instead of legacy `on:` syntax
- **TypeScript Integration**: Full type safety with enhanced interfaces
- **Real-time Stores**: Reactive state management with auto-persistence
- **Component Composition**: Reusable enhanced UI components

## 🔮 Advanced Features

### 📊 **Learning Analytics**
- Track topic popularity and learning progress
- Benchmark understanding against current expert consensus
- Personalized recommendations based on trending topics

### 🌐 **Multi-Source Integration**
- Cross-reference multiple reliable sources
- Real-time fact verification
- Source reliability scoring and ranking

### 🎯 **Smart Recommendations**
- AI-powered related topic suggestions
- Trending skill recommendations for career development
- Conference and event preparation materials

### 🔄 **Auto-Update System**
- Scheduled content freshness validation
- Automatic outdated content flagging
- Version tracking for evolving topics

## 🤝 Contributing

This enhanced version includes cutting-edge features for modern learning. Contributions welcome!

### 🚀 **Feature Roadmap**
- [ ] WebSocket real-time updates
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice-to-text input
- [ ] AR/VR learning modes
- [ ] Collaborative study sessions

## 📄 License

MIT License - see LICENSE file for details.

---

**🌟 Enhanced with Perplexity Sonar API for real-time, fact-checked, and trending educational content!**

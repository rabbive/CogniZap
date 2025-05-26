# CogniZap - AI-Powered Learning Platform

CogniZap is an intelligent learning platform that generates flashcards and quizzes from trending topics, current events, and real-time data using AI.

## Features

- 🧠 **AI-Powered Content Generation** - Create flashcards and quizzes using advanced AI
- 📈 **Real-Time Trending Topics** - Stay updated with current events and trending subjects
- 🔬 **Research Assistant** - Multi-perspective analysis with academic and industry insights
- 📊 **Live Data Learning** - Real-time market data, weather, sports, and economic insights
- 🌍 **Global Events Tracker** - Worldwide events with educational context
- 🔬 **Science Breakthrough Monitor** - Latest research findings and discoveries
- 🏆 **Learning Competitions** - Competitive learning with leaderboards

## Prerequisites

- Node.js 18+ and npm
- Perplexity API key (for AI-powered content generation)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CogniZap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the project root:
   ```env
   # Perplexity API Configuration
   PERPLEXITY_API_KEY=your_actual_api_key_here
   
   # Application Configuration
   PUBLIC_APP_NAME=CogniZap
   PUBLIC_APP_VERSION=1.0.0
   ```

   **Getting a Perplexity API Key:**
   - Visit [Perplexity AI API](https://docs.perplexity.ai)
   - Sign up for an account
   - Generate an API key from your dashboard
   - Replace `your_actual_api_key_here` with your actual key

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Demo Mode

If you don't have a Perplexity API key yet, the application will automatically fall back to demo content for testing purposes.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript checks
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Tech Stack

- **Frontend**: SvelteKit with Svelte 5
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI Integration**: Perplexity Sonar API
- **Icons**: Lucide Svelte
- **Deployment**: Vercel (configured)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── ...           # Feature-specific components
│   ├── stores/           # Svelte stores for state management
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── routes/
│   ├── api/              # API endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard and specialized tools
│   └── ...               # Other pages
└── app.html              # HTML template
```

## Key Features

### 1. Content Generation
- Upload PDFs or PowerPoint files for content extraction
- Generate flashcards or quiz questions
- Adjustable difficulty levels and content count
- Real-time fact-checking and source citations

### 2. Specialized Learning Tools
- **Trending Topics**: Real-time trending content generation
- **Research Assistant**: Multi-perspective analysis
- **Live Data Learning**: Real-time data integration
- **Global Events**: Worldwide events tracking
- **Science Tracker**: Latest research findings
- **Learning Competitions**: Gamified learning experiences

### 3. Authentication
- Simple email/password authentication
- Demo mode for testing
- Persistent user sessions

## API Endpoints

- `POST /api/generate` - Generate flashcards or quiz content
- `POST /api/upload` - Handle file uploads (PDF/PowerPoint)
- `GET /api/trending` - Fetch trending topics
- `GET /api/global-events` - Get global events data
- `GET /api/research-assistant` - Research analysis endpoint
- And more specialized endpoints for each tool

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the demo mode works without API keys
2. Verify your Perplexity API key is valid
3. Ensure all dependencies are installed correctly
4. Check the browser console for any error messages

For additional support, please open an issue in the repository.

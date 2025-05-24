# ⚡ CogniZap

An AI-powered web application that transforms any topic into interactive flashcards and quizzes using the Perplexity Sonar API. Built for hackathons with modern web technologies.

## 🚀 Features

- **AI-Powered Content Generation**: Uses Perplexity Sonar API for accurate, up-to-date educational content
- **Interactive Flashcards**: 3D flip animations with progress tracking
- **Dynamic Quizzes**: Multiple choice questions with explanations and scoring
- **Modern UI**: Beautiful, responsive design with DaisyUI and Tailwind CSS
- **Topic-Based Generation**: Create content from any topic description
- **File Upload Support**: PDF and PowerPoint processing (stretch goal)
- **Real-time Progress**: Track study progress and quiz performance

## 🛠️ Tech Stack

- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Svelte stores
- **AI API**: Perplexity Sonar API
- **File Processing**: PDF.js, pptx-parser
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone and install dependencies**:
```bash
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

Visit `http://localhost:5173` to see the application.

## 🎯 Usage

### Creating Flashcards
1. Enter a topic (e.g., "JavaScript async/await", "Photosynthesis")
2. Select "Flashcards" as content type
3. Choose difficulty level and number of cards
4. Click "Generate Flashcards"
5. Study with interactive flip cards

### Creating Quizzes
1. Enter your topic
2. Select "Quiz" as content type
3. Set difficulty and number of questions
4. Click "Generate Quiz"
5. Answer questions and view results

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Flashcard.svelte    # Interactive flashcard component
│   │   └── Quiz.svelte         # Quiz component with timer
│   ├── stores/
│   │   ├── flashcardStore.ts   # Flashcard state management
│   │   └── quizStore.ts        # Quiz state management
│   └── types.ts                # TypeScript interfaces
├── routes/
│   ├── api/
│   │   ├── generate/+server.ts # AI content generation
│   │   └── upload/+server.ts   # File upload handling
│   ├── results/+page.svelte    # Results display
│   ├── +layout.svelte          # App layout
│   └── +page.svelte            # Main input form
└── app.css                     # Global styles
```

## 🔧 API Routes

### POST `/api/generate`
Generates flashcards or quiz content using Perplexity AI.

**Request**:
```json
{
  "topic": "Machine Learning basics",
  "type": "flashcards",
  "count": 10,
  "difficulty": "medium"
}
```

### POST `/api/upload`
Processes uploaded PDF/PowerPoint files (stretch goal).

## 🚀 Deployment

The project is configured for Vercel deployment:

1. **Deploy to Vercel**:
```bash
npm run build
```

2. **Set environment variables** in Vercel dashboard:
   - `PERPLEXITY_API_KEY`

3. **Deploy**: Push to your Git repository connected to Vercel

## 🎨 Svelte 5 Features Used

- **Modern Syntax**: `$state`, `$derived`, `onclick` events
- **TypeScript**: Full type safety with interfaces
- **Stores**: Reactive state management
- **Components**: Reusable UI components

## 🔮 Stretch Goals

- [ ] PDF text extraction and processing
- [ ] PowerPoint content parsing
- [ ] User authentication and saved content
- [ ] Advanced analytics and progress tracking
- [ ] Export functionality (Anki, PDF)

## 🤝 Contributing

This is a hackathon project built with SvelteKit. Feel free to fork and improve!

## 📄 License

MIT License - see LICENSE file for details.

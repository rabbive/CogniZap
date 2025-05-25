import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { NewsBasedContent, Source, PerplexityRequest, Flashcard, Quiz } from '$lib/types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const category = url.searchParams.get('category') || 'technology';
    const contentType = url.searchParams.get('type') || 'flashcards';
    const count = parseInt(url.searchParams.get('count') || '5');
    const timeframe = url.searchParams.get('timeframe') || 'today';

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createNewsLearningPrompt(category, contentType, count, timeframe);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator specializing in current events. Create learning materials from recent news that are educational, accurate, and engaging. Always include reliable sources and ensure factual accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 4000
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(perplexityRequest)
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const perplexityResponse = await response.json();
    const content = perplexityResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    const newsData = JSON.parse(content.trim());
    
    const newsContent: NewsBasedContent[] = newsData.newsItems.map((item: any) => {
      const sources: Source[] = item.sources?.map((source: any) => ({
        url: source.url,
        title: source.title,
        publishedDate: new Date(source.publishedDate),
        reliability: source.reliability || 85,
        domain: new URL(source.url).hostname,
        snippet: source.snippet
      })) || [];

      let generatedContent: Flashcard[] | Quiz;

      if (contentType === 'flashcards') {
        generatedContent = item.flashcards.map((card: any, index: number) => ({
          id: `news-flashcard-${Date.now()}-${index}`,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty || 'medium',
          topic: item.headline,
          createdAt: new Date(),
          sources: card.sources || sources,
          lastUpdated: new Date(),
          trendingnessScore: 90,
          relatedCurrentTopics: item.relatedTopics || [],
          factCheckStatus: 'verified',
          confidenceScore: card.confidenceScore || 90
        }));
      } else {
        generatedContent = {
          id: `news-quiz-${Date.now()}`,
          title: item.quiz.title,
          description: item.quiz.description,
          questions: item.quiz.questions.map((q: any, index: number) => ({
            id: `news-question-${Date.now()}-${index}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            sources: q.sources || sources,
            factCheckStatus: 'verified',
            confidenceScore: q.confidenceScore || 90,
            relatedTopics: item.relatedTopics || []
          })),
          topic: item.headline,
          timeLimit: 20,
          createdAt: new Date(),
          sources,
          lastUpdated: new Date(),
          trendingnessScore: 90,
          isCurrentEvents: true,
          expertiseLevel: 'intermediate'
        };
      }

      return {
        id: `news-content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        headline: item.headline,
        summary: item.summary,
        category: category as any,
        publishedDate: new Date(item.publishedDate),
        sources,
        generatedContent
      };
    });

    return json({
      success: true,
      data: newsContent,
      category,
      contentType,
      timeframe,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('News learning API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate news-based learning content'
    }, { status: 500 });
  }
};

function createNewsLearningPrompt(category: string, contentType: string, count: number, timeframe: string): string {
  return `Find ${count} recent news stories from ${timeframe} in the ${category} category and create educational ${contentType} from them.

Focus on news that:
1. Has educational value
2. Is factually accurate and from reliable sources
3. Can be turned into meaningful learning content
4. Is appropriate for students and professionals

Return a JSON object with this exact structure:
{
  "newsItems": [
    {
      "headline": "News headline",
      "summary": "Brief summary of the news story",
      "publishedDate": "2024-01-15T10:00:00Z",
      "relatedTopics": ["topic1", "topic2"],
      "sources": [
        {
          "url": "https://example.com/news-article",
          "title": "Article title",
          "publishedDate": "2024-01-15T10:00:00Z",
          "reliability": 95,
          "snippet": "Brief excerpt from the article"
        }
      ],
      ${contentType === 'flashcards' ? `
      "flashcards": [
        {
          "question": "Educational question based on the news",
          "answer": "Comprehensive answer with context",
          "difficulty": "easy|medium|hard",
          "confidenceScore": 90,
          "sources": []
        }
      ]` : `
      "quiz": {
        "title": "Quiz title based on the news",
        "description": "What this quiz covers",
        "questions": [
          {
            "question": "Question about the news story",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Why this answer is correct",
            "confidenceScore": 90,
            "sources": []
          }
        ]
      }`}
    }
  ]
}

Requirements:
- All news must be from reliable, authoritative sources
- Include confidence scores for fact accuracy
- Educational content should help users understand the broader context
- Focus on learning outcomes, not just current events
- Ensure all information is factually accurate
- Include diverse perspectives when appropriate`;
} 
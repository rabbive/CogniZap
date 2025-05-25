import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { TrendingTopic, Source, PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const category = url.searchParams.get('category') || 'general';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createTrendingTopicsPrompt(category, limit);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a trend analysis expert. Analyze current trending topics and return them in valid JSON format with sources and relevance scores.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
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

    const trendingData = JSON.parse(content.trim());
    
    const trendingTopics: TrendingTopic[] = trendingData.topics.map((item: any) => ({
      topic: item.topic,
      score: item.score,
      category: item.category || category,
      relatedKeywords: item.relatedKeywords || [],
      lastUpdated: new Date(),
      sources: item.sources?.map((source: any) => ({
        url: source.url,
        title: source.title,
        publishedDate: new Date(source.publishedDate),
        reliability: source.reliability || 80,
        domain: new URL(source.url).hostname,
        snippet: source.snippet
      })) || []
    }));

    return json({
      success: true,
      data: trendingTopics,
      lastUpdated: new Date(),
      category
    });

  } catch (error) {
    console.error('Trending topics API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trending topics'
    }, { status: 500 });
  }
};

function createTrendingTopicsPrompt(category: string, limit: number): string {
  return `Find the top ${limit} trending topics in ${category} right now. Focus on topics that are:
1. Currently trending in news and social media
2. Educational or learning-relevant
3. Have reliable sources
4. Suitable for creating flashcards or quizzes

Return a JSON object with this exact structure:
{
  "topics": [
    {
      "topic": "Topic name",
      "score": 85,
      "category": "${category}",
      "relatedKeywords": ["keyword1", "keyword2", "keyword3"],
      "sources": [
        {
          "url": "https://example.com/article",
          "title": "Article title",
          "publishedDate": "2024-01-15T10:00:00Z",
          "reliability": 90,
          "snippet": "Brief excerpt from the article"
        }
      ]
    }
  ]
}

Requirements:
- Score should be 0-100 based on trending intensity
- Include at least 2 reliable sources per topic
- Focus on educational value
- Ensure all information is current and accurate
- Include diverse topics within the ${category} category`;
} 
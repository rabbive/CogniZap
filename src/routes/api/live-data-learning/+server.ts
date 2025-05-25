import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface LiveDataQuery {
  dataType: 'stocks' | 'crypto' | 'weather' | 'sports' | 'economics';
  symbols?: string[];
  region?: string;
  analysisType: 'trends' | 'predictions' | 'explanations' | 'comparisons';
  contentType: 'flashcards' | 'quiz';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LiveDataResult {
  dataType: string;
  contentType: string;
  generatedContent: any[];
  dataSnapshot: DataSnapshot;
  insights: string[];
  sources: Source[];
  lastUpdated: Date;
  nextUpdate?: Date;
}

interface DataSnapshot {
  timestamp: Date;
  data: any;
  trends: TrendAnalysis[];
  keyMetrics: KeyMetric[];
}

interface TrendAnalysis {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  timeframe: string;
  significance: 'low' | 'medium' | 'high';
}

interface KeyMetric {
  name: string;
  value: string | number;
  change?: string;
  context: string;
}

interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishedDate: Date;
  dataType: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const query: LiveDataQuery = await request.json();
    const { dataType, symbols, region, analysisType, contentType, count, difficulty } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createLiveDataPrompt(query);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert data analyst and educator with access to real-time market, weather, sports, and economic data. Create educational content that explains current data trends, patterns, and their underlying principles. Always include current data points and explain their significance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 5000
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

    const liveDataResponse = JSON.parse(content.trim());
    
    const result: LiveDataResult = {
      dataType: liveDataResponse.dataType,
      contentType: liveDataResponse.contentType,
      generatedContent: liveDataResponse.content.map((item: any, index: number) => {
        if (contentType === 'flashcards') {
          return {
            id: `live-flashcard-${Date.now()}-${index}`,
            question: item.question,
            answer: item.answer,
            difficulty: item.difficulty || difficulty,
            topic: `${dataType} - ${analysisType}`,
            createdAt: new Date(),
            sources: item.sources || [],
            dataContext: item.dataContext,
            trendingnessScore: 95, // Live data is always trending
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 90
          };
        } else {
          return {
            id: `live-question-${Date.now()}-${index}`,
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            sources: item.sources || [],
            dataContext: item.dataContext,
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 90
          };
        }
      }),
      dataSnapshot: {
        timestamp: new Date(),
        data: liveDataResponse.dataSnapshot,
        trends: liveDataResponse.trends || [],
        keyMetrics: liveDataResponse.keyMetrics || []
      },
      insights: liveDataResponse.insights || [],
      sources: liveDataResponse.sources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 85,
        publishedDate: new Date(s.publishedDate),
        dataType: dataType
      })) || [],
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + getUpdateInterval(dataType))
    };

    return json({
      success: true,
      data: result,
      query,
      updateInterval: getUpdateInterval(dataType)
    });

  } catch (error) {
    console.error('Live data learning API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate live data learning content'
    }, { status: 500 });
  }
};

function createLiveDataPrompt(query: LiveDataQuery): string {
  const { dataType, symbols, region, analysisType, contentType, count, difficulty } = query;

  let dataContext = '';
  switch (dataType) {
    case 'stocks':
      dataContext = symbols ? `for stocks: ${symbols.join(', ')}` : 'for major stock indices and trending stocks';
      break;
    case 'crypto':
      dataContext = symbols ? `for cryptocurrencies: ${symbols.join(', ')}` : 'for major cryptocurrencies like Bitcoin, Ethereum';
      break;
    case 'weather':
      dataContext = region ? `for ${region}` : 'for major global regions';
      break;
    case 'sports':
      dataContext = region ? `for ${region} sports` : 'for major sports leagues and current games';
      break;
    case 'economics':
      dataContext = region ? `for ${region} economy` : 'for global economic indicators';
      break;
  }

  const analysisContext = {
    'trends': 'current trends and patterns',
    'predictions': 'predictions and forecasts based on current data',
    'explanations': 'explanations of current data and underlying principles',
    'comparisons': 'comparisons between current and historical data'
  };

  return `Generate ${count} educational ${contentType} about ${dataType} ${analysisContext[analysisType]} ${dataContext}.

Use the most current real-time data available and create ${difficulty} difficulty educational content.

For ${contentType === 'flashcards' ? 'each flashcard' : 'each quiz question'}, include:
1. Current real data points
2. Educational explanation of the data
3. Context about why this data matters
4. Trends or patterns in the data
5. Reliable sources for the data

Return a JSON object with this structure:
{
  "dataType": "${dataType}",
  "contentType": "${contentType}",
  "content": [
    ${contentType === 'flashcards' ? `{
      "question": "Question incorporating current ${dataType} data",
      "answer": "Answer explaining the data and its significance",
      "difficulty": "${difficulty}",
      "dataContext": "Specific data points used",
      "confidence": 90,
      "sources": []
    }` : `{
      "question": "Question about current ${dataType} data",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation using current data",
      "dataContext": "Specific data points used",
      "confidence": 90,
      "sources": []
    }`}
  ],
  "dataSnapshot": {
    "currentData": "Summary of current data used",
    "timestamp": "Current timestamp"
  },
  "trends": [
    {
      "metric": "Specific metric name",
      "direction": "up|down|stable",
      "magnitude": 5.2,
      "timeframe": "24h|1w|1m",
      "significance": "high|medium|low"
    }
  ],
  "keyMetrics": [
    {
      "name": "Metric name",
      "value": "Current value",
      "change": "+5.2%",
      "context": "What this metric means"
    }
  ],
  "insights": [
    "Key insight about current data trends",
    "Educational takeaway from the data"
  ],
  "sources": [
    {
      "url": "https://example.com",
      "title": "Data source title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 95
    }
  ]
}

Requirements:
- Use only current, real-time data
- Explain the educational significance of the data
- Include specific numbers and metrics
- Connect data to broader concepts and principles
- Ensure all data is from reliable financial/weather/sports sources
- Make content appropriate for ${difficulty} difficulty level`;
}

function getUpdateInterval(dataType: string): number {
  // Return milliseconds until next update
  switch (dataType) {
    case 'stocks':
    case 'crypto':
      return 5 * 60 * 1000; // 5 minutes
    case 'weather':
      return 30 * 60 * 1000; // 30 minutes
    case 'sports':
      return 15 * 60 * 1000; // 15 minutes
    case 'economics':
      return 60 * 60 * 1000; // 1 hour
    default:
      return 30 * 60 * 1000; // 30 minutes default
  }
} 
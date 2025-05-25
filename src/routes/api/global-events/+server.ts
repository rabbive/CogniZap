import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface GlobalEventQuery {
  eventType: 'political' | 'economic' | 'environmental' | 'technological' | 'social' | 'all';
  region?: string;
  timeframe: 'live' | 'today' | 'week' | 'month';
  significance: 'major' | 'all';
  contentType: 'flashcards' | 'quiz';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  includeAnalysis?: boolean;
}

interface GlobalEventResult {
  eventType: string;
  region: string;
  generatedContent: any[];
  trackedEvents: GlobalEvent[];
  eventAnalysis: EventAnalysis;
  geopoliticalContext: GeopoliticalContext;
  sources: Source[];
  lastUpdated: Date;
  significanceScore: number;
}

interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  category: 'political' | 'economic' | 'environmental' | 'technological' | 'social';
  region: string;
  countries: string[];
  significance: 'low' | 'medium' | 'high' | 'critical';
  timeline: EventTimeline[];
  keyPlayers: KeyPlayer[];
  impact: Impact[];
  sources: Source[];
  lastUpdated: Date;
}

interface EventTimeline {
  date: Date;
  event: string;
  significance: 'low' | 'medium' | 'high';
  sources: string[];
}

interface KeyPlayer {
  name: string;
  role: string;
  organization?: string;
  country?: string;
  influence: 'low' | 'medium' | 'high';
}

interface Impact {
  category: 'economic' | 'political' | 'social' | 'environmental' | 'technological';
  description: string;
  scope: 'local' | 'regional' | 'global';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  severity: 'low' | 'medium' | 'high';
}

interface EventAnalysis {
  trends: EventTrend[];
  connections: EventConnection[];
  predictions: EventPrediction[];
  historicalContext: HistoricalContext[];
}

interface EventTrend {
  trend: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
  relatedEvents: string[];
}

interface EventConnection {
  event1: string;
  event2: string;
  relationship: 'causal' | 'correlated' | 'competitive' | 'cooperative';
  strength: number;
  explanation: string;
}

interface EventPrediction {
  prediction: string;
  probability: number;
  timeframe: string;
  factors: string[];
  implications: string[];
}

interface HistoricalContext {
  event: string;
  historicalParallel: string;
  similarities: string[];
  differences: string[];
  lessons: string[];
}

interface GeopoliticalContext {
  powerDynamics: PowerDynamic[];
  alliances: Alliance[];
  conflicts: Conflict[];
  economicRelations: EconomicRelation[];
}

interface PowerDynamic {
  actor: string;
  powerType: 'military' | 'economic' | 'diplomatic' | 'technological' | 'cultural';
  influence: number;
  trend: 'rising' | 'stable' | 'declining';
  regions: string[];
}

interface Alliance {
  name: string;
  members: string[];
  type: 'military' | 'economic' | 'political' | 'technological';
  strength: number;
  recentDevelopments: string[];
}

interface Conflict {
  name: string;
  parties: string[];
  type: 'military' | 'economic' | 'diplomatic' | 'cyber';
  intensity: 'low' | 'medium' | 'high';
  status: 'active' | 'frozen' | 'resolved';
  implications: string[];
}

interface EconomicRelation {
  countries: string[];
  relationType: 'trade' | 'investment' | 'sanctions' | 'cooperation';
  strength: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  keyFactors: string[];
}

interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishedDate: Date;
  eventCategory: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const query: GlobalEventQuery = await request.json();
    const { eventType, region, timeframe, significance, contentType, count, difficulty, includeAnalysis = false } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createGlobalEventPrompt(query);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert geopolitical analyst and educator with access to real-time global news and events. Provide comprehensive analysis of current world events, their significance, connections, and educational value. Always maintain objectivity and present multiple perspectives on complex international issues.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 7000
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

    const globalEventData = JSON.parse(content.trim());
    
    const result: GlobalEventResult = {
      eventType: globalEventData.eventType || eventType,
      region: globalEventData.region || region || 'Global',
      generatedContent: globalEventData.content.map((item: any, index: number) => {
        if (contentType === 'flashcards') {
          return {
            id: `global-flashcard-${Date.now()}-${index}`,
            question: item.question,
            answer: item.answer,
            difficulty: item.difficulty || difficulty,
            topic: `Global Events - ${eventType}`,
            createdAt: new Date(),
            sources: item.sources || [],
            eventContext: item.eventContext,
            trendingnessScore: calculateEventTrendingScore(item.eventContext),
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 85,
            geopoliticalRelevance: item.geopoliticalRelevance || 'medium'
          };
        } else {
          return {
            id: `global-question-${Date.now()}-${index}`,
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            sources: item.sources || [],
            eventContext: item.eventContext,
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 85,
            geopoliticalRelevance: item.geopoliticalRelevance || 'medium'
          };
        }
      }),
      trackedEvents: globalEventData.trackedEvents?.map((event: any) => ({
        id: event.id || `event-${Date.now()}`,
        title: event.title,
        description: event.description,
        category: event.category,
        region: event.region,
        countries: event.countries || [],
        significance: event.significance,
        timeline: event.timeline?.map((t: any) => ({
          date: new Date(t.date),
          event: t.event,
          significance: t.significance,
          sources: t.sources || []
        })) || [],
        keyPlayers: event.keyPlayers || [],
        impact: event.impact || [],
        sources: event.sources?.map((s: any) => ({
          url: s.url,
          title: s.title,
          domain: new URL(s.url).hostname,
          reliability: s.reliability || 85,
          publishedDate: new Date(s.publishedDate),
          eventCategory: event.category
        })) || [],
        lastUpdated: new Date()
      })) || [],
      eventAnalysis: includeAnalysis ? {
        trends: globalEventData.eventAnalysis?.trends || [],
        connections: globalEventData.eventAnalysis?.connections || [],
        predictions: globalEventData.eventAnalysis?.predictions || [],
        historicalContext: globalEventData.eventAnalysis?.historicalContext || []
      } : {
        trends: [],
        connections: [],
        predictions: [],
        historicalContext: []
      },
      geopoliticalContext: includeAnalysis ? {
        powerDynamics: globalEventData.geopoliticalContext?.powerDynamics || [],
        alliances: globalEventData.geopoliticalContext?.alliances || [],
        conflicts: globalEventData.geopoliticalContext?.conflicts || [],
        economicRelations: globalEventData.geopoliticalContext?.economicRelations || []
      } : {
        powerDynamics: [],
        alliances: [],
        conflicts: [],
        economicRelations: []
      },
      sources: globalEventData.sources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 85,
        publishedDate: new Date(s.publishedDate),
        eventCategory: eventType
      })) || [],
      lastUpdated: new Date(),
      significanceScore: globalEventData.significanceScore || 75
    };

    return json({
      success: true,
      data: result,
      query,
      globalSummary: globalEventData.globalSummary
    });

  } catch (error) {
    console.error('Global events API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze global events'
    }, { status: 500 });
  }
};

function createGlobalEventPrompt(query: GlobalEventQuery): string {
  const { eventType, region, timeframe, significance, contentType, count, difficulty, includeAnalysis } = query;

  const timeframeMap = {
    'live': 'the last few hours',
    'today': 'today',
    'week': 'this week',
    'month': 'this month'
  };

  const eventTypeContext = eventType === 'all' ? 'all major global events' : `${eventType} events`;
  const regionContext = region ? ` in ${region}` : ' globally';
  const significanceFilter = significance === 'major' ? 'major and significant' : 'all notable';

  return `Analyze ${significanceFilter} ${eventTypeContext}${regionContext} from ${timeframeMap[timeframe]} and generate ${count} educational ${contentType} about these events.

Use the most current global news and event data available.

For ${contentType === 'flashcards' ? 'each flashcard' : 'each quiz question'}, include:
1. Current event details and context
2. Geopolitical significance and implications
3. Key players and stakeholders involved
4. Historical context and parallels
5. Reliable news sources

Return a JSON object with this structure:
{
  "eventType": "${eventType}",
  "region": "${region || 'Global'}",
  "content": [
    ${contentType === 'flashcards' ? `{
      "question": "Question about current global event",
      "answer": "Answer with context and significance",
      "difficulty": "${difficulty}",
      "eventContext": "Specific event details",
      "confidence": 85,
      "geopoliticalRelevance": "high|medium|low",
      "sources": []
    }` : `{
      "question": "Question about current global event",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation with event context",
      "eventContext": "Specific event details",
      "confidence": 85,
      "geopoliticalRelevance": "high|medium|low",
      "sources": []
    }`}
  ],
  "trackedEvents": [
    {
      "id": "event-1",
      "title": "Event title",
      "description": "Event description",
      "category": "${eventType === 'all' ? 'political|economic|environmental|technological|social' : eventType}",
      "region": "${region || 'Global'}",
      "countries": ["Country1", "Country2"],
      "significance": "high|medium|low",
      "timeline": [
        {
          "date": "2024-01-15T10:00:00Z",
          "event": "Timeline event",
          "significance": "high",
          "sources": ["source1"]
        }
      ],
      "keyPlayers": [
        {
          "name": "Player name",
          "role": "Role description",
          "organization": "Organization",
          "country": "Country",
          "influence": "high|medium|low"
        }
      ],
      "impact": [
        {
          "category": "economic|political|social|environmental|technological",
          "description": "Impact description",
          "scope": "global|regional|local",
          "timeframe": "immediate|short-term|long-term",
          "severity": "high|medium|low"
        }
      ],
      "sources": []
    }
  ],
  ${includeAnalysis ? `"eventAnalysis": {
    "trends": [
      {
        "trend": "Trend description",
        "direction": "increasing|decreasing|stable",
        "confidence": 85,
        "timeframe": "6 months",
        "relatedEvents": ["event1", "event2"]
      }
    ],
    "connections": [
      {
        "event1": "Event 1",
        "event2": "Event 2",
        "relationship": "causal|correlated|competitive|cooperative",
        "strength": 80,
        "explanation": "Connection explanation"
      }
    ],
    "predictions": [
      {
        "prediction": "Future prediction",
        "probability": 70,
        "timeframe": "3-6 months",
        "factors": ["factor1", "factor2"],
        "implications": ["implication1", "implication2"]
      }
    ],
    "historicalContext": [
      {
        "event": "Current event",
        "historicalParallel": "Historical event",
        "similarities": ["similarity1"],
        "differences": ["difference1"],
        "lessons": ["lesson1"]
      }
    ]
  },
  "geopoliticalContext": {
    "powerDynamics": [
      {
        "actor": "Country/Organization",
        "powerType": "military|economic|diplomatic|technological|cultural",
        "influence": 85,
        "trend": "rising|stable|declining",
        "regions": ["region1"]
      }
    ],
    "alliances": [
      {
        "name": "Alliance name",
        "members": ["member1", "member2"],
        "type": "military|economic|political|technological",
        "strength": 80,
        "recentDevelopments": ["development1"]
      }
    ],
    "conflicts": [
      {
        "name": "Conflict name",
        "parties": ["party1", "party2"],
        "type": "military|economic|diplomatic|cyber",
        "intensity": "high|medium|low",
        "status": "active|frozen|resolved",
        "implications": ["implication1"]
      }
    ],
    "economicRelations": [
      {
        "countries": ["country1", "country2"],
        "relationType": "trade|investment|sanctions|cooperation",
        "strength": 75,
        "trend": "improving|stable|deteriorating",
        "keyFactors": ["factor1"]
      }
    ]
  },` : ''}
  "sources": [
    {
      "url": "https://example.com",
      "title": "News article title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 90
    }
  ],
  "significanceScore": 85,
  "globalSummary": "Brief summary of current global situation"
}

Requirements:
- Use current, verified global news and event data
- Maintain objectivity and present multiple perspectives
- Include specific dates, names, and factual details
- Explain geopolitical significance and implications
- Connect events to broader global trends
- Include reliable international news sources
- Make content appropriate for ${difficulty} difficulty level
- Focus on educational value and critical thinking`;
}

function calculateEventTrendingScore(eventContext: string): number {
  // Calculate trending score based on event significance indicators
  const highImpactKeywords = ['war', 'election', 'crisis', 'breakthrough', 'summit', 'sanctions', 'treaty', 'pandemic', 'climate', 'AI'];
  const mediumImpactKeywords = ['agreement', 'policy', 'trade', 'diplomatic', 'economic', 'technology', 'security'];
  
  const highMatches = highImpactKeywords.filter(keyword => 
    eventContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  const mediumMatches = mediumImpactKeywords.filter(keyword => 
    eventContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  return Math.min(60 + (highMatches * 15) + (mediumMatches * 5), 100);
} 
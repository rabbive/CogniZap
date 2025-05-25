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
  const { region, category, generateEducationalContent } = await request.json();
  
  try {

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createGlobalEventsPrompt(region, category, generateEducationalContent);

    const perplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a global events analyst. Provide current worldwide events with educational context and analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
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

    // Clean and parse JSON response
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in API response');
    }
    
    const eventsData = JSON.parse(jsonMatch[0]);

    return json({
      success: true,
      data: eventsData,
      region,
      category,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Global events API error:', error);
    
    // Return fallback data
    const fallbackData = {
      currentEvents: [
        {
          title: "Global Climate Summit 2024",
          description: "World leaders gather to discuss climate action and sustainable development goals.",
          category: "environment",
          date: new Date().toISOString(),
          impactLevel: 4,
          educationalContext: "This summit demonstrates international cooperation on environmental issues and the complexity of global governance.",
          relatedTopics: ["climate change", "international relations", "sustainable development"]
        },
        {
          title: "Technological Innovation in Healthcare",
          description: "New AI-powered diagnostic tools are revolutionizing medical care worldwide.",
          category: "technology",
          date: new Date().toISOString(),
          impactLevel: 5,
          educationalContext: "This showcases how technology can improve healthcare accessibility and accuracy.",
          relatedTopics: ["artificial intelligence", "healthcare", "innovation"]
        }
      ],
      learningOpportunities: [
        "Analyze the role of international organizations in addressing global challenges",
        "Study the impact of technology on traditional industries",
        "Examine how cultural differences affect global cooperation"
      ],
      keyInsights: [
        "Global events often require multilateral cooperation",
        "Technology continues to reshape traditional sectors",
        "Environmental concerns are driving policy changes worldwide"
      ],
      sources: [
        {
          url: "https://example.com",
          title: "Global Events Analysis",
          domain: "example.com",
          reliability: 85
        }
      ]
    };

    return json({
      success: true,
      data: fallbackData,
      region,
      category,
      fallback: true,
      error: error instanceof Error ? error.message : 'Using fallback data'
    });
  }
};

function createGlobalEventsPrompt(region: string, category: string, generateEducationalContent: boolean): string {
  return `Analyze current global events for the ${region} region in the ${category} category. 

Return a JSON object with this structure:
{
  "currentEvents": [
    {
      "title": "Event title",
      "description": "Brief description of the event",
      "category": "${category}",
      "date": "2024-01-15T10:00:00Z",
      "impactLevel": 4,
      "educationalContext": "Why this event is educationally significant",
      "relatedTopics": ["topic1", "topic2", "topic3"]
    }
  ],
  "learningOpportunities": [
    "Educational question or learning opportunity"
  ],
  "keyInsights": [
    "Important insight about current global trends"
  ],
  "sources": [
    {
      "url": "https://source.com",
      "title": "Source title",
      "domain": "source.com",
      "reliability": 90
    }
  ]
}

Focus on:
- Current events from the last 7 days
- Educational significance and learning value
- Global impact and implications
- Reliable news sources
- Events that help understand world affairs

${generateEducationalContent ? 'Include detailed educational context for each event.' : ''}`;
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
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  const { field, timeframe, generateEducationalContent } = await request.json();
  
  try {
    // Return fallback data for now
    const fallbackData = {
      recentDiscoveries: [
        {
          title: "Breakthrough in Quantum Computing",
          summary: "New quantum error correction method developed",
          field: field || "physics",
          publishedDate: new Date().toISOString(),
          significanceLevel: 8,
          keyFindings: ["90% error reduction", "Works with existing hardware"],
          implications: "Could enable practical quantum computers",
          institution: "MIT",
          relatedTopics: ["quantum computing", "physics"]
        }
      ],
      trendingAreas: [
        { name: "AI Drug Discovery", description: "ML in pharmaceuticals", activeResearch: 150 }
      ],
      educationalInsights: ["Science builds on foundational research"],
      futureImplications: ["Quantum computing will transform cryptography"],
      sources: [{ url: "https://example.com", title: "Science News", domain: "example.com", reliability: 92 }]
    };

    return json({
      success: true,
      data: fallbackData,
      field,
      timeframe
    });

  } catch (error) {
    return json({
      success: false,
      error: 'Failed to fetch science data'
    }, { status: 500 });
  }
};

function createScienceTrackerPrompt(field: string, timeframe: string, generateEducationalContent: boolean): string {
  const timeframeMap: Record<string, string> = {
    'day': 'last 24 hours',
    'week': 'last week',
    'month': 'last month',
    'year': 'last year'
  };

  return `Find the latest scientific discoveries and research findings in ${field === 'all' ? 'all scientific fields' : field} from the ${timeframeMap[timeframe] || 'last week'}.

Return a JSON object with this structure:
{
  "recentDiscoveries": [
    {
      "title": "Discovery title",
      "summary": "Brief summary of the discovery",
      "field": "${field}",
      "publishedDate": "2024-01-15T10:00:00Z",
      "significanceLevel": 8,
      "keyFindings": [
        "Key finding 1",
        "Key finding 2"
      ],
      "implications": "What this discovery means for the field and society",
      "institution": "Research institution name",
      "relatedTopics": ["topic1", "topic2", "topic3"]
    }
  ],
  "trendingAreas": [
    {
      "name": "Research area name",
      "description": "Description of the research area",
      "activeResearch": 150
    }
  ],
  "educationalInsights": [
    "Educational insight about scientific progress"
  ],
  "futureImplications": [
    "Future implication of current research"
  ],
  "sources": [
    {
      "url": "https://source.com",
      "title": "Source title",
      "domain": "source.com",
      "reliability": 95
    }
  ]
}

Focus on:
- Peer-reviewed research and reputable scientific journals
- Breakthrough discoveries with significant impact
- Research from leading institutions and universities
- Discoveries that advance human knowledge and capabilities
- Educational value and learning opportunities

Significance levels: 1-10 (10 = revolutionary breakthrough, 5 = significant advance, 1 = incremental progress)

${generateEducationalContent ? 'Include detailed educational context explaining why each discovery is important.' : ''}`;
} 
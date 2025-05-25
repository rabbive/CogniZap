import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface ResearchQuery {
  topic: string;
  perspectives: ('academic' | 'industry' | 'news' | 'social')[];
  timeframe: 'live' | 'today' | 'week' | 'month';
  depth: 'surface' | 'detailed' | 'comprehensive';
  includeDebate?: boolean;
}

interface ResearchResult {
  topic: string;
  perspectives: PerspectiveAnalysis[];
  synthesis: string;
  keyDebatePoints?: DebatePoint[];
  sources: Source[];
  confidence: number;
  lastUpdated: Date;
}

interface PerspectiveAnalysis {
  perspective: string;
  summary: string;
  keyPoints: string[];
  sources: Source[];
  bias?: string;
  credibility: number;
}

interface DebatePoint {
  position: 'pro' | 'con' | 'neutral';
  argument: string;
  evidence: string[];
  strength: number;
  sources: Source[];
}

interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishedDate: Date;
  perspective: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const query: ResearchQuery = await request.json();
    const { topic, perspectives, timeframe, depth, includeDebate = false } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createResearchPrompt(topic, perspectives, timeframe, depth, includeDebate);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert research assistant with access to real-time information. Provide comprehensive, multi-perspective analysis with proper source attribution. Always maintain objectivity and highlight different viewpoints on controversial topics.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 6000
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

    const researchData = JSON.parse(content.trim());
    
    const result: ResearchResult = {
      topic: researchData.topic,
      perspectives: researchData.perspectives.map((p: any) => ({
        perspective: p.perspective,
        summary: p.summary,
        keyPoints: p.keyPoints || [],
        sources: p.sources?.map((s: any) => ({
          url: s.url,
          title: s.title,
          domain: new URL(s.url).hostname,
          reliability: s.reliability || 80,
          publishedDate: new Date(s.publishedDate),
          perspective: p.perspective
        })) || [],
        bias: p.bias,
        credibility: p.credibility || 80
      })),
      synthesis: researchData.synthesis,
      keyDebatePoints: includeDebate ? researchData.debatePoints?.map((d: any) => ({
        position: d.position,
        argument: d.argument,
        evidence: d.evidence || [],
        strength: d.strength || 70,
        sources: d.sources?.map((s: any) => ({
          url: s.url,
          title: s.title,
          domain: new URL(s.url).hostname,
          reliability: s.reliability || 80,
          publishedDate: new Date(s.publishedDate),
          perspective: 'debate'
        })) || []
      })) : undefined,
      sources: researchData.allSources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 80,
        publishedDate: new Date(s.publishedDate),
        perspective: s.perspective || 'general'
      })) || [],
      confidence: researchData.confidence || 85,
      lastUpdated: new Date()
    };

    return json({
      success: true,
      data: result,
      query,
      processingTime: Date.now()
    });

  } catch (error) {
    console.error('Research assistant API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to conduct research'
    }, { status: 500 });
  }
};

function createResearchPrompt(
  topic: string, 
  perspectives: string[], 
  timeframe: 'live' | 'today' | 'week' | 'month', 
  depth: 'surface' | 'detailed' | 'comprehensive',
  includeDebate: boolean
): string {
  const timeframeMap: Record<'live' | 'today' | 'week' | 'month', string> = {
    'live': 'the last few hours',
    'today': 'today',
    'week': 'this week',
    'month': 'this month'
  };

  const depthMap: Record<'surface' | 'detailed' | 'comprehensive', string> = {
    'surface': 'a high-level overview',
    'detailed': 'detailed analysis',
    'comprehensive': 'comprehensive, in-depth research'
  };

  let prompt = `Conduct ${depthMap[depth]} on "${topic}" from ${timeframe === 'live' ? 'the most recent information available' : timeframeMap[timeframe]}.

Analyze this topic from the following perspectives: ${perspectives.join(', ')}.

For each perspective, provide:
1. A clear summary of the viewpoint
2. Key supporting points
3. Potential biases or limitations
4. Credibility assessment (0-100)
5. Recent sources supporting this perspective

Then provide a synthesis that:
- Integrates all perspectives objectively
- Highlights areas of agreement and disagreement
- Identifies knowledge gaps or uncertainties
- Suggests areas for further research`;

  if (includeDebate) {
    prompt += `

Additionally, identify key debate points with:
- Pro arguments with evidence
- Con arguments with evidence
- Neutral/nuanced positions
- Strength assessment for each argument (0-100)`;
  }

  prompt += `

Return a JSON object with this structure:
{
  "topic": "${topic}",
  "perspectives": [
    {
      "perspective": "academic|industry|news|social",
      "summary": "Clear summary of this perspective",
      "keyPoints": ["point 1", "point 2", "point 3"],
      "bias": "Potential bias description",
      "credibility": 85,
      "sources": [
        {
          "url": "https://example.com",
          "title": "Source title",
          "publishedDate": "2024-01-15T10:00:00Z",
          "reliability": 90
        }
      ]
    }
  ],
  "synthesis": "Comprehensive synthesis integrating all perspectives",
  ${includeDebate ? `"debatePoints": [
    {
      "position": "pro|con|neutral",
      "argument": "Main argument",
      "evidence": ["evidence 1", "evidence 2"],
      "strength": 80,
      "sources": []
    }
  ],` : ''}
  "allSources": [],
  "confidence": 85
}

Requirements:
- Use only recent, reliable sources from ${timeframeMap[timeframe]}
- Maintain objectivity and present multiple viewpoints
- Include source reliability scores
- Highlight any conflicting information
- Focus on factual, verifiable information`;

  return prompt;
} 
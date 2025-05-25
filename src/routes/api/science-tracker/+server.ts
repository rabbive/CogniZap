import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface ScienceTrackerQuery {
  field: 'all' | 'medicine' | 'physics' | 'chemistry' | 'biology' | 'technology' | 'space' | 'climate' | 'ai';
  timeframe: 'live' | 'today' | 'week' | 'month';
  significance: 'breakthrough' | 'major' | 'all';
  contentType: 'flashcards' | 'quiz';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  includeImplications?: boolean;
}

interface ScienceTrackerResult {
  field: string;
  generatedContent: any[];
  discoveries: ScientificDiscovery[];
  researchTrends: ResearchTrend[];
  futureImplications: FutureImplication[];
  sources: Source[];
  lastUpdated: Date;
  innovationScore: number;
}

interface ScientificDiscovery {
  id: string;
  title: string;
  description: string;
  field: string;
  subfield?: string;
  significance: 'low' | 'medium' | 'high' | 'breakthrough';
  researchers: Researcher[];
  institutions: Institution[];
  publicationDate: Date;
  journal?: string;
  methodology: string;
  keyFindings: string[];
  limitations: string[];
  applications: Application[];
  sources: Source[];
  peerReviewStatus: 'preprint' | 'peer-reviewed' | 'published';
  reproducibility: 'unknown' | 'low' | 'medium' | 'high';
}

interface Researcher {
  name: string;
  affiliation: string;
  role: 'lead' | 'co-author' | 'contributor';
  expertise: string[];
}

interface Institution {
  name: string;
  country: string;
  type: 'university' | 'research-institute' | 'company' | 'government';
  reputation: number;
}

interface Application {
  area: string;
  description: string;
  timeframe: 'immediate' | 'short-term' | 'long-term';
  impact: 'low' | 'medium' | 'high' | 'revolutionary';
  commercialPotential: number;
}

interface ResearchTrend {
  trend: string;
  field: string;
  direction: 'emerging' | 'growing' | 'stable' | 'declining';
  momentum: number;
  keyDrivers: string[];
  relatedDiscoveries: string[];
  fundingTrends: FundingTrend;
  timeframe: string;
}

interface FundingTrend {
  totalFunding: number;
  fundingChange: number;
  majorFunders: string[];
  fundingFocus: string[];
}

interface FutureImplication {
  discovery: string;
  implication: string;
  category: 'medical' | 'technological' | 'environmental' | 'social' | 'economic';
  probability: number;
  timeframe: string;
  prerequisites: string[];
  potentialRisks: string[];
  societalImpact: 'low' | 'medium' | 'high' | 'transformative';
}

interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishedDate: Date;
  sourceType: 'journal' | 'news' | 'preprint' | 'conference' | 'patent';
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const query: ScienceTrackerQuery = await request.json();
    const { field, timeframe, significance, contentType, count, difficulty, includeImplications = false } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createScienceTrackerPrompt(query);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert scientific researcher and educator with access to the latest scientific publications, research findings, and breakthrough discoveries. Provide accurate, up-to-date information about scientific developments, their methodology, significance, and potential implications. Always cite reliable scientific sources and maintain scientific rigor.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
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

    const scienceData = JSON.parse(content.trim());
    
    const result: ScienceTrackerResult = {
      field: scienceData.field || field,
      generatedContent: scienceData.content.map((item: any, index: number) => {
        if (contentType === 'flashcards') {
          return {
            id: `science-flashcard-${Date.now()}-${index}`,
            question: item.question,
            answer: item.answer,
            difficulty: item.difficulty || difficulty,
            topic: `Scientific Discovery - ${field}`,
            createdAt: new Date(),
            sources: item.sources || [],
            scientificContext: item.scientificContext,
            trendingnessScore: calculateScienceTrendingScore(item.scientificContext),
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 90,
            researchQuality: item.researchQuality || 'high'
          };
        } else {
          return {
            id: `science-question-${Date.now()}-${index}`,
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            sources: item.sources || [],
            scientificContext: item.scientificContext,
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 90,
            researchQuality: item.researchQuality || 'high'
          };
        }
      }),
      discoveries: scienceData.discoveries?.map((discovery: any) => ({
        id: discovery.id || `discovery-${Date.now()}`,
        title: discovery.title,
        description: discovery.description,
        field: discovery.field,
        subfield: discovery.subfield,
        significance: discovery.significance,
        researchers: discovery.researchers || [],
        institutions: discovery.institutions || [],
        publicationDate: new Date(discovery.publicationDate),
        journal: discovery.journal,
        methodology: discovery.methodology,
        keyFindings: discovery.keyFindings || [],
        limitations: discovery.limitations || [],
        applications: discovery.applications || [],
        sources: discovery.sources?.map((s: any) => ({
          url: s.url,
          title: s.title,
          domain: new URL(s.url).hostname,
          reliability: s.reliability || 90,
          publishedDate: new Date(s.publishedDate),
          sourceType: s.sourceType || 'journal'
        })) || [],
        peerReviewStatus: discovery.peerReviewStatus || 'unknown',
        reproducibility: discovery.reproducibility || 'unknown'
      })) || [],
      researchTrends: scienceData.researchTrends || [],
      futureImplications: includeImplications ? scienceData.futureImplications || [] : [],
      sources: scienceData.sources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 90,
        publishedDate: new Date(s.publishedDate),
        sourceType: s.sourceType || 'journal'
      })) || [],
      lastUpdated: new Date(),
      innovationScore: scienceData.innovationScore || 80
    };

    return json({
      success: true,
      data: result,
      query,
      researchSummary: scienceData.researchSummary
    });

  } catch (error) {
    console.error('Science tracker API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track scientific developments'
    }, { status: 500 });
  }
};

function createScienceTrackerPrompt(query: ScienceTrackerQuery): string {
  const { field, timeframe, significance, contentType, count, difficulty, includeImplications } = query;

  const timeframeMap = {
    'live': 'the last few hours',
    'today': 'today',
    'week': 'this week',
    'month': 'this month'
  };

  const fieldContext = field === 'all' ? 'all scientific fields' : `${field} research`;
  const significanceFilter = {
    'breakthrough': 'breakthrough discoveries and major breakthroughs',
    'major': 'major discoveries and significant findings',
    'all': 'all notable scientific developments'
  };

  return `Track and analyze ${significanceFilter[significance]} in ${fieldContext} from ${timeframeMap[timeframe]} and generate ${count} educational ${contentType} about these scientific developments.

Use the most current scientific publications, research findings, and breakthrough discoveries available.

For ${contentType === 'flashcards' ? 'each flashcard' : 'each quiz question'}, include:
1. Scientific discovery details and methodology
2. Research significance and implications
3. Key researchers and institutions involved
4. Peer review status and reproducibility
5. Reliable scientific sources

Return a JSON object with this structure:
{
  "field": "${field}",
  "content": [
    ${contentType === 'flashcards' ? `{
      "question": "Question about scientific discovery or research",
      "answer": "Answer with scientific details and significance",
      "difficulty": "${difficulty}",
      "scientificContext": "Specific research context and methodology",
      "confidence": 90,
      "researchQuality": "high|medium|low",
      "sources": []
    }` : `{
      "question": "Question about scientific discovery or research",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation with scientific context",
      "scientificContext": "Specific research context and methodology",
      "confidence": 90,
      "researchQuality": "high|medium|low",
      "sources": []
    }`}
  ],
  "discoveries": [
    {
      "id": "discovery-1",
      "title": "Discovery title",
      "description": "Detailed description of the discovery",
      "field": "${field === 'all' ? 'medicine|physics|chemistry|biology|technology|space|climate|ai' : field}",
      "subfield": "Specific subfield",
      "significance": "breakthrough|high|medium|low",
      "researchers": [
        {
          "name": "Researcher name",
          "affiliation": "Institution",
          "role": "lead|co-author|contributor",
          "expertise": ["expertise1", "expertise2"]
        }
      ],
      "institutions": [
        {
          "name": "Institution name",
          "country": "Country",
          "type": "university|research-institute|company|government",
          "reputation": 95
        }
      ],
      "publicationDate": "2024-01-15T10:00:00Z",
      "journal": "Journal name",
      "methodology": "Research methodology description",
      "keyFindings": ["finding1", "finding2"],
      "limitations": ["limitation1", "limitation2"],
      "applications": [
        {
          "area": "Application area",
          "description": "Application description",
          "timeframe": "immediate|short-term|long-term",
          "impact": "revolutionary|high|medium|low",
          "commercialPotential": 85
        }
      ],
      "sources": [],
      "peerReviewStatus": "peer-reviewed|preprint|published",
      "reproducibility": "high|medium|low|unknown"
    }
  ],
  "researchTrends": [
    {
      "trend": "Trend description",
      "field": "${field}",
      "direction": "emerging|growing|stable|declining",
      "momentum": 85,
      "keyDrivers": ["driver1", "driver2"],
      "relatedDiscoveries": ["discovery1", "discovery2"],
      "fundingTrends": {
        "totalFunding": 1000000000,
        "fundingChange": 25.5,
        "majorFunders": ["funder1", "funder2"],
        "fundingFocus": ["focus1", "focus2"]
      },
      "timeframe": "6-12 months"
    }
  ],
  ${includeImplications ? `"futureImplications": [
    {
      "discovery": "Discovery name",
      "implication": "Future implication",
      "category": "medical|technological|environmental|social|economic",
      "probability": 75,
      "timeframe": "5-10 years",
      "prerequisites": ["prerequisite1"],
      "potentialRisks": ["risk1"],
      "societalImpact": "transformative|high|medium|low"
    }
  ],` : ''}
  "sources": [
    {
      "url": "https://example.com",
      "title": "Scientific publication title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 95,
      "sourceType": "journal|news|preprint|conference|patent"
    }
  ],
  "innovationScore": 85,
  "researchSummary": "Brief summary of current research landscape"
}

Requirements:
- Use current, peer-reviewed scientific publications and reliable research sources
- Include specific methodology and research details
- Explain scientific significance and potential applications
- Maintain scientific accuracy and rigor
- Include researcher and institutional information
- Assess peer review status and reproducibility
- Include reliable scientific journals and publications
- Make content appropriate for ${difficulty} difficulty level
- Focus on educational value and scientific literacy
- Highlight both potential benefits and limitations of research`;
}

function calculateScienceTrendingScore(scientificContext: string): number {
  // Calculate trending score based on scientific significance indicators
  const breakthroughKeywords = ['breakthrough', 'first', 'novel', 'revolutionary', 'unprecedented', 'cure', 'quantum', 'AI', 'CRISPR', 'fusion'];
  const highImpactKeywords = ['clinical trial', 'peer-reviewed', 'Nature', 'Science', 'Cell', 'published', 'discovery', 'innovation'];
  const emergingKeywords = ['machine learning', 'gene therapy', 'immunotherapy', 'nanotechnology', 'bioengineering', 'renewable'];
  
  const breakthroughMatches = breakthroughKeywords.filter(keyword => 
    scientificContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  const highImpactMatches = highImpactKeywords.filter(keyword => 
    scientificContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  const emergingMatches = emergingKeywords.filter(keyword => 
    scientificContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  return Math.min(60 + (breakthroughMatches * 20) + (highImpactMatches * 10) + (emergingMatches * 5), 100);
} 
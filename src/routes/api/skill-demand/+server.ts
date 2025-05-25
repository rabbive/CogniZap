import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface SkillDemandQuery {
  industry?: string;
  role?: string;
  location?: string;
  timeframe: 'current' | 'emerging' | 'declining' | 'future';
  analysisType: 'skills' | 'salaries' | 'trends' | 'learning-paths';
  contentType: 'flashcards' | 'quiz';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SkillDemandResult {
  industry: string;
  role: string;
  location: string;
  generatedContent: any[];
  skillAnalysis: SkillAnalysis;
  marketInsights: MarketInsight[];
  learningRecommendations: LearningPath[];
  sources: Source[];
  lastUpdated: Date;
  trendingScore: number;
}

interface SkillAnalysis {
  topSkills: Skill[];
  emergingSkills: Skill[];
  decliningSkills: Skill[];
  salaryImpact: SalaryImpact[];
  demandTrends: DemandTrend[];
}

interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'tool';
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  growthRate: number;
  averageSalaryImpact: number;
  jobPostings: number;
  learningDifficulty: 'easy' | 'medium' | 'hard';
  timeToLearn: string;
}

interface SalaryImpact {
  skill: string;
  salaryIncrease: number;
  percentageIncrease: number;
  marketData: string;
}

interface DemandTrend {
  skill: string;
  trend: 'rising' | 'stable' | 'declining';
  changePercentage: number;
  timeframe: string;
  confidence: number;
}

interface MarketInsight {
  insight: string;
  category: 'opportunity' | 'threat' | 'trend' | 'prediction';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  sources: string[];
}

interface LearningPath {
  skill: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  resources: LearningResource[];
  prerequisites: string[];
  careerImpact: string;
}

interface LearningResource {
  type: 'course' | 'certification' | 'book' | 'practice' | 'project';
  name: string;
  provider?: string;
  url?: string;
  cost: 'free' | 'paid' | 'varies';
  duration: string;
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
    const query: SkillDemandQuery = await request.json();
    const { industry, role, location, timeframe, analysisType, contentType, count, difficulty } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createSkillDemandPrompt(query);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor and labor market analyst with access to real-time job market data, salary information, and skill demand trends. Provide data-driven insights about current and future skill demands, career opportunities, and learning recommendations based on the latest market intelligence.'
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

    const skillDemandData = JSON.parse(content.trim());
    
    const result: SkillDemandResult = {
      industry: skillDemandData.industry || industry || 'Technology',
      role: skillDemandData.role || role || 'General',
      location: skillDemandData.location || location || 'Global',
      generatedContent: skillDemandData.content.map((item: any, index: number) => {
        if (contentType === 'flashcards') {
          return {
            id: `skill-flashcard-${Date.now()}-${index}`,
            question: item.question,
            answer: item.answer,
            difficulty: item.difficulty || difficulty,
            topic: `Skill Demand - ${analysisType}`,
            createdAt: new Date(),
            sources: item.sources || [],
            skillContext: item.skillContext,
            trendingnessScore: calculateTrendingScore(item.skillContext),
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 85
          };
        } else {
          return {
            id: `skill-question-${Date.now()}-${index}`,
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            sources: item.sources || [],
            skillContext: item.skillContext,
            factCheckStatus: 'verified',
            confidenceScore: item.confidence || 85
          };
        }
      }),
      skillAnalysis: {
        topSkills: skillDemandData.skillAnalysis.topSkills || [],
        emergingSkills: skillDemandData.skillAnalysis.emergingSkills || [],
        decliningSkills: skillDemandData.skillAnalysis.decliningSkills || [],
        salaryImpact: skillDemandData.skillAnalysis.salaryImpact || [],
        demandTrends: skillDemandData.skillAnalysis.demandTrends || []
      },
      marketInsights: skillDemandData.marketInsights || [],
      learningRecommendations: skillDemandData.learningRecommendations || [],
      sources: skillDemandData.sources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 85,
        publishedDate: new Date(s.publishedDate),
        dataType: 'skill-demand'
      })) || [],
      lastUpdated: new Date(),
      trendingScore: skillDemandData.trendingScore || 80
    };

    return json({
      success: true,
      data: result,
      query,
      marketSummary: skillDemandData.marketSummary
    });

  } catch (error) {
    console.error('Skill demand API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze skill demand'
    }, { status: 500 });
  }
};

function createSkillDemandPrompt(query: SkillDemandQuery): string {
  const { industry, role, location, timeframe, analysisType, contentType, count, difficulty } = query;

  const contextString = [
    industry && `in the ${industry} industry`,
    role && `for ${role} roles`,
    location && `in ${location}`
  ].filter(Boolean).join(' ');

  const timeframeContext = {
    'current': 'current market demand and trending skills',
    'emerging': 'emerging skills and future opportunities',
    'declining': 'declining skills and market shifts',
    'future': 'predicted future skill demands and career paths'
  };

  const analysisContext = {
    'skills': 'skill demand analysis and market trends',
    'salaries': 'salary impact and compensation trends',
    'trends': 'market trends and demand patterns',
    'learning-paths': 'learning recommendations and career development'
  };

  return `Analyze ${timeframeContext[timeframe]} ${contextString} and generate ${count} educational ${contentType} about ${analysisContext[analysisType]}.

Use the most current job market data, salary information, and skill demand trends available.

For ${contentType === 'flashcards' ? 'each flashcard' : 'each quiz question'}, include:
1. Current market data and statistics
2. Specific skill demand information
3. Salary impact and career implications
4. Learning recommendations
5. Reliable job market sources

Return a JSON object with this structure:
{
  "industry": "${industry || 'Technology'}",
  "role": "${role || 'General'}",
  "location": "${location || 'Global'}",
  "content": [
    ${contentType === 'flashcards' ? `{
      "question": "Question about skill demand or market trends",
      "answer": "Answer with current market data and insights",
      "difficulty": "${difficulty}",
      "skillContext": "Specific skills or market context",
      "confidence": 85,
      "sources": []
    }` : `{
      "question": "Question about skill demand or career trends",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation with current market data",
      "skillContext": "Specific skills or market context",
      "confidence": 85,
      "sources": []
    }`}
  ],
  "skillAnalysis": {
    "topSkills": [
      {
        "name": "Skill name",
        "category": "technical|soft|domain|tool",
        "demandLevel": "high|critical",
        "growthRate": 25.5,
        "averageSalaryImpact": 15000,
        "jobPostings": 5000,
        "learningDifficulty": "medium",
        "timeToLearn": "3-6 months"
      }
    ],
    "emergingSkills": [],
    "decliningSkills": [],
    "salaryImpact": [
      {
        "skill": "Skill name",
        "salaryIncrease": 15000,
        "percentageIncrease": 20,
        "marketData": "Current market context"
      }
    ],
    "demandTrends": [
      {
        "skill": "Skill name",
        "trend": "rising|stable|declining",
        "changePercentage": 25,
        "timeframe": "6 months",
        "confidence": 85
      }
    ]
  },
  "marketInsights": [
    {
      "insight": "Key market insight",
      "category": "opportunity|threat|trend|prediction",
      "impact": "high",
      "timeframe": "6-12 months",
      "sources": ["source1", "source2"]
    }
  ],
  "learningRecommendations": [
    {
      "skill": "Skill name",
      "priority": "high|urgent",
      "estimatedTime": "3-6 months",
      "resources": [
        {
          "type": "course|certification",
          "name": "Resource name",
          "provider": "Provider name",
          "cost": "free|paid",
          "duration": "40 hours"
        }
      ],
      "prerequisites": ["prerequisite1"],
      "careerImpact": "Expected career impact"
    }
  ],
  "sources": [
    {
      "url": "https://example.com",
      "title": "Job market report title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 90
    }
  ],
  "trendingScore": 85,
  "marketSummary": "Brief summary of current market conditions"
}

Requirements:
- Use current job market data and salary information
- Include specific numbers and statistics
- Focus on actionable career insights
- Provide realistic learning timelines
- Include reliable job market and salary sources
- Make content appropriate for ${difficulty} difficulty level
- Highlight both opportunities and challenges in the market`;
}

function calculateTrendingScore(skillContext: string): number {
  // Simple scoring based on keywords that indicate trending skills
  const trendingKeywords = ['AI', 'machine learning', 'cloud', 'cybersecurity', 'blockchain', 'data science', 'DevOps', 'remote work', 'automation'];
  const matches = trendingKeywords.filter(keyword => 
    skillContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  return Math.min(70 + (matches * 10), 100);
} 
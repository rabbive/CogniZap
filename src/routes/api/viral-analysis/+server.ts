import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface ViralAnalysisQuery {
  platform: 'all' | 'twitter' | 'tiktok' | 'youtube' | 'instagram' | 'reddit';
  contentType: 'all' | 'educational' | 'news' | 'entertainment' | 'science' | 'technology';
  timeframe: 'live' | 'today' | 'week' | 'month';
  viralityThreshold: 'trending' | 'viral' | 'mega-viral';
  analysisDepth: 'surface' | 'detailed' | 'comprehensive';
  generateContent: 'flashcards' | 'quiz' | 'both';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ViralAnalysisResult {
  platform: string;
  contentType: string;
  generatedContent: any[];
  viralContent: ViralContent[];
  trendAnalysis: TrendAnalysis;
  educationalInsights: EducationalInsight[];
  viralityMetrics: ViralityMetrics;
  sources: Source[];
  lastUpdated: Date;
  viralScore: number;
}

interface ViralContent {
  id: string;
  title: string;
  description: string;
  platform: string;
  creator: Creator;
  metrics: ContentMetrics;
  viralityFactors: ViralityFactor[];
  educationalValue: EducationalValue;
  factCheck: FactCheck;
  relatedTopics: string[];
  timestamp: Date;
  url?: string;
  contentCategory: string;
}

interface Creator {
  username: string;
  displayName?: string;
  followers: number;
  verified: boolean;
  influence: 'low' | 'medium' | 'high' | 'mega';
  expertise: string[];
}

interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  viralityScore: number;
  growthRate: number;
  peakTime: Date;
}

interface ViralityFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  contribution: number; // percentage
}

interface EducationalValue {
  score: number;
  learningObjectives: string[];
  keyTakeaways: string[];
  misconceptions?: string[];
  furtherReading: string[];
  applicability: 'low' | 'medium' | 'high';
}

interface FactCheck {
  status: 'verified' | 'partially-true' | 'misleading' | 'false' | 'unverified';
  confidence: number;
  sources: Source[];
  corrections?: string[];
  context: string;
}

interface TrendAnalysis {
  emergingTrends: EmergingTrend[];
  viralPatterns: ViralPattern[];
  platformInsights: PlatformInsight[];
  audienceAnalysis: AudienceAnalysis;
  predictedTrends: PredictedTrend[];
}

interface EmergingTrend {
  trend: string;
  momentum: number;
  platforms: string[];
  demographics: string[];
  timeframe: string;
  relatedContent: string[];
}

interface ViralPattern {
  pattern: string;
  frequency: number;
  effectiveness: number;
  examples: string[];
  applicability: string[];
}

interface PlatformInsight {
  platform: string;
  viralCharacteristics: string[];
  optimalTiming: string;
  contentFormats: string[];
  audiencePreferences: string[];
}

interface AudienceAnalysis {
  primaryDemographics: string[];
  interests: string[];
  engagementPatterns: string[];
  learningPreferences: string[];
  contentConsumption: string[];
}

interface PredictedTrend {
  prediction: string;
  probability: number;
  timeframe: string;
  indicators: string[];
  potential: 'low' | 'medium' | 'high' | 'explosive';
}

interface EducationalInsight {
  insight: string;
  category: 'learning-pattern' | 'content-strategy' | 'engagement-method' | 'knowledge-gap';
  impact: 'low' | 'medium' | 'high';
  applications: string[];
  evidence: string[];
}

interface ViralityMetrics {
  totalViralContent: number;
  averageViralityScore: number;
  topPerformingCategories: string[];
  peakViralTimes: string[];
  crossPlatformTrends: string[];
  educationalViralContent: number;
}

interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishedDate: Date;
  platform: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const query: ViralAnalysisQuery = await request.json();
    const { platform, contentType, timeframe, viralityThreshold, analysisDepth, generateContent, count, difficulty } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createViralAnalysisPrompt(query);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media analyst and educational content strategist with access to real-time viral content data across platforms. Analyze viral trends, identify educational opportunities, and create learning content from trending topics. Always verify information accuracy and assess educational value objectively.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 8000
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

    const viralData = JSON.parse(content.trim());
    
    const result: ViralAnalysisResult = {
      platform: viralData.platform || platform,
      contentType: viralData.contentType || contentType,
      generatedContent: viralData.content?.map((item: any, index: number) => {
        const baseContent = {
          id: `viral-content-${Date.now()}-${index}`,
          topic: `Viral Content - ${contentType}`,
          createdAt: new Date(),
          sources: item.sources || [],
          viralContext: item.viralContext,
          trendingnessScore: calculateViralTrendingScore(item.viralContext),
          factCheckStatus: item.factCheckStatus || 'verified',
          confidenceScore: item.confidence || 85,
          educationalValue: item.educationalValue || 'medium'
        };

        if (generateContent === 'flashcards' || generateContent === 'both') {
          return {
            ...baseContent,
            question: item.question,
            answer: item.answer,
            difficulty: item.difficulty || difficulty
          };
        } else {
          return {
            ...baseContent,
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation
          };
        }
      }) || [],
      viralContent: viralData.viralContent?.map((content: any) => ({
        id: content.id || `viral-${Date.now()}`,
        title: content.title,
        description: content.description,
        platform: content.platform,
        creator: {
          username: content.creator?.username || 'unknown',
          displayName: content.creator?.displayName,
          followers: content.creator?.followers || 0,
          verified: content.creator?.verified || false,
          influence: content.creator?.influence || 'medium',
          expertise: content.creator?.expertise || []
        },
        metrics: {
          views: content.metrics?.views || 0,
          likes: content.metrics?.likes || 0,
          shares: content.metrics?.shares || 0,
          comments: content.metrics?.comments || 0,
          engagementRate: content.metrics?.engagementRate || 0,
          viralityScore: content.metrics?.viralityScore || 0,
          growthRate: content.metrics?.growthRate || 0,
          peakTime: new Date(content.metrics?.peakTime || Date.now())
        },
        viralityFactors: content.viralityFactors || [],
        educationalValue: {
          score: content.educationalValue?.score || 50,
          learningObjectives: content.educationalValue?.learningObjectives || [],
          keyTakeaways: content.educationalValue?.keyTakeaways || [],
          misconceptions: content.educationalValue?.misconceptions,
          furtherReading: content.educationalValue?.furtherReading || [],
          applicability: content.educationalValue?.applicability || 'medium'
        },
        factCheck: {
          status: content.factCheck?.status || 'unverified',
          confidence: content.factCheck?.confidence || 70,
          sources: content.factCheck?.sources?.map((s: any) => ({
            url: s.url,
            title: s.title,
            domain: new URL(s.url).hostname,
            reliability: s.reliability || 80,
            publishedDate: new Date(s.publishedDate),
            platform: content.platform
          })) || [],
          corrections: content.factCheck?.corrections,
          context: content.factCheck?.context || ''
        },
        relatedTopics: content.relatedTopics || [],
        timestamp: new Date(content.timestamp),
        url: content.url,
        contentCategory: content.contentCategory || contentType
      })) || [],
      trendAnalysis: {
        emergingTrends: viralData.trendAnalysis?.emergingTrends || [],
        viralPatterns: viralData.trendAnalysis?.viralPatterns || [],
        platformInsights: viralData.trendAnalysis?.platformInsights || [],
        audienceAnalysis: viralData.trendAnalysis?.audienceAnalysis || {
          primaryDemographics: [],
          interests: [],
          engagementPatterns: [],
          learningPreferences: [],
          contentConsumption: []
        },
        predictedTrends: viralData.trendAnalysis?.predictedTrends || []
      },
      educationalInsights: viralData.educationalInsights || [],
      viralityMetrics: {
        totalViralContent: viralData.viralityMetrics?.totalViralContent || 0,
        averageViralityScore: viralData.viralityMetrics?.averageViralityScore || 0,
        topPerformingCategories: viralData.viralityMetrics?.topPerformingCategories || [],
        peakViralTimes: viralData.viralityMetrics?.peakViralTimes || [],
        crossPlatformTrends: viralData.viralityMetrics?.crossPlatformTrends || [],
        educationalViralContent: viralData.viralityMetrics?.educationalViralContent || 0
      },
      sources: viralData.sources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 80,
        publishedDate: new Date(s.publishedDate),
        platform: s.platform || platform
      })) || [],
      lastUpdated: new Date(),
      viralScore: viralData.viralScore || 75
    };

    return json({
      success: true,
      data: result,
      query,
      viralSummary: viralData.viralSummary
    });

  } catch (error) {
    console.error('Viral analysis API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze viral content'
    }, { status: 500 });
  }
};

function createViralAnalysisPrompt(query: ViralAnalysisQuery): string {
  const { platform, contentType, timeframe, viralityThreshold, analysisDepth, generateContent, count, difficulty } = query;

  const timeframeMap = {
    'live': 'the last few hours',
    'today': 'today',
    'week': 'this week',
    'month': 'this month'
  };

  const platformContext = platform === 'all' ? 'all major social media platforms' : platform;
  const contentTypeContext = contentType === 'all' ? 'all types of content' : `${contentType} content`;
  const viralityContext = {
    'trending': 'trending content with significant engagement',
    'viral': 'viral content with massive reach',
    'mega-viral': 'mega-viral content with unprecedented engagement'
  };

  return `Analyze ${viralityContext[viralityThreshold]} on ${platformContext} featuring ${contentTypeContext} from ${timeframeMap[timeframe]}.

Provide ${analysisDepth} analysis and generate ${count} educational ${generateContent} based on viral content insights.

For ${generateContent === 'flashcards' ? 'each flashcard' : generateContent === 'quiz' ? 'each quiz question' : 'each piece of content'}, include:
1. Viral content context and educational value
2. Fact-checking and accuracy assessment
3. Learning objectives and key takeaways
4. Virality factors and engagement patterns
5. Reliable sources and verification

Return a JSON object with this structure:
{
  "platform": "${platform}",
  "contentType": "${contentType}",
  "content": [
    ${generateContent === 'flashcards' || generateContent === 'both' ? `{
      "question": "Question based on viral content insights",
      "answer": "Answer with educational context and viral analysis",
      "difficulty": "${difficulty}",
      "viralContext": "Specific viral content context",
      "confidence": 85,
      "educationalValue": "high|medium|low",
      "factCheckStatus": "verified|partially-true|misleading|false",
      "sources": []
    }` : `{
      "question": "Question about viral content or trends",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation with viral content context",
      "viralContext": "Specific viral content context",
      "confidence": 85,
      "educationalValue": "high|medium|low",
      "factCheckStatus": "verified|partially-true|misleading|false",
      "sources": []
    }`}
  ],
  "viralContent": [
    {
      "id": "viral-1",
      "title": "Viral content title",
      "description": "Content description",
      "platform": "${platform === 'all' ? 'twitter|tiktok|youtube|instagram|reddit' : platform}",
      "creator": {
        "username": "creator_username",
        "displayName": "Creator Name",
        "followers": 1000000,
        "verified": true,
        "influence": "high|mega",
        "expertise": ["expertise1", "expertise2"]
      },
      "metrics": {
        "views": 10000000,
        "likes": 500000,
        "shares": 100000,
        "comments": 50000,
        "engagementRate": 15.5,
        "viralityScore": 95,
        "growthRate": 250,
        "peakTime": "2024-01-15T10:00:00Z"
      },
      "viralityFactors": [
        {
          "factor": "Timing",
          "impact": "high",
          "description": "Posted at optimal time",
          "contribution": 25
        }
      ],
      "educationalValue": {
        "score": 85,
        "learningObjectives": ["objective1", "objective2"],
        "keyTakeaways": ["takeaway1", "takeaway2"],
        "misconceptions": ["misconception1"],
        "furtherReading": ["resource1", "resource2"],
        "applicability": "high"
      },
      "factCheck": {
        "status": "verified|partially-true|misleading|false",
        "confidence": 90,
        "sources": [],
        "corrections": ["correction1"],
        "context": "Fact-check context"
      },
      "relatedTopics": ["topic1", "topic2"],
      "timestamp": "2024-01-15T10:00:00Z",
      "url": "https://platform.com/content",
      "contentCategory": "${contentType}"
    }
  ],
  "trendAnalysis": {
    "emergingTrends": [
      {
        "trend": "Trend description",
        "momentum": 85,
        "platforms": ["platform1", "platform2"],
        "demographics": ["demographic1"],
        "timeframe": "2-4 weeks",
        "relatedContent": ["content1", "content2"]
      }
    ],
    "viralPatterns": [
      {
        "pattern": "Pattern description",
        "frequency": 75,
        "effectiveness": 90,
        "examples": ["example1", "example2"],
        "applicability": ["context1", "context2"]
      }
    ],
    "platformInsights": [
      {
        "platform": "${platform}",
        "viralCharacteristics": ["characteristic1"],
        "optimalTiming": "Peak engagement time",
        "contentFormats": ["format1", "format2"],
        "audiencePreferences": ["preference1"]
      }
    ],
    "audienceAnalysis": {
      "primaryDemographics": ["demographic1"],
      "interests": ["interest1", "interest2"],
      "engagementPatterns": ["pattern1"],
      "learningPreferences": ["preference1"],
      "contentConsumption": ["behavior1"]
    },
    "predictedTrends": [
      {
        "prediction": "Future trend prediction",
        "probability": 75,
        "timeframe": "1-3 months",
        "indicators": ["indicator1"],
        "potential": "high|explosive"
      }
    ]
  },
  "educationalInsights": [
    {
      "insight": "Educational insight from viral analysis",
      "category": "learning-pattern|content-strategy|engagement-method|knowledge-gap",
      "impact": "high",
      "applications": ["application1"],
      "evidence": ["evidence1"]
    }
  ],
  "viralityMetrics": {
    "totalViralContent": 50,
    "averageViralityScore": 78,
    "topPerformingCategories": ["category1", "category2"],
    "peakViralTimes": ["time1", "time2"],
    "crossPlatformTrends": ["trend1", "trend2"],
    "educationalViralContent": 15
  },
  "sources": [
    {
      "url": "https://example.com",
      "title": "Viral content source",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 85,
      "platform": "${platform}"
    }
  ],
  "viralScore": 85,
  "viralSummary": "Summary of viral content landscape"
}

Requirements:
- Use current viral content data and trending topics
- Verify accuracy and fact-check viral claims
- Assess educational value objectively
- Analyze virality factors and engagement patterns
- Include cross-platform trend analysis
- Provide actionable educational insights
- Include reliable sources and verification
- Make content appropriate for ${difficulty} difficulty level
- Focus on learning opportunities from viral trends
- Highlight both educational value and potential misinformation`;
}

function calculateViralTrendingScore(viralContext: string): number {
  // Calculate trending score based on viral content indicators
  const viralKeywords = ['viral', 'trending', 'millions', 'breakthrough', 'explosive', 'phenomenon', 'sensation'];
  const engagementKeywords = ['shares', 'likes', 'comments', 'views', 'engagement', 'reach', 'audience'];
  const educationalKeywords = ['learn', 'educational', 'explains', 'teaches', 'demonstrates', 'science', 'facts'];
  
  const viralMatches = viralKeywords.filter(keyword => 
    viralContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  const engagementMatches = engagementKeywords.filter(keyword => 
    viralContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  const educationalMatches = educationalKeywords.filter(keyword => 
    viralContext.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  return Math.min(50 + (viralMatches * 20) + (engagementMatches * 10) + (educationalMatches * 15), 100);
} 
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

interface CompetitionQuery {
  competitionType: 'daily-challenge' | 'trending-quiz' | 'breaking-news' | 'skill-battle' | 'knowledge-race';
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  duration: 5 | 10 | 15 | 30; // minutes
  participantCount?: number;
  realTimeData: boolean;
}

interface CompetitionResult {
  competitionId: string;
  competitionType: string;
  title: string;
  description: string;
  questions: CompetitionQuestion[];
  leaderboard: LeaderboardEntry[];
  realTimeUpdates: RealTimeUpdate[];
  competitionStats: CompetitionStats;
  rewards: Reward[];
  sources: Source[];
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface CompetitionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number; // seconds
  category: string;
  realTimeContext?: string;
  sources: Source[];
  bonusInfo?: string;
  streakMultiplier?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  accuracy: number;
  averageTime: number;
  streak: number;
  badges: Badge[];
  lastActive: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

interface RealTimeUpdate {
  id: string;
  type: 'new-question' | 'leaderboard-change' | 'breaking-news' | 'bonus-round' | 'time-extension';
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  affectedUsers?: string[];
}

interface CompetitionStats {
  totalParticipants: number;
  averageScore: number;
  averageAccuracy: number;
  averageCompletionTime: number;
  mostDifficultQuestion: string;
  easiestQuestion: string;
  trendingTopics: string[];
  engagementMetrics: EngagementMetrics;
}

interface EngagementMetrics {
  questionsAnswered: number;
  averageTimePerQuestion: number;
  dropoffRate: number;
  returnRate: number;
  socialShares: number;
}

interface Reward {
  type: 'points' | 'badge' | 'achievement' | 'unlock' | 'streak-bonus';
  name: string;
  description: string;
  value: number;
  criteria: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishedDate: Date;
  category: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const query: CompetitionQuery = await request.json();
    const { competitionType, topic, difficulty, duration, participantCount, realTimeData } = query;

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return json({
        success: false,
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    const prompt = createCompetitionPrompt(query);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert game designer and educator specializing in competitive learning experiences. Create engaging, educational competitions that incorporate real-time information, current events, and trending topics. Design questions that are both challenging and educational, with appropriate difficulty progression and real-time relevance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
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

    const competitionData = JSON.parse(content.trim());
    
    const competitionId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);

    const result: CompetitionResult = {
      competitionId,
      competitionType: competitionData.competitionType || competitionType,
      title: competitionData.title,
      description: competitionData.description,
      questions: competitionData.questions.map((q: any, index: number) => ({
        id: `q-${competitionId}-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || difficulty,
        points: calculatePoints(q.difficulty || difficulty, realTimeData),
        timeLimit: calculateTimeLimit(q.difficulty || difficulty),
        category: q.category || topic || 'General',
        realTimeContext: realTimeData ? q.realTimeContext : undefined,
        sources: q.sources?.map((s: any) => ({
          url: s.url,
          title: s.title,
          domain: new URL(s.url).hostname,
          reliability: s.reliability || 85,
          publishedDate: new Date(s.publishedDate),
          category: q.category || topic || 'General'
        })) || [],
        bonusInfo: q.bonusInfo,
        streakMultiplier: q.streakMultiplier || 1
      })),
      leaderboard: generateInitialLeaderboard(participantCount || 0),
      realTimeUpdates: realTimeData ? generateRealTimeUpdates(competitionType) : [],
      competitionStats: {
        totalParticipants: participantCount || 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageCompletionTime: 0,
        mostDifficultQuestion: '',
        easiestQuestion: '',
        trendingTopics: competitionData.trendingTopics || [],
        engagementMetrics: {
          questionsAnswered: 0,
          averageTimePerQuestion: 0,
          dropoffRate: 0,
          returnRate: 0,
          socialShares: 0
        }
      },
      rewards: competitionData.rewards?.map((r: any) => ({
        type: r.type,
        name: r.name,
        description: r.description,
        value: r.value,
        criteria: r.criteria,
        rarity: r.rarity,
        icon: r.icon
      })) || generateDefaultRewards(competitionType),
      sources: competitionData.sources?.map((s: any) => ({
        url: s.url,
        title: s.title,
        domain: new URL(s.url).hostname,
        reliability: s.reliability || 85,
        publishedDate: new Date(s.publishedDate),
        category: competitionType
      })) || [],
      createdAt: now,
      expiresAt,
      isActive: true
    };

    return json({
      success: true,
      data: result,
      query,
      competitionCode: competitionId.split('-')[1] // Short code for sharing
    });

  } catch (error) {
    console.error('Learning competitions API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create learning competition'
    }, { status: 500 });
  }
};

function createCompetitionPrompt(query: CompetitionQuery): string {
  const { competitionType, topic, difficulty, duration, realTimeData } = query;

  const competitionTypeContext = {
    'daily-challenge': 'daily knowledge challenge with current events and trending topics',
    'trending-quiz': 'quiz based on trending topics and viral content',
    'breaking-news': 'real-time quiz about breaking news and current events',
    'skill-battle': 'competitive skill assessment with practical applications',
    'knowledge-race': 'fast-paced knowledge race with time pressure'
  };

  const topicContext = topic ? ` focused on ${topic}` : ' covering diverse current topics';

  return `Create a ${competitionTypeContext[competitionType]}${topicContext} for a ${duration}-minute competition.

${realTimeData ? 'Use the most current real-time information, breaking news, and trending topics available.' : 'Use recent information and current topics.'}

Generate 10-15 questions with ${difficulty === 'mixed' ? 'mixed difficulty levels' : `${difficulty} difficulty`}.

For each question, include:
1. Current, relevant content ${realTimeData ? 'with real-time context' : ''}
2. Educational value and practical application
3. Competitive elements (time pressure, bonus points)
4. Reliable sources and fact-checking
5. Engaging explanations and bonus information

Return a JSON object with this structure:
{
  "competitionType": "${competitionType}",
  "title": "Engaging competition title",
  "description": "Competition description and rules",
  "questions": [
    {
      "question": "Question text incorporating current information",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation with educational value",
      "difficulty": "easy|medium|hard",
      "category": "Question category",
      ${realTimeData ? '"realTimeContext": "Current real-time context and relevance",' : ''}
      "bonusInfo": "Additional interesting facts or context",
      "streakMultiplier": 1.5,
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
  "rewards": [
    {
      "type": "points|badge|achievement|unlock|streak-bonus",
      "name": "Reward name",
      "description": "Reward description",
      "value": 100,
      "criteria": "How to earn this reward",
      "rarity": "common|rare|epic|legendary",
      "icon": "reward-icon"
    }
  ],
  "trendingTopics": ["topic1", "topic2", "topic3"],
  "sources": [
    {
      "url": "https://example.com",
      "title": "Competition source title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 90
    }
  ]
}

Requirements:
- Create engaging, competitive questions with educational value
- Include current events and trending topics
- Vary difficulty appropriately for competitive balance
- Provide detailed explanations for learning
- Include reliable, current sources
- Design rewards that motivate continued participation
- Ensure questions are fact-checkable and accurate
- ${realTimeData ? 'Incorporate real-time data and breaking news' : 'Use recent, relevant information'}
- Make content appropriate for competitive learning environment
- Include bonus information to enhance engagement`;
}

function calculatePoints(difficulty: string, realTimeData: boolean): number {
  const basePoints = {
    'easy': 10,
    'medium': 20,
    'hard': 30
  };
  
  const points = basePoints[difficulty as keyof typeof basePoints] || 20;
  return realTimeData ? Math.floor(points * 1.5) : points; // Bonus for real-time questions
}

function calculateTimeLimit(difficulty: string): number {
  const timeLimits = {
    'easy': 30,
    'medium': 45,
    'hard': 60
  };
  
  return timeLimits[difficulty as keyof typeof timeLimits] || 45;
}

function generateInitialLeaderboard(participantCount: number): LeaderboardEntry[] {
  // Generate sample leaderboard entries for demonstration
  const sampleUsers = ['QuizMaster', 'NewsNinja', 'FactFinder', 'TrendTracker', 'InfoHunter'];
  
  return sampleUsers.slice(0, Math.min(participantCount, 5)).map((username, index) => ({
    rank: index + 1,
    userId: `user-${index + 1}`,
    username,
    score: Math.floor(Math.random() * 100),
    accuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
    averageTime: Math.floor(Math.random() * 20) + 15, // 15-35 seconds
    streak: Math.floor(Math.random() * 5),
    badges: [],
    lastActive: new Date()
  }));
}

function generateRealTimeUpdates(competitionType: string): RealTimeUpdate[] {
  const updates = [
    {
      id: 'update-1',
      type: 'new-question' as const,
      content: 'New breaking news question added!',
      timestamp: new Date(),
      priority: 'high' as const
    },
    {
      id: 'update-2',
      type: 'bonus-round' as const,
      content: 'Bonus round activated - double points for next 2 minutes!',
      timestamp: new Date(),
      priority: 'urgent' as const
    }
  ];
  
  return competitionType === 'breaking-news' ? updates : [];
}

function generateDefaultRewards(competitionType: string): Reward[] {
  return [
    {
      type: 'badge',
      name: 'Speed Demon',
      description: 'Answer 5 questions in under 20 seconds each',
      value: 50,
      criteria: 'Fast answering',
      rarity: 'rare',
      icon: 'speed-icon'
    },
    {
      type: 'achievement',
      name: 'Perfect Score',
      description: 'Get 100% accuracy in a competition',
      value: 100,
      criteria: 'Perfect accuracy',
      rarity: 'epic',
      icon: 'perfect-icon'
    },
    {
      type: 'streak-bonus',
      name: 'Hot Streak',
      description: 'Answer 3 questions correctly in a row',
      value: 25,
      criteria: '3 correct answers in a row',
      rarity: 'common',
      icon: 'streak-icon'
    }
  ];
} 
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
  const { competitionType, category, includeLeaderboard } = await request.json();
  
  try {
    // Return mock competition data
    const competitionData = {
      activeCompetitions: [
        {
          id: "weekly-science-2024",
          title: "Weekly Science Challenge",
          description: "Test your knowledge of recent scientific discoveries",
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          participants: 1247,
          prizePool: 5000,
          difficulty: "intermediate",
          questionCount: 20,
          category: category || "science",
          joined: false
        },
        {
          id: "daily-tech-2024",
          title: "Daily Tech Quiz",
          description: "Stay updated with the latest technology trends",
          endTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
          participants: 892,
          prizePool: 1000,
          difficulty: "beginner",
          questionCount: 10,
          category: "technology",
          joined: true
        }
      ],
      leaderboard: includeLeaderboard ? [
        {
          username: "ScienceExplorer",
          level: "Expert",
          points: 2850,
          accuracy: 94
        },
        {
          username: "TechGuru42",
          level: "Advanced",
          points: 2720,
          accuracy: 91
        },
        {
          username: "QuizMaster",
          level: "Expert",
          points: 2680,
          accuracy: 89
        },
        {
          username: "BrainPower",
          level: "Intermediate",
          points: 2540,
          accuracy: 87
        },
        {
          username: "KnowledgeSeeker",
          level: "Advanced",
          points: 2420,
          accuracy: 92
        }
      ] : [],
      recentAchievements: [
        {
          icon: "🏆",
          title: "Quiz Champion",
          description: "Won 5 consecutive competitions",
          points: 500
        },
        {
          icon: "🔥",
          title: "Streak Master",
          description: "Maintained 30-day learning streak",
          points: 300
        },
        {
          icon: "🎯",
          title: "Perfect Score",
          description: "Achieved 100% accuracy in quiz",
          points: 200
        }
      ],
      stats: {
        totalParticipants: 15420,
        averageScore: 78,
        completionRate: 85
      }
    };

    return json({
      success: true,
      data: competitionData,
      competitionType,
      category
    });

  } catch (error) {
    return json({
      success: false,
      error: 'Failed to fetch competition data'
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
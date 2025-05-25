import { writable, derived } from 'svelte/store';
import type { 
  StudyPreferences, 
  TrendingTopic, 
  NewsBasedContent, 
  LearningAnalytics,
  Source,
  FactCheckResult 
} from '$lib/types';

// User preferences store
export const userPreferences = writable<StudyPreferences>({
  includeCurrentEvents: true,
  sourceRecency: 'week',
  expertiseLevel: 'intermediate',
  industryFocus: [],
  factCheckLevel: 'thorough',
  autoRefresh: true,
  trendingnessThreshold: 70
});

// Trending topics store
export const trendingTopics = writable<TrendingTopic[]>([]);

// News-based content store
export const newsContent = writable<NewsBasedContent[]>([]);

// Learning analytics store
export const learningAnalytics = writable<LearningAnalytics>({
  topicPopularity: {},
  learningProgress: {},
  trendsFollowed: [],
  factCheckAccuracy: 0,
  lastActive: new Date()
});

// Real-time updates store
export const realTimeUpdates = writable<{
  lastUpdate: Date;
  pendingUpdates: number;
  isConnected: boolean;
}>({
  lastUpdate: new Date(),
  pendingUpdates: 0,
  isConnected: false
});

// Fact-check results store
export const factCheckResults = writable<FactCheckResult[]>([]);

// Sources store for current content
export const currentSources = writable<Source[]>([]);

// Derived store for filtered trending topics based on user preferences
export const filteredTrendingTopics = derived(
  [trendingTopics, userPreferences],
  ([$trendingTopics, $userPreferences]) => {
    return $trendingTopics.filter(topic => 
      topic.score >= $userPreferences.trendingnessThreshold &&
      ($userPreferences.industryFocus.length === 0 || 
       $userPreferences.industryFocus.includes(topic.category))
    );
  }
);

// Enhanced actions interface for type safety
interface EnhancedActions {
  updatePreferences: (newPreferences: Partial<StudyPreferences>) => void;
  addTrendingTopic: (topic: TrendingTopic) => void;
  addNewsContent: (content: NewsBasedContent) => void;
  updateAnalytics: (updates: Partial<LearningAnalytics>) => void;
  trackTopicInteraction: (topic: string) => void;
  addFactCheckResult: (result: FactCheckResult) => void;
  updateSources: (sources: Source[]) => void;
  clearAll: () => void;
}

// Actions for enhanced features
export const enhancedActions: EnhancedActions = {
  // Update user preferences
  updatePreferences: (newPreferences: Partial<StudyPreferences>) => {
    userPreferences.update(current => ({ ...current, ...newPreferences }));
  },

  // Add trending topic
  addTrendingTopic: (topic: TrendingTopic) => {
    trendingTopics.update(topics => {
      const existing = topics.findIndex(t => t.topic === topic.topic);
      if (existing >= 0) {
        topics[existing] = topic;
      } else {
        topics.push(topic);
      }
      return topics.sort((a, b) => b.score - a.score);
    });
  },

  // Add news content
  addNewsContent: (content: NewsBasedContent) => {
    newsContent.update(items => [content, ...items].slice(0, 50)); // Keep latest 50
  },

  // Update learning analytics
  updateAnalytics: (updates: Partial<LearningAnalytics>) => {
    learningAnalytics.update(current => ({ ...current, ...updates }));
  },

  // Track topic interaction
  trackTopicInteraction: (topic: string) => {
    learningAnalytics.update(current => ({
      ...current,
      topicPopularity: {
        ...current.topicPopularity,
        [topic]: (current.topicPopularity[topic] || 0) + 1
      },
      lastActive: new Date()
    }));
  },

  // Add fact-check result
  addFactCheckResult: (result: FactCheckResult) => {
    factCheckResults.update(results => [result, ...results].slice(0, 100));
  },

  // Update sources
  updateSources: (sources: Source[]) => {
    currentSources.set(sources);
  },

  // Clear all data
  clearAll: () => {
    trendingTopics.set([]);
    newsContent.set([]);
    factCheckResults.set([]);
    currentSources.set([]);
  }
};

// Auto-save preferences to localStorage
if (typeof window !== 'undefined') {
  userPreferences.subscribe(prefs => {
    localStorage.setItem('cognizap-preferences', JSON.stringify(prefs));
  });

  // Load preferences from localStorage
  const savedPrefs = localStorage.getItem('cognizap-preferences');
  if (savedPrefs) {
    try {
      userPreferences.set(JSON.parse(savedPrefs));
    } catch (e) {
      console.warn('Failed to load saved preferences:', e);
    }
  }
} 